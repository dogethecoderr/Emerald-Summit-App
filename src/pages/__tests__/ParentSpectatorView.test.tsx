import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ParentSpectatorView from '../ParentSpectatorView';
import * as useRequireProfileModule from '../../hooks/useRequireProfile';

// Mock schedule context to avoid missing context providers
vi.mock('../../context/ScheduleContext', () => ({
  useSchedule: () => ({
    mySchedule: [],
    spectating: [],
  }),
}));

describe('ParentSpectatorView Component Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

  // ---------------------------------------------------------------------------
  // Tier 1: Feature Coverage
  // ---------------------------------------------------------------------------
  describe('Tier 1: Feature Coverage', () => {
    beforeEach(() => {
      vi.spyOn(useRequireProfileModule, 'useRequireRole').mockReturnValue({
        ready: true,
        redirect: null,
        roleName: 'parent',
      });
    });

    test('renders Parent Spectator View with linked student schedule, activity feed, and progress', () => {
      renderWithRouter(<ParentSpectatorView />);

      // Verify Header and Eyebrow
      expect(screen.getByText('Parent Spectator Lens')).toBeInTheDocument();
      expect(screen.getByText("Priya's Summit Day")).toBeInTheDocument();

      // Verify Linked Student Card
      expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
      expect(screen.getByText('Emerald High School')).toBeInTheDocument();
      expect(screen.getByText('Checked in · on campus')).toBeInTheDocument();

      // Verify Schedule Timeline
      expect(screen.getByText('Student Schedule Timeline')).toBeInTheDocument();

      // Verify Daily Progress Section
      expect(screen.getByText('Daily Progress')).toBeInTheDocument();
      expect(screen.getByText('Completed Sessions')).toBeInTheDocument();

      // Verify Live Activity Feed
      expect(screen.getByText('Live Activity Feed')).toBeInTheDocument();
      expect(screen.getByText('Priya checked in at the front desk.')).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Tier 2: Boundary & Corner Cases
  // ---------------------------------------------------------------------------
  describe('Tier 2: Boundary & Corner Cases', () => {
    beforeEach(() => {
      vi.spyOn(useRequireProfileModule, 'useRequireRole').mockReturnValue({
        ready: true,
        redirect: null,
        roleName: 'parent',
      });
    });

    test('handles empty student schedule gracefully with empty state banner', () => {
      renderWithRouter(<ParentSpectatorView studentSchedule={[]} />);

      expect(
        screen.getByText('No scheduled sessions for this student'),
      ).toBeInTheDocument();
      expect(screen.getByText(/0 of 0 \(0%\)/i)).toBeInTheDocument();
    });

    test('handles null studentSchedule prop cleanly as empty schedule', () => {
      renderWithRouter(<ParentSpectatorView studentSchedule={null} />);

      expect(
        screen.getByText('No scheduled sessions for this student'),
      ).toBeInTheDocument();
    });

    test('handles missing linked student cleanly with unlinked fallback state', () => {
      renderWithRouter(<ParentSpectatorView linkedStudent={null} />);

      expect(screen.getByText('No linked student found')).toBeInTheDocument();
    });

    test('handles student with undefined spectatingIds without crashing', () => {
      const studentWithoutSpectating = {
        name: 'Alex Rivera',
        initials: 'AR',
        school: 'Emerald High School',
        discipline: 'techverse',
        sessionIds: ['s2'],
        spectatingIds: undefined as unknown as string[],
        checkedIn: false,
      };

      renderWithRouter(<ParentSpectatorView linkedStudent={studentWithoutSpectating} />);

      expect(screen.getByText("Alex's Summit Day")).toBeInTheDocument();
      expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Tier 3: Cross-Feature & Read-only Security
  // ---------------------------------------------------------------------------
  describe('Tier 3: Cross-Feature & Read-only Security', () => {
    beforeEach(() => {
      vi.spyOn(useRequireProfileModule, 'useRequireRole').mockReturnValue({
        ready: true,
        redirect: null,
        roleName: 'parent',
      });
    });

    test('explicitly lacks registration or schedule modification actions (read-only spectator mode)', () => {
      const { container } = renderWithRouter(<ParentSpectatorView />);

      // Verify Spectator View Notice Banner is present
      expect(screen.getByText(/Spectator View Mode:/i)).toBeInTheDocument();

      // Ensure NO interactive modification controls exist
      expect(screen.queryByText(/add session/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/enroll/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /edit schedule/i })).toBeNull();
      expect(screen.queryByRole('button', { name: /register/i })).toBeNull();
      expect(screen.queryByRole('button', { name: /delete/i })).toBeNull();

      // Verify DOM has zero interactive input/select/button elements for data modification
      const inputs = container.querySelectorAll('input, select, textarea');
      expect(inputs.length).toBe(0);

      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(0);
    });

    test('enforces role gating and redirects unauthorized non-parent users', () => {
      vi.spyOn(useRequireProfileModule, 'useRequireRole').mockReturnValue({
        ready: false,
        redirect: '/home',
        roleName: 'participant',
      });

      renderWithRouter(<ParentSpectatorView />);

      // Content should not be rendered when redirected
      expect(screen.queryByText('Parent Spectator Lens')).not.toBeInTheDocument();
      expect(screen.queryByText('Student Schedule Timeline')).not.toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Tier 4: Design System Adherence
  // ---------------------------------------------------------------------------
  describe('Tier 4: Design System Adherence', () => {
    beforeEach(() => {
      vi.spyOn(useRequireProfileModule, 'useRequireRole').mockReturnValue({
        ready: true,
        redirect: null,
        roleName: 'parent',
      });
    });

    test('uses AppShell, PageHeader eyebrow, font-display heading, and glass card components', () => {
      const { container } = renderWithRouter(<ParentSpectatorView />);

      // PageHeader Eyebrow
      expect(screen.getByText('Parent Spectator Lens')).toBeInTheDocument();

      // Heading display font
      const heading = screen.getByText("Priya's Summit Day");
      expect(heading).toHaveClass('font-display');

      // Glass cards present in DOM
      const glassElements = container.querySelectorAll('.glass');
      expect(glassElements.length).toBeGreaterThan(0);
    });
  });
});

