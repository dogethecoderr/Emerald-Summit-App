import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'core/config/app_env.dart';
import 'core/services/auth_service.dart';
import 'core/theme/app_theme.dart';
import 'features/home/home_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  try {
    await dotenv.load(fileName: '.env');
  } catch (_) {
    // .env missing — AppEnv.isConfigured will be false.
  }

  if (AppEnv.isConfigured) {
    await Supabase.initialize(
      url: AppEnv.supabaseUrl,
      publishableKey: AppEnv.supabaseAnonKey,
    );
    await _syncProfileIfNeeded();
    Supabase.instance.client.auth.onAuthStateChange.listen((_) {
      _syncProfileIfNeeded();
    });
  }

  runApp(const EmeraldSummitApp());
}

Future<void> _syncProfileIfNeeded() async {
  if (!AuthService.isSignedIn) return;
  try {
    await AuthService.ensureUserProfile();
  } on AuthException {
    // Profile sync can fail if role wasn't saved; login flow handles that.
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
      home: const HomeScreen(),
    );
  }
}
