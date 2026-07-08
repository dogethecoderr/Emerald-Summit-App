import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'core/config/app_env.dart';
import 'core/services/auth_callback_handler.dart';
import 'core/services/auth_service.dart';
import 'core/theme/app_theme.dart';
import 'features/home/home_screen.dart';
import 'features/welcome/welcome_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  try {
    await dotenv.load(fileName: '.env');
  } catch (error) {
    debugPrint('Could not load .env: $error');
  }

  if (AppEnv.isConfigured) {
    await Supabase.initialize(
      url: AppEnv.supabaseUrl,
      publishableKey: AppEnv.supabaseAnonKey,
      authOptions: const FlutterAuthClientOptions(
        authFlowType: AuthFlowType.pkce,
      ),
    );

    // Exchanges OAuth code in the URL for a session.
    await AuthCallbackHandler.handleWebRedirectIfPresent();
    await _recoverFromInvalidSession();
  } else {
    debugPrint(AppEnv.setupMessage);
  }

  runApp(const EmeraldSummitApp());
}

Future<void> _recoverFromInvalidSession() async {
  final session = Supabase.instance.client.auth.currentSession;
  if (session == null) return;

  try {
    await Supabase.instance.client.auth.refreshSession();
  } on AuthException catch (error) {
    debugPrint('Clearing invalid auth session: ${error.message}');
    await Supabase.instance.client.auth.signOut();
  }
}

class EmeraldSummitApp extends StatelessWidget {
  const EmeraldSummitApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Emerald Summit',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      home: const _AppEntry(),
    );
  }
}

/// Sends signed-in users (e.g. after an OAuth redirect reload) straight to
/// [HomeScreen], which shows profile setup when no row exists yet.
class _AppEntry extends StatelessWidget {
  const _AppEntry();

  @override
  Widget build(BuildContext context) {
    if (!AppEnv.isConfigured) {
      return const WelcomeScreen();
    }

    return StreamBuilder<AuthState>(
      stream: AuthService.authStateChanges,
      builder: (context, snapshot) {
        final session = snapshot.data?.session ?? AuthService.session;
        if (session != null) return const HomeScreen();
        return const WelcomeScreen();
      },
    );
  }
}
