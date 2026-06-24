import type { LongResponse, StatementsResponse, WideResponse } from '../types/api';

const years = [2020, 2021, 2022, 2023, 2024, 2025];
const revenues = [274515000000, 365817000000, 394328000000, 383285000000, 391035000000, 410200000000];
const periodEnd = (y: number) => `${y}-09-30`;

const rows = years.map((y, i) => {
  const revenue = revenues[i];
  const prevRevenue = i === 0 ? revenue : revenues[i - 1];
  const grossMargin = [0.382, 0.417, 0.433, 0.446, 0.459, 0.469][i];
  const ni = [57411000000, 94680000000, 99803000000, 96995000000, 100913000000, 107223000000][i];
  const ocf = [80674000000, 104038000000, 122151000000, 110543000000, 116450000000, 124350000000][i];
  const capex = [7309000000, 11085000000, 10708000000, 10959000000, 11120000000, 11650000000][i];
  const fcf = ocf - capex;
  const debt = [112436000000, 124719000000, 120069000000, 111088000000, 99523000000, 96245000000][i];
  const cash = [38016000000, 34940000000, 23646000000, 29965000000, 33784000000, 40210000000][i];
  const equity = [65339000000, 63090000000, 50672000000, 62146000000, 68521000000, 70102000000][i];

  return {
    cik: '0000320193',
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    periodEnd: periodEnd(y),
    fiscalYear: y,
    fiscalPeriod: 'FY',
    revenue: String(revenue),
    gross_profit: String(revenue * grossMargin),
    operating_income: String(revenue * (0.28 + i * 0.005)),
    net_income: String(ni),
    free_cash_flow: String(fcf),
    net_cash_from_operating_activities: String(ocf),
    capital_expenditures: String(capex),
    cash_and_cash_equivalents: String(cash),
    total_debt: String(debt),
    total_assets: String(323888000000 + i * 4000000000),
    total_liabilities: String(258549000000 + i * 2800000000),
    total_equity: String(equity),
    total_current_assets: String(143713000000 + i * 2500000000),
    total_current_liabilities: String(125481000000 + i * 1800000000),
    gross_margin: String(grossMargin),
    operating_margin: String(0.295 + i * 0.004),
    net_margin: String(ni / revenue),
    free_cash_flow_margin: String(fcf / revenue),
    roe: String(ni / equity),
    roa: String(ni / (323888000000 + i * 4000000000)),
    current_ratio: String((143713000000 + i * 2500000000) / (125481000000 + i * 1800000000)),
    debt_to_equity: String(debt / equity),
    free_cash_flow_to_net_income: String(fcf / ni),
    revenue_growth_yoy: String((revenue - prevRevenue) / prevRevenue)
  };
});
type MockRow = (typeof rows)[number];
const rowVal = (row: MockRow, key: string) => (row as unknown as Record<string, string | number>)[key];
const labelize = (key: string) => key.replaceAll('_', ' ').replace(/\b\w/g, (s: string) => s.toUpperCase());

const quality = Object.fromEntries(
  rows.map((r, i) => [r.periodEnd, { completeness: i === rows.length - 1 ? '0.55' : '0.96', flags: i === rows.length - 1 ? ['amended'] : [] }])
);

const wideResponse = (take = rows): WideResponse => ({
  data: take,
  meta: {
    quality: { AAPL: quality },
    missing: []
  }
});

export const mockFinancials = (metrics: string[], period: string, layout: 'wide' | 'long'): WideResponse | LongResponse => {
  const base = period === 'latest' ? rows.slice(-1) : period === 'last2y' ? rows.slice(-2) : period === 'last5y' ? rows.slice(-5) : rows.slice();
  if (layout === 'wide') {
    return wideResponse(base.map((row) => Object.fromEntries(Object.entries(row).filter(([k]) => ['cik', 'ticker', 'companyName', 'periodEnd', 'fiscalYear', 'fiscalPeriod', ...metrics].includes(k))) as any));
  }
  return {
    data: base.flatMap((r) => metrics.map((m) => ({
      ticker: r.ticker,
      companyName: r.companyName,
      metric: m,
      periodEnd: r.periodEnd,
      fiscalYear: r.fiscalYear,
      value: String(rowVal(r, m) ?? ''),
      unit: m.includes('margin') || m.includes('ratio') || m.includes('growth') || m.includes('roe') || m.includes('roa') ? 'ratio' : 'usd',
      source: { tag: m, taxonomy: 'us-gaap', accession: `0000320193-25-0000${r.fiscalYear % 10}`, filingDate: `${r.fiscalYear + 1}-11-02` }
    }))),
    meta: { quality: { AAPL: quality }, missing: [] }
  };
};

