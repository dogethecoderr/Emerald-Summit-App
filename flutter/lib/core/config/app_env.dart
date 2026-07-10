import 'package:flutter_dotenv/flutter_dotenv.dart';

abstract final class AppEnv {
  static const _placeholderKey = 'your-anon-key-here';

  static bool get isConfigured {
    if (supabaseUrl.isEmpty || supabaseAnonKey.isEmpty) return false;
    if (supabaseAnonKey == _placeholderKey) return false;
    if (!supabaseUrl.contains('supabase.co')) return false;
    return true;
  }

  static String get supabaseUrl =>
      dotenv.maybeGet('SUPABASE_URL')?.trim() ?? '';

  static String get supabaseAnonKey =>
      dotenv.maybeGet('SUPABASE_ANON_KEY')?.trim() ?? '';

  static String get setupMessage => '''
Supabase is not configured yet.

1. Copy .env.example to .env
2. In Supabase: Project Settings (gear) → API
3. Paste Project URL and anon public key into .env
4. Stop the app and run: flutter run -d chrome
   (Hot reload does not reload .env on web)
''';
}
