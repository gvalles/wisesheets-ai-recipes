import { parseNum } from './format';
import type { WideRow } from '../types/api';

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const linear = (n: number, lo: number, hi: number, maxPts: number) => clamp(((n - lo) / (hi - lo)) * maxPts, 0, maxPts);

export function healthScore(latest: WideRow, last5: WideRow[]) {
  const growthAvg = avg(last5.map((r) => parseNum(String(r.revenue_growth_yoy))));
  const netMargin = parseNum(String(latest.net_margin)) ?? -1;
  const fcfNi = parseNum(String(latest.free_cash_flow_to_net_income)) ?? 0;
  const dte = parseNum(String(latest.debt_to_equity)) ?? 2;

  const growth = linear(growthAvg, 0, 0.15, 25);
  const margins = linear(netMargin, 0, 0.25, 25);
  const cashFlow = linear(fcfNi, 0.7, 1.1, 25);
  const balance = linear(2 - dte, 0, 1.7, 25);
  return {
    score: Math.round(growth + margins + cashFlow + balance),
    breakdown: {
      growth: Math.round(growth),
      margins: Math.round(margins),
      cashFlow: Math.round(cashFlow),
      balance: Math.round(balance)
    }
  };
}

export function heroBadges(latest: WideRow) {
  const rg = parseNum(String(latest.revenue_growth_yoy)) ?? 0;
  const nm = parseNum(String(latest.net_margin)) ?? 0;
  const fcfni = parseNum(String(latest.free_cash_flow_to_net_income)) ?? 0;
  const dte = parseNum(String(latest.debt_to_equity)) ?? 99;
  return {
    revenue: rg > 0.1 ? 'Strong' : rg > 0 ? 'Moderate' : 'Weak',
    margins: nm > 0.2 ? 'Excellent' : nm > 0.1 ? 'Solid' : 'Thin',
    cashFlow: fcfni > 1 ? 'Excellent' : fcfni > 0.8 ? 'Healthy' : 'Watch',
    debt: dte < 0.6 ? 'Low' : dte < 1.5 ? 'Moderate' : 'Elevated'
  };
}

export function insights(last5: WideRow[]) {
  const latest = last5[last5.length - 1];
  const growths = last5.map((r) => parseNum(String(r.revenue_growth_yoy)) ?? 0);
  const positives = growths.filter((g) => g > 0).length;
  const growthAvg = avg(growths);
  const gmLatest = parseNum(String(latest.gross_margin)) ?? 0;
  const gm3 = parseNum(String(last5[Math.max(0, last5.length - 4)].gross_margin)) ?? 0;
  const fcfni = parseNum(String(latest.free_cash_flow_to_net_income)) ?? 0;
  const debt = parseNum(String(latest.total_debt)) ?? 0;
  const cash = parseNum(String(latest.cash_and_cash_equivalents)) ?? 0;
  const cr = parseNum(String(latest.current_ratio)) ?? 9;
  return [
    { type: 'good', text: `Revenue grew in ${positives} of last 5 years`, pass: positives >= 4, logic: 'positive revenue_growth_yoy in >=4 of last 5y' },
    { type: 'good', text: 'FCF exceeded net income - high earnings quality', pass: fcfni > 1, logic: 'free_cash_flow_to_net_income latest > 1.0' },
    { type: 'good', text: 'Gross margins expanding', pass: gmLatest > gm3, logic: 'gross_margin latest > gross_margin 3y ago' },
    { type: 'warn', text: 'Debt load may be elevated', pass: debt > 2 * cash, logic: 'total_debt latest > 2 x cash_and_cash_equivalents' },
    { type: 'warn', text: 'Growth decelerating vs trend', pass: (parseNum(String(latest.revenue_growth_yoy)) ?? 0) < growthAvg, logic: 'revenue_growth_yoy latest < 5y avg' },
    { type: 'warn', text: 'Current liabilities exceed current assets', pass: cr < 1, logic: 'current_ratio < 1' }
  ];
}

function avg(nums: (number | null)[]) {
  const ok = nums.filter((n): n is number => n !== null);
  if (!ok.length) return 0;
  return ok.reduce((a, b) => a + b, 0) / ok.length;
}
