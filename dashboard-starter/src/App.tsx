import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { defaultTicker } from './config';
import { getFinancials, getStatements, searchCompanies, type Mode } from './lib/api';
import { abbreviateCurrency, deltaPct, formatPercent, formatRatio, parseNum } from './lib/format';
import { heroBadges, healthScore, insights } from './lib/rules';
import { resolveXbrlTag } from './lib/xbrl';
import type { CompanySearchResult, LongResponse, SectionState, StatementsResponse, WideResponse, WideRow } from './types/api';

const metricsAll = [
  'revenue', 'gross_profit', 'operating_income', 'net_income', 'free_cash_flow', 'net_cash_from_operating_activities', 'capital_expenditures',
  'cash_and_cash_equivalents', 'total_debt', 'total_assets', 'total_liabilities', 'total_equity', 'total_current_assets', 'total_current_liabilities',
  'gross_margin', 'operating_margin', 'net_margin', 'free_cash_flow_margin', 'roe', 'roa', 'current_ratio', 'debt_to_equity', 'free_cash_flow_to_net_income', 'revenue_growth_yoy'
];

const C = {
  blue:   '#4da3ff',
  teal:   '#3bd3a6',
  amber:  '#f5b14c',
  purple: '#c084fc',
  red:    '#ff6b6b',
  grid:   '#1e2329',
  axis:   '#7f8b99',
} as const;

// ── Shared helpers ────────────────────────────────────────────────────────────

function badgeStyle(value: string) {
  if (['Strong', 'Excellent', 'Low', 'Healthy'].includes(value)) return 'border-good/30 bg-good/10 text-good';
  if (['Moderate', 'Solid', 'Watch'].includes(value)) return 'border-amber/30 bg-amber/10 text-amber';
  return 'border-bad/30 bg-bad/10 text-bad';
}

function badgeTextColor(value: string) {
  if (['Strong', 'Excellent', 'Low', 'Healthy'].includes(value)) return 'text-good';
  if (['Moderate', 'Solid', 'Watch'].includes(value)) return 'text-amber';
  return 'text-bad';
}

// ── Shared UI components ──────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 40;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - Math.min(score, 100) / 100);
  const color = score >= 70 ? '#39d98a' : score >= 45 ? '#f5b14c' : '#ff6b6b';
  const label = score >= 70 ? 'Strong' : score >= 45 ? 'Fair' : 'Weak';
  return (
    <div className="flex flex-col items-center gap-0.5">
      <svg width={104} height={104} viewBox="0 0 104 104">
        <circle cx={52} cy={52} r={r} fill="none" stroke="#1e2329" strokeWidth={9} />
        <circle
          cx={52} cy={52} r={r} fill="none" stroke={color} strokeWidth={9}
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset}
          transform="rotate(-90 52 52)"
          style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
        />
        <text x={52} y={49} textAnchor="middle" fill="white" fontSize={22} fontWeight="700" fontFamily="monospace">{score}</text>
        <text x={52} y={64} textAnchor="middle" fill={color} fontSize={10} fontWeight="600" fontFamily="monospace">{label}</text>
      </svg>
      <div className="text-[10px] text-muted uppercase tracking-widest">Health Score</div>
    </div>
  );
}

function Legend({ items, className = '' }: { items: { color: string; label: string }[]; className?: string }) {
  return (
    <div className={`flex flex-wrap gap-x-4 gap-y-1 ${className}`}>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5 text-[11px] text-muted">
          <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
          {item.label}
        </div>
      ))}
    </div>
  );
}

