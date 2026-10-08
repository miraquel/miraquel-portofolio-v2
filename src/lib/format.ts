const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2022-04" -> "Apr 2022" */
export function formatMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

/** { start: "2022-04", end: "2023-04" } -> "Apr 2022 – Apr 2023"; an open end reads "present" */
export function formatPeriod(period: { start: string; end?: string }): string {
  return `${formatMonth(period.start)} – ${period.end ? formatMonth(period.end) : 'present'}`;
}

/** "2026-10-08" or a Date -> "8 October 2026" */
export function formatDay(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(`${value}T00:00:00Z`) : value;
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
}
