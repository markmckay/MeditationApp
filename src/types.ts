
export type RoundLog = { breaths: number; holdMs: number; startedAt: string; endedAt: string };
export type SessionLog = { id: string; createdAt: string; rounds: RoundLog[] };
