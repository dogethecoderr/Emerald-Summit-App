import 'package:flutter/material.dart';

enum UserRole {
  participant(
    label: 'Participant',
    description: 'Build your schedule, register for tracks, and follow your day.',
    icon: Icons.school_outlined,
  ),
  ambassador(
    label: 'Ambassador',
    description: 'Edit activity pages, post announcements, and log volunteer hours.',
    icon: Icons.volunteer_activism_outlined,
  ),
  expert(
    label: 'Expert',
    description: 'View your judging assignments and navigate between rooms.',
    icon: Icons.workspace_premium_outlined,
  ),
  admin(
    label: 'Admin',
    description: 'Check in attendees, manage people, and broadcast announcements.',
    icon: Icons.admin_panel_settings_outlined,
  ),
  parent(
    label: 'Parent',
    description: 'Follow your student\'s day and receive activity updates.',
    icon: Icons.family_restroom_outlined,
  );

  const UserRole({
    required this.label,
    required this.description,
    required this.icon,
  });

  final String label;
  final String description;
  final IconData icon;
}
