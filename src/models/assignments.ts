// Expert judging assignments (spec §04 "Experts & campus navigation"):
// each expert judges a set of sessions; the app routes them between rooms.

export interface JudgingAssignment {
  id: string;
  /** Session id from MOCK_SESSIONS. */
  sessionId: string;
  /** What the expert does there. */
  duty: 'Lead Judge' | 'Panel Judge' | 'Mentor Feedback';
  /** Free-form judging notes from the track's ambassador. */
  note?: string;
}

/** The signed-in demo expert's assignments for the day. */
export const MOCK_ASSIGNMENTS: JudgingAssignment[] = [
  {
    id: 'j1',
    sessionId: 's2',
    duty: 'Lead Judge',
    note: 'Score rubric: originality 40%, execution 40%, presentation 20%.',
  },
  {
    id: 'j2',
    sessionId: 's6',
    duty: 'Panel Judge',
    note: 'Five teams, seven minutes each plus Q&A.',
  },
  {
    id: 'j3',
    sessionId: 's8',
    duty: 'Mentor Feedback',
  },
  {
    id: 'j4',
    sessionId: 's12',
    duty: 'Panel Judge',
    note: 'Community-impact award nominations due right after this block.',
  },
];