function ChartTooltip({ active, payload, label, fmt }: {
  active?: boolean; payload?: any[]; label?: any; fmt?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1d23] border border-border rounded-lg px-3 py-2.5 shadow-card text-xs z-50">
      <div className="text-[10px] text-muted uppercase tracking-wider mb-2">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-5 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
            <span className="text-muted capitalize">{(p.name ?? p.dataKey).replace(/_/g, ' ')}</span>
          </div>
          <span className="font-semibold text-slate-100">{fmt ? fmt(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

function ChartCard({ title, subtitle, legend, children }: {
  title: string; subtitle?: string; legend?: { color: string; label: string }[]; children: any;
}) {
  return (
    <section className="card p-4 md:p-5 animate-rise">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        {subtitle && <span className="text-[11px] text-muted">{subtitle}</span>}
      </div>
      {legend && <Legend items={legend} className="mb-3" />}
      <div className="h-64">{children}</div>
    </section>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

function App() {
  const [tickerInput, setTickerInput] = useState(defaultTicker);
  const [ticker, setTicker]           = useState(defaultTicker);
  const [mode, setMode]               = useState<Mode>('live');
  const [notice, setNotice]           = useState<string>();
  const [suggestions, setSuggestions] = useState<CompanySearchResult[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string>();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);

  const [latest,     setLatest]     = useState<SectionState<WideResponse>>({ loading: true });
  const [last2,      setLast2]      = useState<SectionState<WideResponse>>({ loading: true });
  const [last5,      setLast5]      = useState<SectionState<WideResponse>>({ loading: true });
  const [last5Long, setLast5Long] = useState<SectionState<LongResponse>>({ loading: true });
  const [statements, setStatements] = useState<SectionState<StatementsResponse>>({ loading: true });

  useEffect(() => {
    void loadAll(mode, ticker);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker]);

  useEffect(() => {
    const query = tickerInput.trim();
    if (query.length < 2 || query.toUpperCase() === ticker.toUpperCase()) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      setSearchError(undefined);
      return;
    }

    const controller = new AbortController();
    const t = window.setTimeout(() => {
      setSuggestionsLoading(true);
      searchCompanies(query, controller.signal)
        .then((res) => {
          setSuggestions(res.data ?? []);
          setSearchError(undefined);
          setIsSearchOpen(true);
          setActiveSuggestion(-1);
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === 'AbortError') return;
          setSuggestions([]);
          setSearchError('Search unavailable');
        })
        .finally(() => {
          if (!controller.signal.aborted) setSuggestionsLoading(false);
        });
    }, 200);

    return () => {
      controller.abort();
      window.clearTimeout(t);
    };
  }, [tickerInput, ticker]);

  async function loadAll(activeMode: Mode, targetTicker = ticker) {
    setLatest({ loading: true });
    setLast2({ loading: true });
    setLast5({ loading: true });
    setLast5Long({ loading: true });
    setStatements({ loading: true });

    const runs = await Promise.allSettled([
      getFinancials({ ticker: targetTicker, metrics: metricsAll, period: 'latest',  frequency: 'annual', layout: 'wide', mode: activeMode }),
      getFinancials({ ticker: targetTicker, metrics: metricsAll, period: 'last2y',  frequency: 'annual', layout: 'wide', mode: activeMode }),
      getFinancials({ ticker: targetTicker, metrics: metricsAll, period: 'last5y',  frequency: 'annual', layout: 'wide', mode: activeMode }),
      getFinancials({ ticker: targetTicker, metrics: ['revenue', 'gross_profit', 'operating_income', 'net_income', 'gross_margin', 'operating_margin', 'net_margin', 'free_cash_flow_margin'], period: 'last5y', frequency: 'annual', layout: 'long', mode: activeMode }),
      getStatements(targetTicker, 'last5y', activeMode),
    ]);

    const [a, b, c, d, e] = runs;
    setLatest(a.status === 'fulfilled' ? { loading: false, data: a.value as WideResponse } : { loading: false, error: String(a.reason) });
    setLast2(b.status  === 'fulfilled' ? { loading: false, data: b.value as WideResponse } : { loading: false, error: String(b.reason) });
    setLast5(c.status  === 'fulfilled' ? { loading: false, data: c.value as WideResponse } : { loading: false, error: String(c.reason) });
    setLast5Long(d.status === 'fulfilled' ? { loading: false, data: d.value as LongResponse } : { loading: false, error: String(d.reason) });
    setStatements(e.status === 'fulfilled' ? { loading: false, data: e.value as StatementsResponse } : { loading: false, error: String(e.reason) });

    if (activeMode === 'live' && runs.some((r) => r.status === 'rejected')) {
      setNotice('Live mode failed for one or more sections. Auto-fallback to Mock data.');
      setMode('mock');
      await loadAll('mock', targetTicker);
      return;
    }
    if (activeMode === 'live') setNotice(undefined);
  }

  function submitTicker(nextTicker = tickerInput) {
    const next = nextTicker.toUpperCase().trim() || defaultTicker;
    setTickerInput(next);
    setIsSearchOpen(false);
    setActiveSuggestion(-1);
    if (next === ticker) {
      void loadAll(mode, next);
    } else {
      setTicker(next);
    }
  }

  function selectSuggestion(company: CompanySearchResult) {
    submitTicker(company.ticker);
  }

  const latestRow = latest.data?.data[0];
  const last2Rows = [...(last2.data?.data ?? [])].sort((a, b) => a.periodEnd.localeCompare(b.periodEnd));
  const last5Rows = [...(last5.data?.data ?? [])].sort((a, b) => a.periodEnd.localeCompare(b.periodEnd));

  const quality = useMemo(() => {
    if (!latestRow || !latest.data?.meta?.quality?.[latestRow.ticker]) return null;
    const q = latest.data.meta.quality[latestRow.ticker];
    const periods = Object.entries(q).sort((a, b) => a[0].localeCompare(b[0]));
    const newest = periods[periods.length - 1];
    if (!newest) return null;
    const [newestPeriod, newestData] = newest;
    const bad = Number.parseFloat(newestData.completeness) < 0.6 || newestData.flags.some((f) => ['amended', 'superseded'].includes(f));
    const fallback = bad ? periods.filter(([, v]) => Number.parseFloat(v.completeness) >= 0.6).at(-1) : null;
    return { newestPeriod, bad, fallbackPeriod: fallback?.[0] };
  }, [latest.data, latestRow]);

  const headlineRow = useMemo(() => {
    if (!quality?.bad || !quality.fallbackPeriod) return latestRow;
    return last5Rows.find((r) => r.periodEnd === quality.fallbackPeriod) ?? latestRow;
  }, [quality, latestRow, last5Rows]);

  const hero = useMemo(() => {
    if (!headlineRow || !last5Rows.length) return null;
    return { score: healthScore(headlineRow, last5Rows), badges: heroBadges(headlineRow) };
  }, [headlineRow, last5Rows]);

  const trendLong = useMemo(() => {
    const rows = last5Long.data?.data ?? [];
    const map = new Map<number, any>();
    for (const r of rows) {
      if (!map.has(r.fiscalYear)) map.set(r.fiscalYear, { year: r.fiscalYear });
      map.get(r.fiscalYear)[r.metric] = parseNum(r.value);
    }
    return [...map.values()].sort((a, b) => a.year - b.year);
  }, [last5Long.data]);

  const isLive = mode === 'live';

  return (
    <div className="min-h-screen bg-bg text-slate-100 px-4 py-5 md:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto space-y-4">

        {/* ── Header ── */}
        <header className="card p-4 md:p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <polyline points="1,12 5,7 8,10 12,4 15,6" stroke={C.blue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-[0.1em] uppercase text-slate-100">Wisesheets Terminal</h1>
              <p className="text-[11px] text-muted mt-0.5">SEC/EDGAR fundamentals · fiscal year</p>
            </div>
          </div>
          <div className="flex gap-2 items-center w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <input
                value={tickerInput}
                onChange={(e) => {
                  setTickerInput(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                onBlur={() => window.setTimeout(() => setIsSearchOpen(false), 120)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown' && suggestions.length) {
                    e.preventDefault();
                    setIsSearchOpen(true);
                    setActiveSuggestion((i) => Math.min(i + 1, suggestions.length - 1));
                    return;
                  }
                  if (e.key === 'ArrowUp' && suggestions.length) {
                    e.preventDefault();
                    setActiveSuggestion((i) => Math.max(i - 1, 0));
                    return;
                  }
                  if (e.key === 'Escape') {
                    setIsSearchOpen(false);
                    setActiveSuggestion(-1);
                    return;
                  }
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const selected = activeSuggestion >= 0 ? suggestions[activeSuggestion] : undefined;
                    selected ? selectSuggestion(selected) : submitTicker();
                  }
                }}
                placeholder="Search ticker or company"
                className="bg-black/40 border border-border rounded-lg px-3 py-2 w-full uppercase text-sm font-bold tracking-widest placeholder:text-border focus:outline-none focus:border-accent/50 transition-colors"
                role="combobox"
                aria-expanded={isSearchOpen}
                aria-controls="company-search-suggestions"
                aria-autocomplete="list"
              />
              {isSearchOpen && (tickerInput.trim().length >= 2 || suggestions.length > 0) && (
                <div
                  id="company-search-suggestions"
                  className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-lg border border-border bg-[#111419] shadow-card"
                  role="listbox"
                >
                  {suggestionsLoading && (
                    <div className="px-3 py-2.5 text-[11px] text-muted">Searching...</div>
                  )}
                  {!suggestionsLoading && searchError && (
                    <div className="px-3 py-2.5 text-[11px] text-amber">{searchError}</div>
                  )}
                  {!suggestionsLoading && !searchError && suggestions.length === 0 && (
                    <div className="px-3 py-2.5 text-[11px] text-muted">No matches</div>
                  )}
                  {!suggestionsLoading && !searchError && suggestions.map((company, index) => (
                    <button
                      key={`${company.ticker}-${company.cik ?? index}`}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectSuggestion(company)}
                      className={`w-full px-3 py-2.5 text-left transition-colors ${index === activeSuggestion ? 'bg-accent/12' : 'hover:bg-white/[0.04]'}`}
                      role="option"
                      aria-selected={index === activeSuggestion}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-bold tracking-widest text-slate-100">{company.ticker}</span>
                        {company.exchange && <span className="text-[10px] text-muted">{company.exchange}</span>}
                      </div>
                      <div className="mt-0.5 truncate text-[11px] text-muted normal-case tracking-normal">{company.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => submitTicker()}
              className="bg-accent text-[#0a0b0d] px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-accent/90 active:scale-95 transition-all"
            >
              Load
            </button>
            <button
              onClick={() => { const next = isLive ? 'mock' : 'live'; setMode(next); void loadAll(next, ticker); }}
              className={`flex items-center gap-1.5 border px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isLive ? 'border-good/40 text-good hover:border-good/60' : 'border-amber/40 text-amber hover:border-amber/60'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isLive ? 'bg-good animate-pulse' : 'bg-amber'}`} />
              {isLive ? 'Live' : 'Mock'}
            </button>
          </div>
        </header>

        {/* ── Notice ── */}
        {notice && (
          <div className="border border-amber/30 bg-amber/5 rounded-lg px-4 py-2.5 flex items-center gap-2.5 text-amber text-xs">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
              <path d="M7 1.5L13 12.5H1L7 1.5Z" stroke="#f5b14c" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M7 6v2.5" stroke="#f5b14c" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="7" cy="10.5" r="0.6" fill="#f5b14c" />
            </svg>
            {notice}
          </div>
        )}

        {/* ── Hero ── */}
        <section className="card p-5 animate-rise">
          {!hero || !headlineRow ? <HeroSkeleton /> : (
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex-1 min-w-0 space-y-4">
                {/* Title row */}
                <div>
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">{headlineRow.ticker}</h2>
                    <span className="text-muted text-sm font-normal">{headlineRow.companyName}</span>
                    <span className="text-[11px] text-muted ml-auto">FY{headlineRow.fiscalYear}</span>
                  </div>
                  {quality?.bad && <p className="text-[11px] text-amber mt-1">Latest filing partially processed — showing FY{headlineRow.fiscalYear}</p>}
                </div>

                {/* Colored badges */}
                <div className="flex flex-wrap gap-2">
                  {Object.entries(hero.badges).map(([k, v]) => (
                    <span key={k} className={`inline-flex items-center gap-1.5 border rounded-full px-2.5 py-1 text-xs font-medium ${badgeStyle(v)}`}>
                      <span className="capitalize text-[10px] opacity-70">{k}</span>
                      {v}
                    </span>
                  ))}
                </div>

                {/* Summary */}
                <p className="text-sm text-muted leading-relaxed">
                  {headlineRow.ticker} shows{' '}
                  <span className={badgeTextColor(hero.badges.revenue)}>{hero.badges.revenue.toLowerCase()}</span> growth,{' '}
                  <span className={badgeTextColor(hero.badges.margins)}>{hero.badges.margins.toLowerCase()}</span> profitability,{' '}
                  <span className={badgeTextColor(hero.badges.cashFlow)}>{hero.badges.cashFlow.toLowerCase()}</span> cash conversion,
                  and <span className={badgeTextColor(hero.badges.debt)}>{hero.badges.debt.toLowerCase()}</span> debt risk.
                </p>

                {/* Score breakdown mini-bars */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-1">
                  {Object.entries(hero.score.breakdown).map(([k, v]) => {
                    const pct = (v / 25) * 100;
                    const barColor = v >= 18 ? '#39d98a' : v >= 10 ? '#f5b14c' : '#ff6b6b';
                    return (
                      <div key={k}>
                        <div className="flex justify-between text-[10px] text-muted mb-1.5">
                          <span className="capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="font-semibold" style={{ color: barColor }}>{v}/25</span>
                        </div>
                        <div className="h-1 bg-border rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: barColor }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Score ring */}
              <div className="flex-shrink-0 flex justify-center md:justify-end">
                <ScoreRing score={hero.score.score} />
              </div>
            </div>
          )}
        </section>

        {/* ── KPI grid ── */}
        <KpiGrid latest={headlineRow} last5={last5Rows} />

        {/* ── Charts ── */}
        <div className="grid lg:grid-cols-2 gap-4">
          <ChartCard title="Revenue & Profit" subtitle="5-year trend" legend={[
            { color: C.blue,   label: 'Revenue' },
            { color: C.teal,   label: 'Gross Profit' },
            { color: C.amber,  label: 'Operating Income' },
            { color: C.purple, label: 'Net Income' },
          ]}>
            <RevProfit data={trendLong} />
          </ChartCard>
          <ChartCard title="Margin Trends" subtitle="5-year trend" legend={[
            { color: C.blue,  label: 'Gross' },
            { color: C.teal,  label: 'Operating' },
            { color: C.amber, label: 'Net' },
            { color: C.red,   label: 'FCF' },
          ]}>
            <Margins data={trendLong} />
          </ChartCard>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <CashFlowQuality rows={last5Rows} />
          <BalanceStrength rows={last5Rows} />
        </div>

        <StatementsTabs state={statements} />
        <InsightsPanel rows={last5Rows} />
      </div>
    </div>
  );
}

// ── Section components ────────────────────────────────────────────────────────

function HeroSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-6 animate-pulse">
      <div className="flex-1 space-y-3">
        <div className="h-7 w-52 bg-border rounded" />
        <div className="flex gap-2">
          {[20, 20, 20, 16].map((w, i) => <div key={i} className="h-6 bg-border rounded-full" style={{ width: `${w * 4}px` }} />)}
        </div>
        <div className="h-4 w-full bg-border/60 rounded" />
        <div className="h-4 w-3/4 bg-border/60 rounded" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-7 bg-border/40 rounded" />)}
        </div>
      </div>
      <div className="w-[104px] h-[104px] rounded-full bg-border/30 mx-auto md:mx-0 flex-shrink-0" />
    </div>
  );
}

function SparkTooltip({ active, payload, label, fmt }: {
  active?: boolean; payload?: any[]; label?: any; fmt: (v: string) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1d23] border border-border rounded px-2 py-1.5 shadow-card text-xs">
      <div className="text-[10px] text-muted">FY{label}</div>
      <div className="font-semibold text-slate-100 mt-0.5">{fmt(String(payload[0].value))}</div>
    </div>
  );
}

function KpiGrid({ latest, last5 }: { latest?: WideRow; last5: WideRow[] }) {
  const base = [
    { key: 'revenue',        label: 'Revenue',          fmt: abbreviateCurrency },
    { key: 'net_income',     label: 'Net Income',        fmt: abbreviateCurrency },
    { key: 'free_cash_flow', label: 'Free Cash Flow',    fmt: abbreviateCurrency },
    { key: 'gross_margin',   label: 'Gross Margin',      fmt: formatPercent },
    { key: 'roe',            label: 'Return on Equity',  fmt: formatPercent },
    { key: 'debt_to_equity', label: 'Debt / Equity',     fmt: formatRatio },
  ];

  if (!latest) {
    return (
      <section className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {base.map((k) => (
          <div key={k.key} className="card p-4 animate-pulse">
            <div className="h-3 w-24 bg-border rounded mb-3" />
            <div className="h-7 w-32 bg-border rounded mb-2" />
            <div className="h-4 w-20 bg-border/60 rounded mb-3" />
            <div className="h-12 bg-border/30 rounded" />
          </div>
        ))}
      </section>
    );
  }

  // Find previous year relative to headlineRow (last5 is sorted ascending)
  const headlineIdx = last5.findIndex((r) => r.periodEnd === latest.periodEnd);
  const prev = headlineIdx > 0
    ? last5[headlineIdx - 1]          // found — use the prior year
    : headlineIdx === -1
    ? last5.at(-1)                    // not in last5 (e.g. TTM) — compare to most recent full year
    : undefined;                      // headlineRow is the oldest row in last5, no prior year

  return (
    <section className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {base.map((k) => {
        const d = deltaPct(String(latest[k.key]), prev ? String(prev[k.key]) : undefined);
        const isPos = d !== null && d >= 0;
        const spark = last5.map((r) => ({ y: r.fiscalYear, v: parseNum(String(r[k.key])) ?? 0 }));
        return (
          <div key={k.key} className="card p-4 animate-rise hover:border-border/80 transition-colors">
            <div className="text-[11px] text-muted uppercase tracking-wider">{k.label}</div>
            <div className="text-2xl font-bold mt-1.5 tracking-tight">{k.fmt(String(latest[k.key]))}</div>
            <div className="mt-1.5 h-5">
              {d === null ? (
                <span className="text-[11px] text-muted">n/a</span>
              ) : (
                <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${isPos ? 'bg-good/10 text-good' : 'bg-bad/10 text-bad'}`}>
                  {isPos ? '▲' : '▼'} {(Math.abs(d) * 100).toFixed(1)}% YoY
                </span>
              )}
            </div>
            <div className="h-12 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spark}>
                  <Tooltip
                    content={(p) => <SparkTooltip active={p.active} payload={p.payload} label={p.label} fmt={k.fmt} />}
                    cursor={{ stroke: C.axis, strokeWidth: 1, strokeDasharray: '3 3' }}
                  />
                  <Line type="monotone" dataKey="v" stroke={C.blue} dot={{ r: 2, fill: C.blue }} strokeWidth={1.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
    </section>
  );
}

function RevProfit({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={C.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="year" stroke={C.axis} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis stroke={C.axis} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => abbreviateCurrency(String(v))} />
        <Tooltip content={(p) => <ChartTooltip {...p} fmt={(v) => abbreviateCurrency(String(v))} />} />
        <Line dataKey="revenue"          stroke={C.blue}   dot={false} strokeWidth={2} name="Revenue" />
        <Line dataKey="gross_profit"     stroke={C.teal}   dot={false} strokeWidth={2} name="Gross Profit" />
        <Line dataKey="operating_income" stroke={C.amber}  dot={false} strokeWidth={2} name="Operating Income" />
        <Line dataKey="net_income"       stroke={C.purple} dot={false} strokeWidth={2} name="Net Income" />
      </LineChart>
    </ResponsiveContainer>
  );
}

function Margins({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={C.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="year" stroke={C.axis} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis stroke={C.axis} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
        <Tooltip content={(p) => <ChartTooltip {...p} fmt={(v) => `${(v * 100).toFixed(1)}%`} />} />
        <Line dataKey="gross_margin"          stroke={C.blue}  dot={false} strokeWidth={2} name="Gross Margin" />
        <Line dataKey="operating_margin"      stroke={C.teal}  dot={false} strokeWidth={2} name="Operating Margin" />
        <Line dataKey="net_margin"            stroke={C.amber} dot={false} strokeWidth={2} name="Net Margin" />
        <Line dataKey="free_cash_flow_margin" stroke={C.red}   dot={false} strokeWidth={2} name="FCF Margin" />
      </LineChart>
    </ResponsiveContainer>
  );
}

function CashFlowQuality({ rows }: { rows: WideRow[] }) {
  const latest = rows.at(-1);
  if (!latest) return <section className="card p-5 h-72 animate-pulse" />;

  const ni    = parseNum(String(latest.net_income)) ?? 0;
  const fcf   = parseNum(String(latest.free_cash_flow)) ?? 0;
  const ocf   = parseNum(String(latest.net_cash_from_operating_activities)) ?? 0;
  const capex = parseNum(String(latest.capital_expenditures)) ?? 0;
  const rev   = parseNum(String(latest.revenue)) ?? 0;
  const ratio = fcf / (ni || 1);

  const verdict      = ratio > 1 ? 'Excellent conversion' : ratio > 0.8 ? 'Healthy conversion' : 'Watch conversion';
  const verdictColor = ratio > 1 ? 'text-good' : ratio > 0.8 ? 'text-amber' : 'text-bad';

  const stats = [
    { label: 'Net Income',       value: abbreviateCurrency(String(ni)) },
    { label: 'Free Cash Flow',   value: abbreviateCurrency(String(fcf)) },
    { label: 'FCF / NI',         value: formatRatio(String(ratio)) },
    { label: 'OCF / NI',         value: formatRatio(String(ocf / (ni || 1))) },
    { label: 'Capex / Revenue',  value: formatPercent(String(capex / (rev || 1))) },
  ];

  return (
    <section className="card p-4 md:p-5 animate-rise">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200">Cash Flow Quality</h3>
        <span className={`text-[11px] font-medium ${verdictColor}`}>{verdict}</span>
      </div>
      <div className="grid grid-cols-3 gap-x-4 gap-y-3 mb-4">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="text-[10px] text-muted uppercase tracking-wide">{s.label}</div>
            <div className="text-sm font-semibold mt-0.5">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows.map((r) => ({ year: r.fiscalYear, ni: parseNum(String(r.net_income)) ?? 0, fcf: parseNum(String(r.free_cash_flow)) ?? 0 }))} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barGap={2}>
            <CartesianGrid stroke={C.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" stroke={C.axis} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis stroke={C.axis} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => abbreviateCurrency(String(v))} />
            <Tooltip content={(p) => <ChartTooltip {...p} fmt={(v) => abbreviateCurrency(String(v))} />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="ni"  fill={C.blue} name="Net Income"    radius={[2, 2, 0, 0]} />
            <Bar dataKey="fcf" fill={C.teal} name="Free Cash Flow" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <Legend items={[{ color: C.blue, label: 'Net Income' }, { color: C.teal, label: 'Free Cash Flow' }]} className="mt-2" />
    </section>
  );
}

function BalanceStrength({ rows }: { rows: WideRow[] }) {
  const latest = rows.at(-1);
  if (!latest) return <section className="card p-5 h-72 animate-pulse" />;

  const cash    = parseNum(String(latest.cash_and_cash_equivalents)) ?? 0;
  const debt    = parseNum(String(latest.total_debt)) ?? 0;
  const ratio   = parseNum(String(latest.current_ratio));
  const netCash = cash - debt;

  const debtSeries = rows.map((r) => parseNum(String(r.total_debt)) ?? 0);
  const trend      = debtSeries.at(-1)! > debtSeries[0] ? 'Rising' : debtSeries.at(-1)! < debtSeries[0] ? 'Declining' : 'Stable';
  const trendColor = trend === 'Rising' ? 'text-bad' : trend === 'Declining' ? 'text-good' : 'text-muted';

  const stats = [
    { label: `Net ${netCash >= 0 ? 'Cash' : 'Debt'}`, value: abbreviateCurrency(String(Math.abs(netCash))), color: netCash >= 0 ? 'text-good' : 'text-bad' },
    { label: 'Current Ratio',                          value: formatRatio(ratio === null ? undefined : String(ratio)), color: '' },
    { label: 'Debt Trend',                             value: trend, color: trendColor },
  ];

  return (
    <section className="card p-4 md:p-5 animate-rise">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200">Balance Sheet Strength</h3>
        <span className="text-[11px] text-muted">5-year</span>
      </div>
      <div className="flex gap-6 mb-4">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="text-[10px] text-muted uppercase tracking-wide">{s.label}</div>
            <div className={`text-sm font-semibold mt-0.5 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows.map((r) => ({
              year: r.fiscalYear,
              cash: parseNum(String(r.cash_and_cash_equivalents)) ?? 0,
              debt: parseNum(String(r.total_debt)) ?? 0,
            }))}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            barGap={2}
          >
            <CartesianGrid stroke={C.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" stroke={C.axis} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis stroke={C.axis} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => abbreviateCurrency(String(v))} />
            <Tooltip content={(p) => <ChartTooltip {...p} fmt={(v) => abbreviateCurrency(String(v))} />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="cash" fill={C.teal} name="Cash"       radius={[2, 2, 0, 0]} />
            <Bar dataKey="debt" fill={C.red}  name="Total Debt" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <Legend items={[{ color: C.teal, label: 'Cash' }, { color: C.red, label: 'Total Debt' }]} className="mt-2" />
    </section>
  );
}

const TAB_LABELS: Record<string, string> = {
  income_statement: 'Income Statement',
  balance_sheet:    'Balance Sheet',
  cash_flow:        'Cash Flow',
};

function StatementsTabs({ state }: { state: SectionState<StatementsResponse> }) {
  const [tab, setTab] = useState<'income_statement' | 'balance_sheet' | 'cash_flow'>('income_statement');
  if (state.loading) return <section className="card h-64 animate-pulse" />;
  if (state.error || !state.data) return <section className="card p-5 text-sm text-muted">Error loading statements.</section>;

  const s       = state.data.data.statements[tab];
  const periods = state.data.data.periods;
  if (!s) return <section className="card p-5 text-sm text-muted">No statement data.</section>;

  return (
    <section className="card animate-rise overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-end border-b border-border px-4 pt-4 gap-0.5">
        {(['income_statement', 'balance_sheet', 'cash_flow'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-xs font-medium rounded-t transition-colors -mb-px border-x border-t ${
              tab === t
                ? 'border-border bg-card text-slate-100'
                : 'border-transparent text-muted hover:text-slate-300'
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
        <span className="ml-auto pb-2 text-[10px] text-muted">Hover for audit trail</span>
      </div>

      {/* Table */}
      <div className="overflow-auto p-4">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left py-2.5 pr-4 font-medium text-muted w-52 sticky left-0 bg-card">Line Item</th>
              {periods.map((p) => <th key={p} className="text-right py-2.5 px-3 font-medium text-muted min-w-[80px]">{p.slice(0, 4)}</th>)}
            </tr>
          </thead>
          <tbody>
            {s.items.map((line, idx) => (
              <tr key={line.key} className={`border-t border-border/30 ${idx % 2 !== 0 ? 'bg-white/[0.018]' : ''}`}>
                <td className="py-2 pr-4 text-muted sticky left-0 bg-inherit">{line.label}</td>
                {periods.map((p) => {
                  const cell = line.values[p];
                  return (
                    <td key={p} className="text-right py-2 px-3">
                      <AuditValue value={cell?.value} source={cell?.source} metric={line.key} period={p} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function parseXbrlTag(tag: string): { namespace: string; readable: string } {
  const colon = tag.indexOf(':');
  if (colon === -1) return { namespace: '', readable: tag };
  const ns = tag.slice(0, colon);
  const local = tag.slice(colon + 1);
  const readable = local.replace(/([A-Z])/g, ' $1').trim();
  return { namespace: ns, readable };
}

function AuditValue({ value, source, metric, period }: {
  value?: string;
  source?: NonNullable<StatementsResponse['data']['statements']['income_statement']['items'][number]['values'][string]['source']>;
  metric: string;
  period: string;
}) {
  const xbrlTag = resolveXbrlTag(source?.tag, metric);
  const { namespace, readable } = parseXbrlTag(xbrlTag);
  const meta: [string, string | undefined][] = [
    ['Taxonomy',   source?.taxonomy ?? (namespace || undefined)],
    ['Accession',  source?.accession],
    ['Filed',      source?.filingDate],
    ['Period',     period],
  ];
  return (
    <span tabIndex={0} className="group relative inline-flex cursor-help items-center justify-end gap-1 outline-none">
      <span className={value ? 'text-slate-200 font-medium' : 'text-muted opacity-40'}>{abbreviateCurrency(value)}</span>
      <span className="text-[9px] text-accent/30 group-hover:text-accent/60 transition-colors select-none">ⓘ</span>
      <span className="pointer-events-none absolute right-0 top-full z-50 mt-1.5 hidden w-64 border border-border bg-[#1a1d23] rounded-lg p-3 text-left shadow-card group-hover:block group-focus:block">
        <span className="block text-[10px] text-muted uppercase tracking-wider mb-2">SEC Filing</span>
        <div className="space-y-2 text-[11px]">
          {/* XBRL tag — namespace muted, readable local name prominent */}
          <div>
            <div className="text-muted text-[10px] mb-0.5">XBRL tag</div>
            {namespace && <div className="text-muted text-[10px] font-mono">{namespace}</div>}
            <div className="text-slate-100 leading-snug">{readable}</div>
          </div>
          {/* Other fields */}
          {meta.filter(([, v]) => v).map(([label, val]) => (
            <div key={label} className="flex justify-between gap-3">
              <span className="text-muted flex-shrink-0">{label}</span>
              <span className="text-slate-100 text-right font-mono text-[10px]">{val}</span>
            </div>
          ))}
          {source?.isAmendment && <div className="text-amber text-[10px]">⚠ Amended filing</div>}
        </div>
      </span>
    </span>
  );
}

function InsightsPanel({ rows }: { rows: WideRow[] }) {
  if (!rows.length) return <section className="card p-5 h-40 animate-pulse" />;
  const items = insights(rows);
  return (
    <section className="card p-4 md:p-5 animate-rise">
      <h3 className="text-sm font-semibold text-slate-200 mb-3">Insights</h3>
      <div className="grid md:grid-cols-2 gap-2">
        {items.map((item, idx) => {
          const isGoodPassing = item.type === 'good' && item.pass;
          const isWarnFailing = item.type === 'warn' && item.pass;
          const cls = isGoodPassing
            ? 'border-good/30 bg-good/5 text-good'
            : isWarnFailing
            ? 'border-bad/30 bg-bad/5 text-bad'
            : 'border-border/40 text-muted';
          const icon = isGoodPassing ? '✓' : isWarnFailing ? '⚠' : '–';
          return (
            <div key={idx} title={item.logic} className={`flex items-start gap-2.5 border rounded-lg px-3 py-2.5 text-sm ${cls}`}>
              <span className="text-base leading-none mt-px flex-shrink-0">{icon}</span>
              <span>{item.text}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default App;
