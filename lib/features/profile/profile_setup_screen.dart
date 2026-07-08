import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../core/models/discipline.dart';
import '../../core/services/auth_service.dart';
import '../../core/theme/app_colors.dart';

const _bioWordLimit = 30;

int _wordCount(String text) {
  final trimmed = text.trim();
  if (trimmed.isEmpty) return 0;
  return trimmed.split(RegExp(r'\s+')).length;
}

class ProfileSetupScreen extends StatefulWidget {
  const ProfileSetupScreen({
    super.key,
    required this.onComplete,
    this.existingProfile,
  });

  final VoidCallback onComplete;
  final Map<String, dynamic>? existingProfile;

  @override
  State<ProfileSetupScreen> createState() => _ProfileSetupScreenState();
}

class _ProfileSetupScreenState extends State<ProfileSetupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _bioController = TextEditingController();

  UserDiscipline? _selectedDiscipline;
  bool _isSaving = false;
  int _bioWordCount = 0;

  @override
  void initState() {
    super.initState();
    final existing = widget.existingProfile;
    if (existing != null) {
      final existingName = existing['name'] as String?;
      if (existingName != null && existingName.trim().isNotEmpty) {
        _nameController.text = existingName.trim();
      }
      final existingPhone = existing['phone'] as String?;
      if (existingPhone != null && existingPhone.trim().isNotEmpty) {
        _phoneController.text = existingPhone.trim();
      }
      final existingBio = existing['bio'] as String?;
      if (existingBio != null && existingBio.trim().isNotEmpty) {
        _bioController.text = existingBio.trim();
      }
      final disciplineName = existing['discipline'] as String?;
      if (disciplineName != null) {
        for (final discipline in UserDiscipline.values) {
          if (discipline.name == disciplineName) {
            _selectedDiscipline = discipline;
            break;
          }
        }
      }
    } else {
      final metadataName =
          AuthService.client.auth.currentUser?.userMetadata?['full_name']
              as String?;
      if (metadataName != null && metadataName.trim().isNotEmpty) {
        _nameController.text = metadataName.trim();
      }
    }
    _bioWordCount = _wordCount(_bioController.text);
    _bioController.addListener(() {
      setState(() => _bioWordCount = _wordCount(_bioController.text));
    });
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _bioController.dispose();
    super.dispose();
  }

  bool get _canSave =>
      _nameController.text.trim().isNotEmpty && !_isSaving;

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);
    try {
      await AuthService.saveProfile(
        name: _nameController.text.trim(),
        phone: _phoneController.text.trim(),
        discipline: _selectedDiscipline,
        bio: _bioController.text.trim(),
      );
      widget.onComplete();
    } on AuthException catch (error) {
      _showMessage(error.message);
    } catch (error) {
      _showMessage('Could not save profile: $error');
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Complete your profile')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Tell us a bit about yourself',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: AppColors.ink,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Only your full name is required — the rest helps others '
                  'find and connect with you.',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(height: 24),
                Text(
                  'Full name',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: AppColors.ink,
                      ),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _nameController,
                  textInputAction: TextInputAction.next,
                  autofillHints: const [AutofillHints.name],
                  decoration: const InputDecoration(
                    hintText: 'Jordan Lee',
                    prefixIcon: Icon(Icons.person_outline),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Enter your full name';
                    }
                    return null;
                  },
                  onChanged: (_) => setState(() {}),
                ),
                const SizedBox(height: 20),
                Text(
                  'Phone (optional)',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: AppColors.ink,
                      ),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  textInputAction: TextInputAction.next,
                  autofillHints: const [AutofillHints.telephoneNumber],
                  decoration: const InputDecoration(
                    hintText: '(555) 123-4567',
                    prefixIcon: Icon(Icons.phone_outlined),
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  'Discipline (optional)',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: AppColors.ink,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Pick the discipline that best fits you.',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 12,
                  runSpacing: 12,
                  children: [
                    for (final discipline in UserDiscipline.values)
                      _DisciplineCard(
                        discipline: discipline,
                        isSelected: _selectedDiscipline == discipline,
                        onTap: () => setState(() {
                          _selectedDiscipline =
                              _selectedDiscipline == discipline
                                  ? null
                                  : discipline;
                        }),
                      ),
                  ],
                ),
                const SizedBox(height: 24),
                Text(
                  'Short bio (optional)',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: AppColors.ink,
                      ),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _bioController,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    hintText: 'A sentence or two about yourself.',
                  ),
                  validator: (value) {
                    if (_wordCount(value ?? '') > _bioWordLimit) {
                      return 'Keep your bio under $_bioWordLimit words';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 6),
                Align(
                  alignment: Alignment.centerRight,
                  child: Text(
                    '$_bioWordCount/$_bioWordLimit words',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: _bioWordCount > _bioWordLimit
                              ? Colors.red
                              : AppColors.inkMuted,
                        ),
                  ),
                ),
                const SizedBox(height: 12),
                FilledButton(
                  onPressed: _canSave ? _save : null,
                  child: _isSaving
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: AppColors.white,
                          ),
                        )
                      : const Text('Continue'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _DisciplineCard extends StatelessWidget {
  const _DisciplineCard({
    required this.discipline,
    required this.isSelected,
    required this.onTap,
  });

  final UserDiscipline discipline;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 160,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: isSelected
                ? discipline.color.withValues(alpha: 0.1)
                : AppColors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isSelected
                  ? discipline.color
                  : AppColors.ink.withValues(alpha: 0.08),
              width: isSelected ? 2 : 1,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  color: discipline.color,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                discipline.label,
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: AppColors.ink,
                    ),
              ),
              const SizedBox(height: 4),
              Text(
                discipline.description,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.inkMuted,
                      height: 1.3,
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
