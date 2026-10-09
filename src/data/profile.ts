// Who ships, where from, and how to reach them. Claims follow PRODUCT.md's claim rules:
// the only numbers allowed are 8 years .NET, 5 years D365 F&O, the five-month Business
// Central implementation, and about 60% less manual entry (AXFinMobile).

export const profile = {
  name: 'Chaidir Ali Assegaf',
  title: 'Dynamics 365 F&O & .NET Developer',
  summary:
    'I build and customise Dynamics AX 2012 and Dynamics 365 Finance & Operations, and the .NET services and mobile apps that connect to them.',
  /** The Consignee value: the roles this is addressed to, stated plainly */
  roles: 'Dynamics 365 F&O, AX or .NET backend roles',
  based: 'Indonesia',
  /** Port of discharge, in words a recruiter reads without decoding the label; also the meta description's last sentence */
  discharge: { value: 'Open to relocating abroad', detail: 'With employer visa sponsorship' },
  email: 'ading.assegaf@gmail.com',
  linkedin: 'https://www.linkedin.com/in/chaidirassegaf/',
  github: 'https://github.com/miraquel',
  resume: '/resume.pdf',
  /** Last time the facts on this page were revised */
  revised: '2026-10-08',
};

export type GoodsId = 'dotnet' | 'fo' | 'ax2012' | 'bc' | 'mobile-data';

export interface GoodsLine {
  /** What a container's `carries` names this line by */
  id: GoodsId;
  quantity?: string;
  goods: string;
  detail: string;
  /** The goods as the Shipper field's screening line names them */
  short?: string;
}

export const goods: GoodsLine[] = [
  { id: 'dotnet', quantity: '8 years', goods: '.NET', detail: 'C#, ASP.NET Core, Web API, Blazor, Entity Framework Core' },
  { id: 'fo', quantity: '5 years', goods: 'Dynamics 365 Finance & Operations', short: 'Dynamics 365 F&O', detail: 'X++, LCS, Azure DevOps' },
  { id: 'ax2012', goods: 'Dynamics AX 2012', detail: 'X++, custom AIF services, reports' },
  { id: 'bc', goods: 'Dynamics 365 Business Central', detail: 'AL, Power Apps, Power Automate' },
  { id: 'mobile-data', goods: 'Mobile and data', detail: 'Flutter and Dart, SQL Server, SSIS, MySQL' },
];
