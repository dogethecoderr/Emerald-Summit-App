// Track lists per universe, sourced from the EHS Academic Foundation site:
// https://sites.google.com/view/ehs-academic-foundation/programs/emerald-summit
// Keyed by DisciplineInfo.name (see disciplines.ts).

export const UNIVERSE_TRACKS: Record<string, string[]> = {
  techverse: [
    'Computer Science',
    'AI Playground',
    'Engineering',
    'CADathon',
    'Robothon',
    'Product Design',
  ],
  biosphere: ['Psychology', 'Genetics', 'Health Sciences', 'Presentations'],
  novasphere: ['Core Science', 'Climate Change & Sustainability'],
  imaginex: ['Art', 'Literature', 'Music', 'Culinary'],
  ventureverse: ['Entrepreneurship', 'Marketing'],
  civicverse: ['Mock Trial', 'Civic Engagement', 'Law & Rights'],
};

export function tracksForUniverse(name: string): string[] {
  return UNIVERSE_TRACKS[name] ?? [];
}
