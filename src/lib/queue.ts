export interface QueueSettings {
  enabled: boolean;
  days: number[];   // 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
  time: string;     // "09:00" 24h
}

export const QUEUE_KEY = 'linkedinflow_queue_settings';

export const DEFAULT_QUEUE: QueueSettings = {
  enabled: false,
  days: [1, 3, 5], // Mon Wed Fri
  time: '09:00',
};

export function loadQueueSettings(): QueueSettings {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? { ...DEFAULT_QUEUE, ...JSON.parse(raw) } : DEFAULT_QUEUE;
  } catch {
    return DEFAULT_QUEUE;
  }
}

export function saveQueueSettings(s: QueueSettings): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(s));
}

// Returns the next free slot date, or null if none found in 28 days
export function getNextQueueSlot(
  settings: QueueSettings,
  scheduledPosts: Array<{ scheduled_at?: string }>
): Date | null {
  if (!settings.enabled || settings.days.length === 0) return null;

  const [hours, minutes] = settings.time.split(':').map(Number);

  for (let daysAhead = 0; daysAhead <= 28; daysAhead++) {
    const candidate = new Date();
    candidate.setDate(candidate.getDate() + daysAhead);
    candidate.setHours(hours, minutes, 0, 0);

    // Must be at least 5 min in the future
    if (candidate.getTime() < Date.now() + 5 * 60 * 1000) continue;

    // Must be on a configured day
    if (!settings.days.includes(candidate.getDay())) continue;

    // Must not conflict with an existing scheduled post (within 30 min window)
    const slotMs = candidate.getTime();
    const conflict = scheduledPosts.some((p) => {
      if (!p.scheduled_at) return false;
      return Math.abs(new Date(p.scheduled_at).getTime() - slotMs) < 30 * 60 * 1000;
    });

    if (!conflict) return candidate;
  }

  return null;
}
