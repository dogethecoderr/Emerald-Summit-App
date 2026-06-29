import 'package:flutter_dotenv/flutter_dotenv.dart';

abstract final class AppEnv {
  static bool get isConfigured =>
      supabaseUrl.isNotEmpty && supabaseAnonKey.isNotEmpty;

  static String get supabaseUrl =>
      dotenv.maybeGet('SUPABASE_URL')?.trim() ?? '';

  static String get supabaseAnonKey =>
      dotenv.maybeGet('SUPABASE_ANON_KEY')?.trim() ?? '';

  static String get setupMessage => '''
Supabase is not configured yet.

1. Copy .env.example to .env
2. In Supabase: Project Settings (gear) → API
3. Paste Project URL and anon public key into .env
4. Restart the app (hot reload is not enough)
''';
}
