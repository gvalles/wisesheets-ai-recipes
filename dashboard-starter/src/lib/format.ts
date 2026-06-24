export const parseNum = (val?: string | number): number | null => {
  if (val === undefined || val === null) return null;
  const n = typeof val === 'number' ? val : Number.parseFloat(val);
  return Number.isFinite(n) ? n : null;
};

export const abbreviateCurrency = (val?: string): string => {
  const n = parseNum(val);
  if (n === null) return 'n/a';
  const abs = Math.abs(n);
  if (abs >= 1e12) return `$${(n / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(1)}`;
};

export const formatPercent = (decimalStr?: string, digits = 1): string => {
  const n = parseNum(decimalStr);
  if (n === null) return 'n/a';
  return `${(n * 100).toFixed(digits)}%`;
};

export const formatRatio = (val?: string, digits = 2): string => {
  const n = parseNum(val);
  if (n === null) return 'n/a';
  return `${n.toFixed(digits)}x`;
};

export const deltaPct = (latest?: string, prev?: string): number | null => {
  const a = parseNum(latest);
  const b = parseNum(prev);
  if (a === null || b === null || b === 0) return null;
  return (a - b) / Math.abs(b);
};
