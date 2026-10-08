// Who ships, where from, and how to reach them. Claims follow PRODUCT.md's claim rules:
// the only numbers allowed are 8 years .NET, 5 years D365 F&O, the five-month Business
// Central implementation, and about 60% less manual entry (AXFinMobile).

export const profile = {
  name: 'Chaidir Ali Assegaf',
  title: 'Dynamics 365 F&O & .NET Developer',
  summary:
    'I build and customise Dynamics AX 2012 and Dynamics 365 Finance & Operations, and the .NET services and mobile apps that connect to them.',
  roles: 'For roles in Dynamics 365 F&O, Dynamics AX or .NET backend development.',
  based: 'Indonesia',
  relocation: 'Relocating with employer visa sponsorship',
  email: 'ading.assegaf@gmail.com',
  linkedin: 'https://www.linkedin.com/in/chaidirassegaf/',
  github: 'https://github.com/miraquel',
  resume: '/resume.pdf',
  /** Last time the facts on this page were revised */
  revised: '2026-10-08',
};

export interface GoodsLine {
  quantity?: string;
  goods: string;
  detail: string;
}

export const goods: GoodsLine[] = [
  { quantity: '8 years', goods: '.NET', detail: 'C#, ASP.NET Core, Web API, Blazor, Entity Framework Core' },
  { quantity: '5 years', goods: 'Dynamics 365 Finance & Operations', detail: 'X++, LCS, Azure DevOps' },
  { goods: 'Dynamics AX 2012', detail: 'X++, custom AIF services, reports' },
  { goods: 'Dynamics 365 Business Central', detail: 'AL, Power Apps, Power Automate' },
  { goods: 'Mobile and data', detail: 'Flutter and Dart, SQL Server, SSIS, MySQL' },
];
