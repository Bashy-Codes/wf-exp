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

export function isSameDay(timestamp1: number, timestamp2: number): boolean {
    const d1 = new Date(timestamp1);
    const d2 = new Date(timestamp2);
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
}
