import { TFunction } from "i18next";

export function formatTimeAgo(timestamp: number, t: TFunction): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return t('time.just_now');
  if (minutes < 60) return minutes === 1 ? `1 ${t('time.minute')}` : `${minutes} ${t('time.minutes')}`;
  if (hours < 24) return hours === 1 ? `1 ${t('time.hour')}` : `${hours} ${t('time.hours')}`;
  if (days === 1) return t('time.yesterday');
  if (days < 7) return `${days} ${t('time.days')}`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? `1 ${t('time.week')}` : `${weeks} ${t('time.weeks')}`;
  }
  if (months < 12) return months === 1 ? `1 ${t('time.month')}` : `${months} ${t('time.months')}`;
  return years === 1 ? `1 ${t('time.year')}` : `${years} ${t('time.years')}`;
}

export function formatFullDate(timestamp: number): string {
  const date = new Date(timestamp);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} at ${hour12}:${minutes} ${ampm}`;
}

export function formatShortDate(timestamp: number): string {
  const date = new Date(timestamp);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function isToday(timestamp: number): boolean {
  const date = new Date(timestamp);
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

export function isThisWeek(timestamp: number): boolean {
  const date = new Date(timestamp);
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return date >= weekStart;
}
