export interface Employer {
  company: string;
  href: string;
  role: string;
  /** end is undefined while the role is current */
  period: { start: string; end?: string };
  work: string;
}

export const employers: Employer[] = [
  {
    company: 'PT Gandum Mas Kencana',
    href: 'https://gandummas.co.id/',
    role: 'Software Developer, Dynamics AX 2012',
    period: { start: '2023-07' },
    work: 'I build and maintain the AX 2012 customisations in X++ and the systems around them: ASP.NET Web API integrations and Flutter mobile apps.',
  },
  {
    company: 'PT Intikom Berlian Mustika',
    href: 'https://intikom.com/',
    role: 'Software Developer / Lead, Dynamics 365',
    period: { start: '2019-02', end: '2023-07' },
    work: 'I delivered Dynamics 365 Finance & Operations, Business Central and Power Platform solutions in X++, AL and .NET; led a five-month Business Central implementation and mentored junior developers.',
  },
  {
    company: 'PT Visionet Data Internasional',
    href: 'https://www.visionet.co.id/',
    role: 'Software Developer, Dynamics AX 2012',
    period: { start: '2018-01', end: '2019-02' },
    work: 'I implemented and customised Dynamics AX 2012 R3 in X++, including shipping-order and invoice reports.',
  },
];

export interface Credential {
  name: string;
  detail: string;
  /** A certificate that lapses: the day it expires (YYYY-MM-DD, as Microsoft Learn shows it). Until
      then the page prints it as current on a signal slip; from then on, stamped Expired. */
  expires?: string;
}

export const credentials: Credential[] = [
  {
    name: 'Microsoft Certified: Dynamics 365 Finance and Operations Apps Developer Associate',
    detail: 'Issued October 2023',
    // Renewed; Microsoft Learn shows it active until 3 October 2027 06:59 UTC+7 (checked 9 October 2026)
    expires: '2027-10-03',
  },
  { name: 'Microsoft Dynamics 365 Fundamentals', detail: 'December 2019' },
  { name: 'Exam 764: Administering a SQL Database Infrastructure', detail: 'August 2019' },
  { name: 'Bachelor of Information Technology', detail: 'Universitas Islam Syekh Yusuf, 2017' },
  { name: 'English', detail: 'IELTS 7.0 (August 2023), CEFR C1. Indonesian is my native language.' },
];

