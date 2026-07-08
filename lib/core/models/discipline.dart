import 'package:flutter/material.dart';

enum UserDiscipline {
  techverse(
    label: 'TechVerse',
    description: 'Technology & Engineering',
    color: Color(0xFF3B82F6),
  ),
  biosphere(
    label: 'BioSphere',
    description: 'Life Sciences & Environment',
    color: Color(0xFF14B8A6),
  ),
  imaginex(
    label: 'ImagineX',
    description: 'Arts, Design & Media',
    color: Color(0xFFE11D48),
  ),
  novasphere(
    label: 'NovaSphere',
    description: 'Math, Physics & Space',
    color: Color(0xFF7C3AED),
  ),
  ventureverse(
    label: 'VentureVerse',
    description: 'Business & Entrepreneurship',
    color: Color(0xFFF59E0B),
  ),
  civicverse(
    label: 'CivicVerse',
    description: 'Civics, Policy & Leadership',
    color: Color(0xFFF97316),
  );

  const UserDiscipline({
    required this.label,
    required this.description,
    required this.color,
  });

  final String label;
  final String description;
  final Color color;
}
