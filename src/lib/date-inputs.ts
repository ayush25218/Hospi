function pad(value: number) {
  return value.toString().padStart(2, '0');
}

export function getTodayInputValue() {
  return toDateInputValue(new Date().toISOString());
}

export function toDateInputValue(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value;

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toIsoDateValue(value: string) {
  return new Date(`${value}T12:00:00`).toISOString();
}

export function calculateDaySpan(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  const dayDifference = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return dayDifference + 1;
}
