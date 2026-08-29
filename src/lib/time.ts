/** "1:00 PM" style start time from an ISO date. */
export function fmtStart(iso: string): string {
  if (!iso) return 'TBD';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'TBD';
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/** "Sun 1:00 PM" — used when a game isn't today. */
export function fmtStartWithDay(iso: string): string {
  if (!iso) return 'TBD';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'TBD';
  const sameDay = d.toDateString() === new Date().toDateString();
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return sameDay ? time : `${d.toLocaleDateString([], { weekday: 'short' })} ${time}`;
}

/** "Updated 12s ago" from a React Query `dataUpdatedAt` timestamp. */
export function fmtUpdatedAgo(updatedAt: number, now: number = Date.now()): string {
  if (!updatedAt) return '';
  const secs = Math.max(0, Math.round((now - updatedAt) / 1000));
  if (secs < 5) return 'Updated just now';
  if (secs < 60) return `Updated ${secs}s ago`;
  return `Updated ${Math.round(secs / 60)}m ago`;
}
