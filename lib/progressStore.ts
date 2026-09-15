export type PracticeStats = {
  questions: number;
  correct: number;
  sessions: number;
  lastSessionAt: string | null;
};

const defaultStats: PracticeStats = {
  questions: 0,
  correct: 0,
  sessions: 0,
  lastSessionAt: null,
};

let memoryStats: PracticeStats = { ...defaultStats };
const STORAGE_KEY = 'lingua.practice.stats.v1';

function readWeb(): PracticeStats {
  if (typeof window === 'undefined' || !window.localStorage) return memoryStats;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultStats, ...JSON.parse(raw) } : memoryStats;
  } catch {
    return memoryStats;
  }
}

function write(stats: PracticeStats) {
  memoryStats = stats;
  if (typeof window !== 'undefined' && window.localStorage) {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats)); } catch {}
  }
}

export function getPracticeStats() {
  return readWeb();
}

export function recordPractice(correct: number, questions: number) {
  const current = readWeb();
  write({
    questions: current.questions + questions,
    correct: current.correct + correct,
    sessions: current.sessions + 1,
    lastSessionAt: new Date().toISOString(),
  });
}

export function resetPracticeStats() {
  write({ ...defaultStats });
}
