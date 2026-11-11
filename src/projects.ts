import { getCollection } from 'astro:content';

/** All projects, newest first: by the month each ended, then by the month it started. */
export async function getProjects() {
  return (await getCollection('projects')).sort(
    (a, b) =>
      (b.data.end ?? b.data.start).localeCompare(a.data.end ?? a.data.start) ||
      b.data.start.localeCompare(a.data.start),
  );
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const month = (ym: string) => `${MONTHS[Number(ym.slice(5)) - 1]} ${ym.slice(0, 4)}`;

/** "Feb 2026 to Jun 2026", or "Oct 2026" for a project of one month. */
export function projectDates({ start, end }: { start: string; end?: string }) {
  return end && end !== start ? `${month(start)} to ${month(end)}` : month(start);
}
