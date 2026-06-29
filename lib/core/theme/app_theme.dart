import 'package:flutter/material.dart';

import 'app_colors.dart';

abstract final class AppTheme {
  static ThemeData get light {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: AppColors.emerald,
      primary: AppColors.emerald,
      onPrimary: AppColors.white,
      surface: AppColors.mist,
      onSurface: AppColors.ink,
      brightness: Brightness.light,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: AppColors.mist,
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.mist,
        foregroundColor: AppColors.ink,
        elevation: 0,
        centerTitle: true,
      ),
      textTheme: const TextTheme(
        headlineLarge: TextStyle(
          color: AppColors.ink,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.5,
        ),
        headlineSmall: TextStyle(
          color: AppColors.ink,
          fontWeight: FontWeight.w600,
        ),
        bodyLarge: TextStyle(color: AppColors.ink),
        bodyMedium: TextStyle(color: AppColors.inkMuted),
        labelLarge: TextStyle(
          color: AppColors.white,
          fontWeight: FontWeight.w600,
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.emerald,
          foregroundColor: AppColors.white,
          disabledBackgroundColor: AppColors.emerald.withValues(alpha: 0.4),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.emerald,
          side: const BorderSide(color: AppColors.emerald),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.ink.withValues(alpha: 0.08)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.emerald, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      cardTheme: CardThemeData(
        color: AppColors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: AppColors.ink.withValues(alpha: 0.06)),
        ),
      ),
    );
  }
}
