import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'clear_auth_url_stub.dart'
    if (dart.library.js_interop) 'clear_auth_url_web.dart';

abstract final class AuthCallbackHandler {
  /// Parses OAuth/magic-link tokens from the browser URL after redirect.
  static Future<void> handleWebRedirectIfPresent() async {
    if (!kIsWeb) return;

    final uri = Uri.base;
    if (!_isAuthCallback(uri)) return;

    try {
      await Supabase.instance.client.auth.getSessionFromUrl(uri);
    } on AuthException catch (error) {
      debugPrint('Auth callback failed: ${error.message}');
    } finally {
      // Always strip ?code= from the URL so refresh/restart cannot re-login.
      clearWebAuthParams();
    }
  }

  static bool _isAuthCallback(Uri uri) {
    final fragment = Uri.splitQueryString(uri.fragment);
    return uri.queryParameters.containsKey('code') ||
        fragment.containsKey('access_token') ||
        uri.queryParameters.containsKey('error') ||
        uri.queryParameters.containsKey('error_description');
  }

  /// Removes OAuth tokens/codes left in the browser address bar.
  static void clearWebAuthParams() {
    if (!kIsWeb) return;
    clearAuthUrlParameters();
  }

  /// Backup clear for persisted Supabase session in browser localStorage.
  static void clearWebSessionStorage(String supabaseUrl) {
    if (!kIsWeb) return;
    final projectRef = Uri.parse(supabaseUrl).host.split('.').first;
    clearSupabaseSessionStorage('sb-$projectRef-auth-token');
  }

  /// Redirect URL registered in Supabase → Authentication → URL Configuration.
  static String get redirectUrl {
    if (kIsWeb) {
      final uri = Uri.base.replace(fragment: '', query: '');
      return uri.hasEmptyPath ? '${uri.origin}/' : uri.toString();
    }
    return 'com.eaf.emeraldsummit://login-callback/';
  }
}
