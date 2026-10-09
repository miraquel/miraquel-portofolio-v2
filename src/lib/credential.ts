// A certificate that lapses is current until its expiry day and expired from then on. Pages are
// built at deploy time, so the switch shows from the first deploy after that day; until then the
// page still names the day, which stays true.

/** Whether a certificate expiring on `expires` (a YYYY-MM-DD day, as Microsoft Learn shows it) has lapsed by `now` */
export function hasLapsed(expires: string, now: Date = new Date()): boolean {
  return now.getTime() >= Date.parse(`${expires}T00:00:00Z`);
}
