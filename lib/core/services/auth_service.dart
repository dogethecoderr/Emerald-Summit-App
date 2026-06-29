import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/user_role.dart';

abstract final class AuthService {
  static const _pendingRoleKey = 'pending_user_role';

  static SupabaseClient get client => Supabase.instance.client;

  static Session? get session => client.auth.currentSession;

  static bool get isSignedIn => session != null;

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
      emailRedirectTo: Uri.base.origin,
    );
  }

  static Future<void> signInWithGoogle({required UserRole role}) async {
    await savePendingRole(role);
    await client.auth.signInWithOAuth(
      OAuthProvider.google,
      redirectTo: Uri.base.origin,
    );
  }

  static Future<void> ensureUserProfile() async {
    final user = client.auth.currentUser;
    if (user == null) return;

    final existing = await client
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
    if (existing != null) return;

    final pendingRole = await takePendingRole();
    if (pendingRole == null) {
      throw const AuthException(
        'No role selected. Go back, pick a role, and sign in again.',
      );
    }

    final email = user.email;
    if (email == null || email.isEmpty) {
      throw const AuthException('Signed-in account has no email address.');
    }

    final metadataName = user.userMetadata?['full_name'] as String?;
    final name = (metadataName != null && metadataName.trim().isNotEmpty)
        ? metadataName.trim()
        : email.split('@').first;

    await client.from('users').insert({
      'id': user.id,
      'name': name,
      'role': pendingRole.name,
      'email': email,
    });
  }

  static Future<void> signOut() => client.auth.signOut();
}