export const mockStatements = (): StatementsResponse => {
  const periodRows = rows.slice(-5); // FY2021–FY2025

  const makeItem = (key: string, label: string, fn: (row: MockRow, i: number) => number | string) => ({
    key,
    label,
    values: Object.fromEntries(periodRows.map((row, i) => [
      row.periodEnd,
      {
        value: String(fn(row, i)),
        source: { tag: key, taxonomy: 'us-gaap', accession: `0000320193-${String(row.fiscalYear).slice(-2)}-000001`, filingDate: `${row.fiscalYear + 1}-11-01` }
      }
    ]))
  });

  const M = Math.round;

  // FY2021–FY2025 arrays (values in millions; multiply by 1e6 inline)
  const rd    = [21914, 26251, 29915, 31370, 33500]; // R&D
  const sga   = [21973, 25094, 24932, 26097, 28000]; // SG&A
  const iInc  = [2843,  2825,  3750,  3862,  4200];  // interest income
  const iExp  = [2645,  2830,  3933,  3848,  3650];  // interest expense
  const epsB  = [5.67,  6.15,  6.13,  6.42,  6.85];  // EPS basic
  const epsD  = [5.61,  6.11,  6.08,  6.35,  6.75];  // EPS diluted
  const wasB  = [16865, 16215, 15821, 15722, 15640]; // wtd avg shares basic (M)
  const wasD  = [17218, 16800, 16325, 16244, 16100]; // wtd avg shares diluted (M)
  const dps   = [0.865, 0.91,  0.94,  0.97,  1.00];  // dividends per share

  const sti   = [27699, 24658, 31590, 35228, 38500]; // short-term investments
  const ar    = [26278, 28184, 29508, 33410, 35200]; // accounts receivable
  const inv   = [6580,  4946,  6331,  7456,  7800];  // inventory
  const oca   = [44821, 21223, 46627, 46060, 49000]; // other current assets
  const lti   = [127877,120805,100544,91704, 88000]; // long-term investments
  const ppe   = [39440, 42117, 43671, 45680, 47200]; // PP&E net
  const gw    = [730,   730,   730,   730,   730];   // goodwill
  const ia    = [2789,  2839,  2314,  2090,  2000];  // intangible assets
  const ona   = [53197, 54428, 60131, 64758, 68000]; // other non-current assets
  const ap    = [54763, 64115, 62611, 67800, 71000]; // accounts payable
  const std   = [9613,  11128, 9822,  11103, 11000]; // short-term debt
  const drc   = [7612,  7912,  8061,  8300,  8600];  // deferred revenue (current)
  const aex   = [47493, 55173, 58051, 63985, 67000]; // accrued expenses
  const onl   = [53197, 49142, 53394, 49848, 51000]; // other non-current liabilities
  const csap  = [57365, 64849, 73812, 79955, 83000]; // common stock & APIC
  const rEarn = [-6178, -3068, -214,  1408,  3000];  // retained earnings

  const da    = [11284, 11104, 11519, 11445, 12200]; // D&A (CF)
  const sbc   = [7906,  9038,  10833, 11688, 12800]; // SBC
  const cAR   = [-10125,-1823, -1688, -5685, -2100]; // change in AR
  const cInv  = [-2642, 1484,  -1616, -1718, -500];  // change in inventory
  const cAP   = [12326, 9448,  -1889, 5397,  3500];  // change in AP
  const cOWC  = [-8043, 3606,  -6573, -3915, -2000]; // change in other WC
  const acq   = [-33,   -306,  -306,  -1847, -500];  // acquisitions
  const pInv  = [-109689,-113985,-54527,-74254,-80000]; // purchases of investments
  const sInv  = [106618,116049, 67363, 95752, 92000]; // sales of investments
  const nInv  = [-3976,-22354,  1802,  2435, -2000]; // net investing CF
  const debtR = [-14300,-9543, -11151,-9995,-10000];  // debt repayment
  const repo  = [-85971,-89402,-77550,-95010,-100000]; // share repurchases
  const divP  = [-14467,-14841,-15025,-15234,-15600]; // dividends paid
  const nFin  = [-93353,-110749,-108488,-121983,-125000]; // net financing CF

  return {
    data: {
      ticker: 'AAPL',
      companyName: 'Apple Inc.',
      periods: periodRows.map((row) => row.periodEnd),
      statements: {
        income_statement: {
          section: 'Income Statement',
          items: [
            makeItem('revenue',                      'Revenue',                         (row) => row.revenue),
            makeItem('cost_of_revenue',              'Cost of Revenue',                 (row) => M(Number(row.revenue) - Number(row.gross_profit))),
            makeItem('gross_profit',                 'Gross Profit',                    (row) => row.gross_profit),
            makeItem('research_and_development',     'Research & Development',          (_, i) => M(rd[i] * 1e6)),
            makeItem('selling_general_administrative','Selling, General & Admin.',       (_, i) => M(sga[i] * 1e6)),
            makeItem('operating_income',             'Operating Income',                (row) => row.operating_income),
            makeItem('interest_income',              'Interest Income',                 (_, i) => M(iInc[i] * 1e6)),
            makeItem('interest_expense',             'Interest Expense',                (_, i) => M(iExp[i] * 1e6)),
            makeItem('pretax_income',                'Income Before Tax',               (row) => M(Number(row.net_income) * 1.18)),
            makeItem('income_tax_expense',           'Income Tax Expense',              (row) => M(Number(row.net_income) * 0.18)),
            makeItem('net_income',                   'Net Income',                      (row) => row.net_income),
            makeItem('eps_basic',                    'EPS (Basic)',                     (_, i) => epsB[i].toFixed(2)),
            makeItem('eps_diluted',                  'EPS (Diluted)',                   (_, i) => epsD[i].toFixed(2)),
            makeItem('weighted_avg_shares_basic',    'Wtd. Avg. Shares (Basic)',        (_, i) => M(wasB[i] * 1e6)),
            makeItem('weighted_avg_shares_diluted',  'Wtd. Avg. Shares (Diluted)',      (_, i) => M(wasD[i] * 1e6)),
            makeItem('dividends_per_share',          'Dividends Per Share',             (_, i) => dps[i].toFixed(3)),
          ]
        },
        balance_sheet: {
          section: 'Balance Sheet',
          items: [
            makeItem('cash_and_cash_equivalents',    'Cash & Equivalents',             (row) => row.cash_and_cash_equivalents),
            makeItem('short_term_investments',       'Short-Term Investments',          (_, i) => M(sti[i] * 1e6)),
            makeItem('accounts_receivable',          'Accounts Receivable',             (_, i) => M(ar[i] * 1e6)),
            makeItem('inventory',                    'Inventory',                       (_, i) => M(inv[i] * 1e6)),
            makeItem('other_current_assets',         'Other Current Assets',            (_, i) => M(oca[i] * 1e6)),
            makeItem('total_current_assets',         'Total Current Assets',            (row) => row.total_current_assets),
            makeItem('long_term_investments',        'Long-Term Investments',           (_, i) => M(lti[i] * 1e6)),
            makeItem('property_plant_equipment',     'Property, Plant & Equipment',     (_, i) => M(ppe[i] * 1e6)),
            makeItem('goodwill',                     'Goodwill',                        (_, i) => M(gw[i] * 1e6)),
            makeItem('intangible_assets',            'Intangible Assets',               (_, i) => M(ia[i] * 1e6)),
            makeItem('other_noncurrent_assets',      'Other Non-Current Assets',        (_, i) => M(ona[i] * 1e6)),
            makeItem('total_assets',                 'Total Assets',                    (row) => row.total_assets),
            makeItem('accounts_payable',             'Accounts Payable',                (_, i) => M(ap[i] * 1e6)),
            makeItem('short_term_debt',              'Short-Term Debt',                 (_, i) => M(std[i] * 1e6)),
            makeItem('deferred_revenue_current',     'Deferred Revenue (Current)',      (_, i) => M(drc[i] * 1e6)),
            makeItem('accrued_expenses',             'Accrued Expenses',                (_, i) => M(aex[i] * 1e6)),
            makeItem('total_current_liabilities',    'Total Current Liabilities',       (row) => row.total_current_liabilities),
            makeItem('total_debt',                   'Long-Term Debt',                  (row) => row.total_debt),
            makeItem('other_noncurrent_liabilities', 'Other Non-Current Liabilities',   (_, i) => M(onl[i] * 1e6)),
            makeItem('total_liabilities',            'Total Liabilities',               (row) => row.total_liabilities),
            makeItem('common_stock_and_apic',        'Common Stock & APIC',             (_, i) => M(csap[i] * 1e6)),
            makeItem('retained_earnings',            'Retained Earnings',               (_, i) => M(rEarn[i] * 1e6)),
            makeItem('total_equity',                 'Total Shareholders\' Equity',     (row) => row.total_equity),
          ]
        },
        cash_flow: {
          section: 'Cash Flow',
          items: [
            makeItem('net_income',                         'Net Income',                      (row) => row.net_income),
            makeItem('depreciation_amortization_cf',       'Depreciation & Amortization',     (_, i) => M(da[i] * 1e6)),
            makeItem('stock_based_compensation',           'Stock-Based Compensation',        (_, i) => M(sbc[i] * 1e6)),
            makeItem('change_in_accounts_receivable',      'Change in Accounts Receivable',   (_, i) => M(cAR[i] * 1e6)),
            makeItem('change_in_inventory',                'Change in Inventory',             (_, i) => M(cInv[i] * 1e6)),
            makeItem('change_in_accounts_payable',         'Change in Accounts Payable',      (_, i) => M(cAP[i] * 1e6)),
            makeItem('change_in_other_working_capital',    'Other Working Capital Changes',   (_, i) => M(cOWC[i] * 1e6)),
            makeItem('net_cash_from_operating_activities', 'Operating Cash Flow',             (row) => row.net_cash_from_operating_activities),
            makeItem('capital_expenditures',               'Capital Expenditures',            (row) => M(-Math.abs(Number(row.capital_expenditures)))),
            makeItem('acquisitions',                       'Acquisitions',                    (_, i) => M(acq[i] * 1e6)),
            makeItem('purchases_of_investments',           'Purchases of Investments',        (_, i) => M(pInv[i] * 1e6)),
            makeItem('sales_of_investments',               'Sales of Investments',            (_, i) => M(sInv[i] * 1e6)),
            makeItem('net_cash_from_investing_activities', 'Investing Cash Flow',             (_, i) => M(nInv[i] * 1e6)),
            makeItem('debt_repayment',                     'Debt Repayment',                  (_, i) => M(debtR[i] * 1e6)),
            makeItem('common_stock_repurchased',           'Share Repurchases',               (_, i) => M(repo[i] * 1e6)),
            makeItem('dividends_paid',                     'Dividends Paid',                  (_, i) => M(divP[i] * 1e6)),
            makeItem('net_cash_from_financing_activities', 'Financing Cash Flow',             (_, i) => M(nFin[i] * 1e6)),
            makeItem('net_change_in_cash',                 'Net Change in Cash',              (row, i) => {
              const prevCash = i === 0 ? Number(rows[0].cash_and_cash_equivalents) : Number(periodRows[i - 1].cash_and_cash_equivalents);
              return M(Number(row.cash_and_cash_equivalents) - prevCash);
            }),
            makeItem('free_cash_flow',                     'Free Cash Flow',                  (row) => row.free_cash_flow),
          ]
        }
      }
    },
    meta: { quality: { AAPL: quality }, missing: [] }
  };
};
