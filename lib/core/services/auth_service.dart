import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../config/app_env.dart';
import '../models/discipline.dart';
import '../models/user_role.dart';
import 'auth_callback_handler.dart';

abstract final class AuthService {
  static const _pendingRoleKey = 'pending_user_role';

  static SupabaseClient get client => Supabase.instance.client;

  static Session? get session => client.auth.currentSession;

  static bool get isSignedIn => session != null;

  static Stream<AuthState> get authStateChanges =>
      client.auth.onAuthStateChange;

  static Future<void> savePendingRole(UserRole role) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_pendingRoleKey, role.name);
  }

  static Future<UserRole?> takePendingRole() async {
    final prefs = await SharedPreferences.getInstance();
    final value = prefs.getString(_pendingRoleKey);
    if (value == null) return null;
    await prefs.remove(_pendingRoleKey);

    for (final role in UserRole.values) {
      if (role.name == value) return role;
    }
    return null;
  }

  static Future<void> sendMagicLink({
    required String email,
    required UserRole role,
  }) async {
    await savePendingRole(role);
    await client.auth.signInWithOtp(
      email: email.trim(),
      emailRedirectTo: AuthCallbackHandler.redirectUrl,
    );
  }

  static Future<void> signInWithGoogle({required UserRole role}) async {
    await savePendingRole(role);
    await client.auth.signInWithOAuth(
      OAuthProvider.google,
      redirectTo: AuthCallbackHandler.redirectUrl,
      authScreenLaunchMode:
          kIsWeb ? LaunchMode.platformDefault : LaunchMode.externalApplication,
      queryParams: const {
        // Force Google to show the account picker instead of silent SSO.
        'prompt': 'select_account',
      },
    );
  }

  static Future<void> saveProfile({
    required String name,
    String? phone,
    UserDiscipline? discipline,
    String? bio,
  }) async {
    final user = client.auth.currentUser;
    if (user == null) throw const AuthException('Not signed in.');

    final email = user.email;
    if (email == null || email.isEmpty) {
      throw const AuthException('Signed-in account has no email address.');
    }

    final payload = <String, dynamic>{
      'name': name,
      'profile_setup_complete': true,
      if (phone != null && phone.isNotEmpty) 'phone': phone,
      if (discipline != null) 'discipline': discipline.name,
      if (bio != null && bio.isNotEmpty) 'bio': bio,
    };

    final existing = await getCurrentProfile();
    if (existing == null) {
      final pendingRole = await takePendingRole();
      if (pendingRole == null) {
        throw const AuthException(
          'No role selected. Go back, pick a role, and sign in again.',
        );
      }

      await client.from('users').insert({
        'id': user.id,
        'role': pendingRole.name,
        'email': email,
        ...payload,
      });
      return;
    }

    await client.from('users').update(payload).eq('id', user.id);
  }

  /// True when the user still needs to finish the profile-setup screen.
  static bool needsProfileSetup(Map<String, dynamic>? profile) {
    if (profile == null) return true;
    return profile['profile_setup_complete'] != true;
  }

  static Future<Map<String, dynamic>?> getCurrentProfile() async {
    final user = client.auth.currentUser;
    if (user == null) return null;

    return client.from('users').select().eq('id', user.id).maybeSingle();
  }

  static Future<void> signOut() async {
    await client.auth.signOut(scope: SignOutScope.local);
    if (kIsWeb && AppEnv.isConfigured) {
      AuthCallbackHandler.clearWebAuthParams();
      AuthCallbackHandler.clearWebSessionStorage(AppEnv.supabaseUrl);
    }
  }
}
