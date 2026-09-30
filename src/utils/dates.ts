// Date formatting and manipulation utilities
export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

export function getRelativeTimeOrDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    const now = new Date('2026-09-30T10:00:00+05:30'); // Context date: Sept 2026
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;

    return formatDate(dateString);
  } catch {
    return dateString;
  }
}

export function getMonthYear(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  } catch {
    return 'Sep 2026';
  }
}
