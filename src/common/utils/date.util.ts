export function formatToIsraelTimezone(date: Date | string): string {
    return new Date(date).toLocaleString('sv-SE', {
      timeZone: 'Asia/Jerusalem',
      hour12: false,
    });
  }
  