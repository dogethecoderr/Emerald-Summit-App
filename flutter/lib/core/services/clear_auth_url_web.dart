import 'package:web/web.dart';

const _authParameters = {
  'code',
  'access_token',
  'expires_in',
  'expires_at',
  'refresh_token',
  'token_type',
  'provider_token',
  'provider_refresh_token',
  'error',
  'error_code',
  'error_description',
  'type',
};

void clearAuthUrlParameters() {
  final cleanedUrl = _removeAuthParametersFromUrl(window.location.href);
  window.history.replaceState(null, '', cleanedUrl);
}

void clearSupabaseSessionStorage(String persistSessionKey) {
  window.localStorage.removeItem(persistSessionKey);
}

String _removeAuthParametersFromUrl(String url) {
  final currentUri = Uri.parse(url);

  final query = Map<String, String>.of(currentUri.queryParameters)
    ..removeWhere((key, value) => _authParameters.contains(key));

  final fragmentParameters =
      Map<String, String>.of(Uri.splitQueryString(currentUri.fragment))
        ..removeWhere((key, value) => _authParameters.contains(key));

  final fragment = fragmentParameters.isEmpty
      ? null
      : Uri(queryParameters: fragmentParameters).query;

  final cleanedUri = Uri(
    scheme: currentUri.scheme,
    userInfo: currentUri.userInfo,
    host: currentUri.host,
    port: currentUri.hasPort ? currentUri.port : null,
    path: currentUri.path,
    queryParameters: query.isEmpty ? null : query,
    fragment: fragment,
  );

  return cleanedUri.toString();
}
