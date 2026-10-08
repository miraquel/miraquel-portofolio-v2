import { containerMark, type ContainerMark } from '../lib/container-mark';

export interface Period {
  /** YYYY-MM */
  start: string;
  /** YYYY-MM */
  end: string;
}

export interface RouteStop {
  name: string;
  does: string;
  tech: string;
}

export interface CaseStudy {
  slug: string;
  steel: 'cobalt' | 'oxide';
  title: string;
  /** One line for the bill's Marks & numbers field */
  line: string;
  client: string;
  period: Period;
  cargo: string;
  /** Stops in order; legs[i] is what travels from stops[i] to stops[i + 1] */
  route: { stops: RouteStop[]; legs: string[][]; returns: string[] };
  evidence: { label: string; href?: string }[];
}

export interface ManifestLine {
  title: string;
  client: string;
  platform: string;
  period: Period;
  href?: string;
  /** Set when the line is one of the containers above */
  caseStudy?: string;
}

const caseStudies: CaseStudy[] = [
  {
    slug: 'fo-migration',
    steel: 'cobalt',
    title: 'AX 2012 R3 to Dynamics 365 F&O migration',
    line: "A car-rental group's ERP, code and data, moved to Dynamics 365 F&O",
    client: 'PT Mitra Pinasthika Mustika Rent',
    period: { start: '2022-04', end: '2023-04' },
    cargo:
      "I moved PT Mitra Pinasthika Mustika Rent's ERP from Dynamics AX 2012 R3 to Dynamics 365 Finance & Operations: I upgraded the X++ customisations to F&O extensions and migrated the master and transactional data.",
    route: {
      stops: [
        { name: 'Dynamics AX 2012 R3', does: "The client's live ERP and its X++ customisations", tech: 'X++, SQL Server' },
        { name: 'Dynamics 365 Finance & Operations', does: 'Extensions built and deployed through LCS and Azure DevOps, data migrated in', tech: 'X++, LCS, Azure DevOps' },
      ],
      legs: [['X++ customisations, upgraded to extensions', 'Master and transactional data']],
      returns: [],
    },
    evidence: [
      { label: 'Delivered at PT Intikom Berlian Mustika' },
      { label: 'Follows my 2020 F&O assessment for the same client' },
    ],
  },
  {
    slug: 'axfinmobile',
    steel: 'oxide',
    title: 'AXFinMobile',
    line: 'Invoice settlement from a phone, posted as AX 2012 R2 payment journals',
    client: 'PT Gandum Mas Kencana',
    period: { start: '2023-11', end: '2024-02' },
    cargo:
      "A Flutter app and ASP.NET Web API that let finance staff settle vendor and customer invoices from a phone: scan each invoice's QR code, build a payment batch, and the API posts it into AX 2012 R2 as a payment journal through a custom AIF service written in X++.",
    route: {
      stops: [
        { name: 'Flutter app', does: 'Finance staff scan invoice QR codes and build payment batches', tech: 'Flutter, Dart' },
        { name: 'ASP.NET Web API', does: 'Validates batches, keeps drafts in MySQL, signs staff in against Active Directory', tech: 'C#, ASP.NET Web API, MySQL' },
        { name: 'Dynamics AX 2012 R2', does: 'Marks open invoices for settlement and creates the payment journals', tech: 'X++, custom AIF service over WCF' },
      ],
      legs: [['Scanned invoices and payment batches'], ['Settlements through the AIF service']],
      returns: [
        'Open invoices, vendors and journal names flow back to the app.',
        'The same route runs invoice exchange (tukar faktur): preparation and billing.',
      ],
    },
    evidence: [{ label: 'About 60% less manual entry' }],
  },
  {
    slug: 'sparepart-management',
    steel: 'cobalt',
    title: 'Sparepart Management System v2',
    line: 'Warehouse scanners that receive, requisition and post into AX 2012 R2',
    client: 'PT Gandum Mas Kencana',
    period: { start: '2024-02', end: '2024-07' },
    cargo:
      "An ASP.NET Web API and Flutter app that move the warehouse's spare-part work onto handheld scanners: receiving against purchase orders, work orders, item requisitions and stock lookups, with every posting going into AX 2012 R2 through a custom AIF service.",
    route: {
      stops: [
        { name: 'Flutter app on scanners', does: 'Goods receipts against purchase orders, work orders, item requisitions', tech: 'Flutter, Zebra and camera scanning' },
        { name: 'ASP.NET Web API', does: 'Keeps drafts in MySQL, enforces warehouse access, signs staff in against LDAP', tech: 'C#, ASP.NET Web API, MySQL' },
        { name: 'Dynamics AX 2012 R2', does: 'Posts packing slips against purchase orders and creates inventory journals', tech: 'X++, custom AIF service over WCF' },
      ],
      legs: [['Goods-receipt lines, requisitions, work-order closings'], ['Postings through the AIF service']],
      returns: [
        'Items, stock levels and WMS locations flow back to the scanner.',
        'The API renders QR-coded labels that print over Bluetooth.',
      ],
    },
    evidence: [
      { label: 'Backend API source', href: 'https://github.com/miraquel/SparepartManagementSystem' },
      { label: 'Flutter app source', href: 'https://github.com/miraquel/SparepartManagementSystem_Flutter' },
    ],
  },
  {
    slug: 'futurist',
    steel: 'oxide',
    title: 'Futurist',
    line: 'Raw-material cost forecasting on the AX data warehouse',
    client: 'PT Gandum Mas Kencana',
    period: { start: '2025-01', end: '2025-05' },
    cargo:
      'An ASP.NET Core MVC application for forecasting raw-material costs: planners load forecasts and exchange rates, background jobs recompute each scenario against the AX data warehouse, and SignalR pushes the result to everyone watching.',
    route: {
      stops: [
        { name: 'AX data warehouse', does: 'Goods receipts, purchase orders, stock and sales history', tech: 'SQL Server' },
        { name: 'Hangfire workers', does: 'Recompute each scenario: material plans, bill-of-materials costs, finished-goods cost', tech: 'ASP.NET Core, Hangfire, stored procedures' },
        { name: 'Futurist web app', does: 'Planners upload forecasts and exchange rates and watch scenarios finish live', tech: 'ASP.NET Core MVC, SignalR, Keycloak sign-in' },
      ],
      legs: [['History, read by stored procedures'], ['Job-finished notices']],
      returns: [],
    },
    evidence: [{ label: 'Source on GitHub', href: 'https://github.com/miraquel/Futurist' }],
  },
];

