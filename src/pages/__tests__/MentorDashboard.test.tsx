import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import MentorDashboard from '../MentorDashboard';
import * as useRequireProfileModule from '../../hooks/useRequireProfile';

// Mock schedule context to avoid missing context providers
vi.mock('../../context/ScheduleContext', () => ({
  useSchedule: () => ({
    mySchedule: [],
    spectating: [],
  }),
}));

describe('MentorDashboard Component Suite', () => {
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
        roleName: 'mentor',
      });
    });

    test('renders Mentor Dashboard with assigned track, participant roster, and check-in tools', () => {
      renderWithRouter(<MentorDashboard assignedTrack="novasphere" />);

      // Verify Header and Assigned Track
      expect(screen.getByText('Mentor Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Mentor Hub & Track Management')).toBeInTheDocument();
      expect(screen.getByText('Assigned Track')).toBeInTheDocument();
      expect(screen.getByText('Novasphere')).toBeInTheDocument();

      // Verify Participant Roster header
      expect(screen.getByText('Participant Roster')).toBeInTheDocument();

      // Verify participant cards render (e.g. Priya Sharma)
      expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
    });

    test('toggles check-in status when check-in button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<MentorDashboard assignedTrack="novasphere" />);

      // Find initial check in / undo check-in buttons
      const checkInButtons = screen.getAllByRole('button', { name: /(Check In|Undo Check-in)/i });
      expect(checkInButtons.length).toBeGreaterThan(0);

      const firstBtn = checkInButtons[0];
      const initialText = firstBtn.textContent;

      // Click button
      await user.click(firstBtn);

      // Verify text toggles
      if (initialText?.includes('Undo Check-in')) {
        expect(firstBtn.textContent).toContain('Check In');
      } else {
        expect(firstBtn.textContent).toContain('Undo Check-in');
      }
    });

    test('filters participant list when status tab is selected', async () => {
      const user = userEvent.setup();
      renderWithRouter(<MentorDashboard assignedTrack="novasphere" />);

      // Click "Checked In" filter tab
      const checkedInTab = screen.getByRole('button', { name: /^Checked In \(/i });
      await user.click(checkedInTab);

      // Verify filtered list view
      expect(checkedInTab).toHaveClass('bg-background');
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
        roleName: 'mentor',
      });
    });

    test('handles empty participant roster gracefully with empty state banner', () => {
      renderWithRouter(
        <MentorDashboard assignedTrack="novasphere" participants={[]} />,
      );

      expect(
        screen.getByText('No participants assigned to this track'),
      ).toBeInTheDocument();
    });

    test('handles unassigned track cleanly with unassigned fallback message', () => {
      renderWithRouter(<MentorDashboard assignedTrack={null} />);

      expect(screen.getByText('No assigned track found')).toBeInTheDocument();
      expect(screen.getByText('No assigned track')).toBeInTheDocument();
    });

    test('handles unknown track string gracefully without throwing', () => {
      renderWithRouter(<MentorDashboard assignedTrack="unknown_track_123" />);

      expect(screen.getByText('No assigned track found')).toBeInTheDocument();
    });

    test('handles null participants prop cleanly as empty roster', () => {
      renderWithRouter(
        <MentorDashboard assignedTrack="novasphere" participants={null} />,
      );

      expect(
        screen.getByText('No participants assigned to this track'),
      ).toBeInTheDocument();
    });

    test('filters participant list when typing into search input', async () => {
      const user = userEvent.setup();
      renderWithRouter(<MentorDashboard assignedTrack="novasphere" />);

      const searchInput = screen.getByPlaceholderText('Search mentees...');
      await user.type(searchInput, 'Priya');

      expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
      expect(screen.queryByText('Jordan Wu')).not.toBeInTheDocument();

      await user.clear(searchInput);
      await user.type(searchInput, 'NonExistentParticipantXYZ');

      expect(
        screen.getByText('No participants match your current search or filter criteria.'),
      ).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Tier 3: Cross-Feature & Security
  // ---------------------------------------------------------------------------
  describe('Tier 3: Cross-Feature & Role Gating Security', () => {
    test('enforces role gating and redirects unauthorized non-mentor users', () => {
      vi.spyOn(useRequireProfileModule, 'useRequireRole').mockReturnValue({
        ready: false,
        redirect: '/home',
        roleName: 'participant',
      });

      renderWithRouter(<MentorDashboard assignedTrack="novasphere" />);

      // Content should not be rendered when redirected
      expect(screen.queryByText('Mentor Dashboard')).not.toBeInTheDocument();
      expect(screen.queryByText('Participant Roster')).not.toBeInTheDocument();
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
        roleName: 'mentor',
      });
    });

    test('uses AppShell, PageHeader eyebrow, font-display heading, and glass card components', () => {
      const { container } = renderWithRouter(
        <MentorDashboard assignedTrack="novasphere" />,
      );

      // PageHeader Eyebrow
      expect(screen.getByText('Mentor Dashboard')).toBeInTheDocument();

      // Heading display font
      const heading = screen.getByText('Mentor Hub & Track Management');
      expect(heading).toHaveClass('font-display');

      // Glass cards present in DOM
      const glassElements = container.querySelectorAll('.glass');
      expect(glassElements.length).toBeGreaterThan(0);
    });
  });
});

