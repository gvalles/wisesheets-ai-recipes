import { mockFinancials, mockStatements } from './mock';
import type { CompanySearchResponse, LongResponse, StatementLine, StatementsResponse, WideResponse } from '../types/api';

export type Mode = 'live' | 'mock';

const q = (params: Record<string, string>) => new URLSearchParams(params).toString();
const runtimeBaseUrl = '/api/wisesheets';

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export async function searchCompanies(query: string, signal?: AbortSignal): Promise<CompanySearchResponse> {
  const url = `${runtimeBaseUrl}/v1/companies?${q({ q: query, limit: '8' })}`;
  return fetchJson(url, { signal });
}

export async function getFinancials(args: {
  ticker: string;
  metrics: string[];
  period: string;
  frequency: 'annual' | 'quarterly';
  layout: 'wide' | 'long';
  mode: Mode;
}): Promise<WideResponse | LongResponse> {
  if (args.mode === 'mock') return mockFinancials(args.metrics, args.period, args.layout);
  const url = `${runtimeBaseUrl}/v1/financials/?${q({ tickers: args.ticker, metrics: args.metrics.join(','), period: args.period, frequency: args.frequency, layout: args.layout, include: 'quality' })}`;
  return fetchJson(url);
}

export async function getStatements(ticker: string, period: string, mode: Mode): Promise<StatementsResponse> {
  if (mode === 'mock') return mockStatements();
  const url = `${runtimeBaseUrl}/v1/statements/${ticker}?${q({ frequency: 'annual', period, include: 'quality' })}`;
  const raw = await fetchJson<unknown>(url);
  return normalizeStatements(raw);
}

function normalizeStatements(raw: unknown): StatementsResponse {
  if (isNormalizedStatements(raw)) return raw;

  const payload = raw as {
    company?: { ticker?: string; name?: string };
    data?: Array<{
      period?: { end?: string };
      statements?: Record<string, { lines?: Array<{ metric?: string; label?: string; value?: string; source?: unknown }> }>;
    }>;
    meta?: StatementsResponse['meta'];
  };

  const periods = (payload.data ?? []).map((entry) => entry.period?.end).filter((p): p is string => Boolean(p));
  const buildSection = (sectionKey: 'income_statement' | 'balance_sheet' | 'cash_flow', section: string) => {
    const lines = new Map<string, StatementLine>();

    for (const entry of payload.data ?? []) {
      const periodEnd = entry.period?.end;
      if (!periodEnd) continue;

      for (const line of entry.statements?.[sectionKey]?.lines ?? []) {
        const key = line.metric ?? line.label;
        if (!key) continue;
        if (!lines.has(key)) {
          lines.set(key, { key, label: line.label ?? key, values: {} });
        }
        lines.get(key)!.values[periodEnd] = {
          value: line.value ?? '',
          source: {
            tag: key,
            ...(typeof line.source === 'object' && line.source !== null ? line.source as NonNullable<StatementLine['values'][string]['source']> : {})
          }
        };
      }
    }

    return { section, items: [...lines.values()] };
  };

  return {
    data: {
      ticker: payload.company?.ticker ?? 'n/a',
      companyName: payload.company?.name ?? 'n/a',
      periods,
      statements: {
        income_statement: buildSection('income_statement', 'Income Statement'),
        balance_sheet: buildSection('balance_sheet', 'Balance Sheet'),
        cash_flow: buildSection('cash_flow', 'Cash Flow')
      }
    },
    meta: payload.meta
  };
}

function isNormalizedStatements(raw: unknown): raw is StatementsResponse {
  return Boolean(
    raw &&
    typeof raw === 'object' &&
    'data' in raw &&
    (raw as StatementsResponse).data &&
    !Array.isArray((raw as StatementsResponse).data) &&
    (raw as StatementsResponse).data.statements
  );
}
