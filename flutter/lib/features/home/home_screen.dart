import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../core/config/app_env.dart';
import '../../core/models/user_role.dart';
import '../../core/services/auth_service.dart';
import '../../core/theme/app_colors.dart';
import '../auth/login_screen.dart';
import '../profile/profile_setup_screen.dart';
import 'widgets/role_card.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    if (!AppEnv.isConfigured) {
      return const _UnconfiguredHomeScreen();
    }

    return StreamBuilder<AuthState>(
      stream: AuthService.authStateChanges,
      builder: (context, snapshot) {
        final session = snapshot.data?.session ?? AuthService.session;
        final isSignedIn = session != null;

        return _HomeContent(isSignedIn: isSignedIn);
      },
    );
  }
}

class _HomeContent extends StatefulWidget {
  const _HomeContent({required this.isSignedIn});

  final bool isSignedIn;

  @override
  State<_HomeContent> createState() => _HomeContentState();
}

class _HomeContentState extends State<_HomeContent> {
  Map<String, dynamic>? _profile;
  bool _isLoadingProfile = true;
  bool _isSigningOut = false;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  @override
  void didUpdateWidget(covariant _HomeContent oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.isSignedIn != widget.isSignedIn) {
      if (widget.isSignedIn) {
        _loadProfile();
      } else {
        setState(() {
          _profile = null;
          _isLoadingProfile = false;
        });
      }
    }
  }

  Future<void> _loadProfile() async {
    if (!widget.isSignedIn) {
      if (mounted) setState(() => _profile = null);
      return;
    }

    setState(() => _isLoadingProfile = true);
    final profile = await AuthService.getCurrentProfile();
    if (!mounted) return;
    setState(() {
      _profile = profile;
      _isLoadingProfile = false;
    });
  }

  Future<void> _signOut() async {
    if (_isSigningOut) return;

    setState(() => _isSigningOut = true);
    try {
      await AuthService.signOut();
      if (!mounted) return;
      setState(() {
        _profile = null;
        _isSigningOut = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() => _isSigningOut = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Sign out failed: $error')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isSignedIn = widget.isSignedIn;

    if (isSignedIn && _isLoadingProfile) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (isSignedIn && AuthService.needsProfileSetup(_profile)) {
      return ProfileSetupScreen(
        existingProfile: _profile,
        onComplete: _loadProfile,
      );
    }

    return Scaffold(
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: _Header(
                isSignedIn: isSignedIn,
                email: _profile?['email'] as String?,
                isSigningOut: _isSigningOut,
                onSignOut: _signOut,
              ),
            ),
            if (!isSignedIn)
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
                sliver: SliverList.separated(
                  itemCount: UserRole.values.length,
                  separatorBuilder: (context, index) =>
                      const SizedBox(height: 12),
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

class _UnconfiguredHomeScreen extends StatelessWidget {
  const _UnconfiguredHomeScreen();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: EdgeInsets.all(24),
            child: Text('Add Supabase credentials to .env and restart the app.'),
          ),
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({
    required this.isSignedIn,
    required this.isSigningOut,
    required this.onSignOut,
    this.email,
  });

  final bool isSignedIn;
  final bool isSigningOut;
  final VoidCallback onSignOut;
  final String? email;

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
              Expanded(
                child: Column(
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
              ),
              if (isSignedIn)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    if (email != null && email!.isNotEmpty)
                      Text(
                        email!,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppColors.inkMuted,
                            ),
                      ),
                    TextButton(
                      onPressed: isSigningOut ? null : onSignOut,
                      child: Text(
                        isSigningOut ? 'Signing out…' : 'Sign out',
                      ),
                    ),
                  ],
                ),
            ],
          ),
          const SizedBox(height: 28),
          if (isSignedIn) ...[
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
                    'You\'re in',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: AppColors.white,
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Your account is ready. More features coming soon.',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.white.withValues(alpha: 0.9),
                        ),
                  ),
                ],
              ),
            ),
          ],
          if (!isSignedIn) ...[
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
        ],
      ),
    );
  }
}
