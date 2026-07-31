export type BrandType = 'RAW' | 'SmackDown' | 'NXT' | 'Women Tag' | 'Free Agent';

export type TierType = 'Top' | 'Middle' | 'Low' | 'Female' | 'Tag Team';

export interface Superstar {
  id: string;
  name: string;
  brand: BrandType;
  tier: TierType;
  overallRating?: number;
  titleHeld?: string;
  notes?: string;
}

export interface WomenTagTeam {
  id: string;
  teamName: string;
  brand: BrandType;
  notes?: string;
}

export interface MatchCardItem {
  id: string;
  matchNumber: number;
  matchType: string;
  titleName?: string;
  wrestler1: string;
  wrestler2: string;
  winner?: string;
  stipulation?: string;
  notes?: string;
}

export interface ShowPlan {
  id: string;
  brand: BrandType;
  episodeName: string;
  date: string;
  arena?: string;
  matches: MatchCardItem[];
  notes?: string;
}

export interface AchievementMale {
  id: string;
  superstarName: string;
  brand?: BrandType;
  // The 9 Title Checkmarks:
  univUndisputed?: boolean; // Universal / Undisputed WWE
  worldHw?: boolean;        // WWE / World Heavyweight
  ic?: boolean;             // Intercontinental
  us?: boolean;             // US
  tagTeam?: boolean;        // Tag Team
  cruiserweight?: boolean;  // Cruiserweight
  nxt?: boolean;            // NXT
  uk?: boolean;             // UK
  northAmerican?: boolean;  // North American

  // Historic Grand Slam Order Number (e.g., 1 for Seth Rollins, 2 for Randy Orton, etc.)
  grandSlamOrder?: number;

  // Legacy fields (optional for backwards compatibility):
  royalRumbleCount?: number;
  mitbCount?: number;
  royalRumble?: boolean;
  mitb?: boolean;
  chamberCount?: number;
  grandSlam?: boolean;
  motyCount?: number;
  hallOfFame?: boolean;
  streakWins?: number;
  notes?: string;
}

export interface AchievementFemale {
  id: string;
  superstarName: string;
  brand?: BrandType;
  
  // Title Checkmarks
  rawWomen?: boolean;
  sdWomen?: boolean;
  nxt?: boolean;
  womenTag?: boolean;
  nxtTag?: boolean;
  nxtUk?: boolean;
  nxtNa?: boolean;
  ic?: boolean;
  us?: boolean;
  
  // Historic Grand Slam Order
  grandSlamOrder?: number;
  
  // Legacy fields
  royalRumbleCount?: number;
  mitbCount?: number;
  royalRumble?: boolean;
  mitb?: boolean;
  chamberCount?: number;
  grandSlam?: boolean;
  rivalryOfYearCount?: number;
  titleReignsCount?: number;
  notes?: string;
}

export interface CalendarEvent {
  id: string;
  month: string;
  eventName: string;
  brand: string; // Supports 'RAW', 'SmackDown', 'NXT', 'Joint', or combinations like 'RAW, SmackDown'
  type: 'PLE' | 'Weekly Show' | 'Special Event';
  date: string;
  location?: string;
  mainEvent?: string;
  isCompleted: boolean;
}

export interface ChampionEntry {
  id: string;
  titleName: string;
  brand: 'RAW' | 'SmackDown' | 'NXT' | 'Joint';
  currentChampion: string;
  daysHeld: number;
  defenses: number;
  previousChampion?: string;
  acquiredDate?: string;
  beltImage?: string;
  wrestlerImage?: string;
}

export interface ArchiveEntry {
  id: string;
  brand: 'RAW' | 'SmackDown' | 'NXT' | 'Joint';
  titleName: string;
  who: string;
  times: number | string;
  reign: number | string;
  month: number | string;
  order: number;
}

export interface RivalryEntry {
  id: string;
  name: string;
  brand: 'RAW' | 'SmackDown' | 'NXT' | 'Joint';
  rival1: string;
  rival2: string;
  intensity: 'Low' | 'Medium' | 'High' | 'Heated';
  type: '1v1' | 'Tag Team' | '3-Way' | 'Championship' | 'Faction War';
  currentStage: 'Beginning' | 'Escalation' | 'Blowout Match at PLE' | 'Resolved';
  notes?: string;
  winner?: string;
}

export type TabPath =
  | 'roster'
  | 'raw'
  | 'sd'
  | 'nxt'
  | 'achievement-men'
  | 'achievement-women'
  | 'calendar'
  | 'champ-list'
  | 'summary'
  | 'rivalry';

export interface MatrixColumn {
  id: string;
  brand: 'RAW' | 'SmackDown' | 'NXT' | 'Joint';
  titleName: string;
}

export interface HistoryMatrixRow {
  id: string;
  month: string;
  mainPle: string;
  raw?: { whc: string; ic: string; tag: string; wwc: string; wic: string };
  sd?: { und: string; us: string; tag: string; wwe: string; wus: string };
  nxtMonth: string;
  nxtPle: string;
  nxt?: { nxt: string; na: string; tag: string; wnxt: string; wna: string };
  joint?: { wtag: string };
  champions?: Record<string, string>;
}

export interface UniverseTime {
  year: number;
  month: string;
  week: string;
}

export interface CustomMatrix {
  id: string;
  title: string;
  data: HistoryMatrixRow[];
}

export interface PPVTimelineRow {
  id: string;
  rawSdEvent: string;
  rawSdMonth: string;
  rawSdDay: string;
  rawSdDaysCount: string;
  nxtEvent: string;
  nxtMonth: string;
  nxtDay: string;
  nxtDaysCount: string;
  colorPreset?: string;
}

export interface PPVTimeline {
  id: string;
  title: string;
  rows: PPVTimelineRow[];
}

export interface AppState {
  superstars: Superstar[];
  womenTagTeams: WomenTagTeam[];
  achievementsMen: AchievementMale[];
  achievementsWomen: AchievementFemale[];
  calendarEvents: CalendarEvent[];
  champions: ChampionEntry[];
  championArchive?: ArchiveEntry[];
  rivalries: RivalryEntry[];
  rawShowPlans: ShowPlan[];
  sdShowPlans: ShowPlan[];
  nxtShowPlans: ShowPlan[];
  historyMatrix?: HistoryMatrixRow[];
  matrixColumns?: MatrixColumn[];
  emptyMatrix?: HistoryMatrixRow[];
  customMatrices?: CustomMatrix[];
  ppvTimelines?: PPVTimeline[];
  universeTime?: UniverseTime;
}
