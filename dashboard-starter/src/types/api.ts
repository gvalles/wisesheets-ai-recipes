export type QualityFlags = 'amended' | 'superseded' | string;

export type WideRow = {
  cik?: string;
  ticker: string;
  companyName: string;
  periodEnd: string;
  fiscalYear: number;
  fiscalPeriod?: string;
  [metric: string]: string | number | undefined;
};

export type LongRow = {
  ticker: string;
  companyName: string;
  metric: string;
  periodEnd: string;
  fiscalYear: number;
  value: string;
  unit?: string;
  source?: {
    tag?: string;
    taxonomy?: string;
    accession?: string;
    filingDate?: string;
    isAmendment?: boolean;
    isSuperseded?: boolean;
  };
};

export type ApiMeta = {
  quality?: Record<string, Record<string, { completeness: string; flags: QualityFlags[] }>>;
  missing?: string[];
};

export type WideResponse = { data: WideRow[]; meta?: ApiMeta };
export type LongResponse = { data: LongRow[]; meta?: ApiMeta };

export type CompanySearchResult = {
  ticker: string;
  cik?: string;
  name: string;
  exchange?: string;
  sic?: string;
  sicDescription?: string;
};

export type CompanySearchResponse = {
  data: CompanySearchResult[];
  meta?: {
    returned?: number;
    nextCursor?: string | null;
  };
};

export type StatementCell = {
  value: string;
  source?: LongRow['source'];
};

export type StatementLine = {
  label: string;
  key: string;
  values: Record<string, StatementCell>;
};

export type StatementSection = {
  section: string;
  items: StatementLine[];
};

export type StatementsResponse = {
  data: {
    ticker: string;
    companyName: string;
    periods: string[];
    statements: {
      income_statement: StatementSection;
      balance_sheet: StatementSection;
      cash_flow: StatementSection;
    };
  };
  meta?: ApiMeta;
};

export type SectionState<T> = {
  loading: boolean;
  error?: string;
  data?: T;
};
