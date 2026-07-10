// Ported from flutter/lib/core/models/user_role.dart
import {
  GraduationCap,
  HeartHandshake,
  Award,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';

export interface RoleInfo {
  name: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const USER_ROLES: RoleInfo[] = [
  {
    name: 'participant',
    label: 'Participant',
    description:
      'Build your schedule, register for tracks, and follow your day.',
    icon: GraduationCap, // school_outlined
  },
  {
    name: 'ambassador',
    label: 'Ambassador',
    description:
      'Edit activity pages, post announcements, and log volunteer hours.',
    icon: HeartHandshake, // volunteer_activism_outlined
  },
  {
    name: 'expert',
    label: 'Expert',
    description: 'View your judging assignments and navigate between rooms.',
    icon: Award, // workspace_premium_outlined
  },
  {
    name: 'admin',
    label: 'Admin',
    description:
      'Check in attendees, manage people, and broadcast announcements.',
    icon: ShieldCheck, // admin_panel_settings_outlined
  },
  {
    name: 'parent',
    label: 'Parent',
    description: "Follow your student's day and receive activity updates.",
    icon: Users, // family_restroom_outlined
  },
];

export function roleByName(name: string | undefined): RoleInfo | undefined {
  if (!name) return undefined;
  return USER_ROLES.find((r) => r.name === name);
}