export const containers = caseStudies.map((caseStudy) => ({
  ...caseStudy,
  mark: containerMark(caseStudy.period.start) as ContainerMark,
}));

export type Container = (typeof containers)[number];

const lines: ManifestLine[] = [
  { title: 'Generated Information Service Level System (GiselX)', client: 'PT Gandum Mas Kencana', platform: 'ASP.NET Core MVC, Entity Framework Core, SQL Server', period: { start: '2025-07', end: '2025-09' }, href: 'https://github.com/miraquel/GiselX' },
  { title: 'Futurist', client: 'PT Gandum Mas Kencana', platform: 'ASP.NET Core MVC, Hangfire, SignalR', period: { start: '2025-01', end: '2025-05' }, caseStudy: 'futurist' },
  { title: 'Sparepart Management System v2', client: 'PT Gandum Mas Kencana', platform: 'Dynamics AX 2012 R2, ASP.NET Web API, Flutter', period: { start: '2024-02', end: '2024-07' }, caseStudy: 'sparepart-management' },
  { title: 'AXFinMobile', client: 'PT Gandum Mas Kencana', platform: 'Dynamics AX 2012 R2, ASP.NET Web API, Flutter', period: { start: '2023-11', end: '2024-02' }, caseStudy: 'axfinmobile' },
  { title: 'Data forensics on business process flows', client: 'PT Mega Akses Persada (Fiberstar)', platform: 'Dynamics AX 2012 R3, X++', period: { start: '2023-06', end: '2023-07' } },
  { title: 'AX 2012 R3 to Dynamics 365 F&O migration', client: 'PT Mitra Pinasthika Mustika Rent', platform: 'Dynamics 365 F&O, X++', period: { start: '2022-04', end: '2023-04' }, caseStudy: 'fo-migration' },
  { title: 'Price Calc, a car-rental price calculator', client: 'PT Mitra Pinasthika Mustika Rent', platform: 'Blazor WebAssembly, .NET 5', period: { start: '2021-09', end: '2022-02' } },
  { title: 'API gateway with CMS', client: 'PT Gunung Raja Paksi', platform: 'ASP.NET Core, .NET Core 2.1', period: { start: '2021-04', end: '2021-08' } },
  { title: 'ERP change request', client: 'PT Alliance One Indonesia', platform: 'Dynamics 365 Business Central, AL', period: { start: '2020-11', end: '2020-12' } },
  { title: 'Talent: Attract custom development', client: 'PT Intikom Berlian Mustika', platform: 'Dynamics 365 Talent', period: { start: '2020-09', end: '2020-10' } },
  { title: 'ERP custom development', client: 'PT Saritama Food Processing', platform: 'Dynamics 365 Business Central, AL', period: { start: '2020-09', end: '2020-10' } },
  { title: 'Dynamics 365 F&O assessment', client: 'PT Mitra Pinasthika Mustika Rent, head office', platform: 'Dynamics 365 F&O, X++', period: { start: '2020-07', end: '2020-12' } },
  { title: 'ERP custom development', client: 'PT Karanganyar Indo Auto System', platform: 'Dynamics 365 Business Central, AL', period: { start: '2020-06', end: '2020-07' } },
  { title: 'DTS migration, phase 2: SSIS data-flow automation', client: 'PT Bank Central Asia Finance', platform: 'SQL Server, SSIS, C#', period: { start: '2020-03', end: '2020-06' } },
  { title: 'Human Resources custom development', client: 'PT Intikom Berlian Mustika', platform: 'Dynamics 365 Human Resources', period: { start: '2020-02', end: '2020-09' } },
  { title: 'Transfer order and transactional demand reports', client: 'PT Indotruck Utama', platform: 'Dynamics 365 Business Central, AL', period: { start: '2020-01', end: '2020-12' } },
  { title: 'DTS migration, phase 1: SSIS data-flow automation', client: 'PT Bank Central Asia Finance', platform: 'SQL Server, SSIS, C#', period: { start: '2019-01', end: '2019-02' } },
  { title: 'Shipping order and invoice reports', client: 'PT Natural Java Spice', platform: 'Dynamics AX 2012 R3, X++', period: { start: '2018-03', end: '2018-12' } },
  { title: 'Dynamics AX 2012 R3 implementation', client: 'PT Visionet International', platform: 'Dynamics AX 2012 R3, X++', period: { start: '2018-03', end: '2018-12' } },
];

export const manifest = lines.map((line, index) => ({
  ...line,
  number: index + 1,
  container: line.caseStudy ? containers.find((c) => c.slug === line.caseStudy) : undefined,
}));
