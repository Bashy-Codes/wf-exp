const HOUR_MS = 3600000; // 1 hour in milliseconds
const DAY_MS = 86400000; // 24 hours in milliseconds

export function formatMessageTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function formatDateHeader(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (dateStart.getTime() === today.getTime()) {
    return "Today";
  }
  if (dateStart.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export function shouldShowTimestamp(currentTimestamp: number, previousTimestamp?: number): boolean {
  if (!previousTimestamp) return false;
  return currentTimestamp - previousTimestamp >= HOUR_MS;
}

export function shouldShowDateHeader(currentTimestamp: number, previousTimestamp?: number): boolean {
  if (!previousTimestamp) return true;
  return currentTimestamp - previousTimestamp >= DAY_MS;
}
