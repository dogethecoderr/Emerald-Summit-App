import 'package:flutter/material.dart';

import '../../core/models/user_role.dart';
import '../../core/theme/app_colors.dart';
import '../auth/login_screen.dart';
import 'widgets/role_card.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(child: _Header()),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
              sliver: SliverList.separated(
                itemCount: UserRole.values.length,
                separatorBuilder: (context, index) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final role = UserRole.values[index];
                  return RoleCard(
                    role: role,
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute<void>(
                        builder: (_) => LoginScreen(role: role),
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppColors.emerald,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.terrain_outlined,
                  color: AppColors.white,
                  size: 26,
                ),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Emerald Summit',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w700,
                          color: AppColors.ink,
                        ),
                  ),
                  Text(
                    'EHS Academic Foundation',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.inkMuted,
                        ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 28),
          Text(
            'Summit \'27',
            style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                  fontSize: 34,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'January 2027 · Emerald High, Dublin CA',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 20),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.emerald, AppColors.deepEmerald],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Welcome',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: AppColors.white,
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Choose your role to sign in and get started.',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppColors.white.withValues(alpha: 0.9),
                      ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Sign in as',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: AppColors.ink,
                ),
          ),
          const SizedBox(height: 4),
          Text(
            'Your role determines what you can see and do in the app.',
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      ),
    );
  }
}
