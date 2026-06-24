/** Maps internal metric keys to their SEC EDGAR XBRL namespace-qualified tag names. */
export const XBRL_TAGS: Record<string, string> = {
  // Income Statement
  revenue:                           'us-gaap:RevenueFromContractWithCustomerExcludingAssessedTax',
  gross_profit:                      'us-gaap:GrossProfit',
  operating_income:                  'us-gaap:OperatingIncomeLoss',
  net_income:                        'us-gaap:NetIncomeLoss',
  cost_of_revenue:                   'us-gaap:CostOfGoodsAndServicesSold',
  research_and_development:          'us-gaap:ResearchAndDevelopmentExpense',
  selling_general_administrative:    'us-gaap:SellingGeneralAndAdministrativeExpense',
  depreciation_and_amortization:     'us-gaap:DepreciationDepletionAndAmortization',
  depreciation:                      'us-gaap:Depreciation',
  interest_expense:                  'us-gaap:InterestExpense',
  interest_income:                   'us-gaap:InvestmentIncomeInterest',
  income_tax_expense:                'us-gaap:IncomeTaxExpenseBenefit',
  pretax_income:                     'us-gaap:IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest',
  eps_basic:                         'us-gaap:EarningsPerShareBasic',
  eps_diluted:                       'us-gaap:EarningsPerShareDiluted',
  dividends_per_share:               'us-gaap:CommonStockDividendsPerShareDeclared',
  shares_outstanding:                'us-gaap:CommonStockSharesOutstanding',
  weighted_avg_shares_basic:         'us-gaap:WeightedAverageNumberOfSharesOutstandingBasic',
  weighted_avg_shares_diluted:       'us-gaap:WeightedAverageNumberOfDilutedSharesOutstanding',

  // Balance Sheet
  cash_and_cash_equivalents:         'us-gaap:CashAndCashEquivalentsAtCarryingValue',
  total_assets:                      'us-gaap:Assets',
  total_liabilities:                 'us-gaap:Liabilities',
  total_equity:                      'us-gaap:StockholdersEquity',
  total_current_assets:              'us-gaap:AssetsCurrent',
  total_current_liabilities:         'us-gaap:LiabilitiesCurrent',
  total_debt:                        'us-gaap:LongTermDebt',
  accounts_receivable:               'us-gaap:AccountsReceivableNetCurrent',
  inventory:                         'us-gaap:InventoryNet',
  goodwill:                          'us-gaap:Goodwill',
  intangible_assets:                 'us-gaap:IntangibleAssetsNetExcludingGoodwill',
  property_plant_equipment:          'us-gaap:PropertyPlantAndEquipmentNet',
  accounts_payable:                  'us-gaap:AccountsPayableCurrent',
  deferred_revenue:                  'us-gaap:DeferredRevenueNoncurrent',
  retained_earnings:                 'us-gaap:RetainedEarningsAccumulatedDeficit',

  // Cash Flow
  net_cash_from_operating_activities: 'us-gaap:NetCashProvidedByUsedInOperatingActivities',
  capital_expenditures:              'us-gaap:PaymentsToAcquirePropertyPlantAndEquipment',
  free_cash_flow:                    'us-gaap:NetCashProvidedByUsedInOperatingActivities', // derived
  depreciation_amortization_cf:      'us-gaap:DepreciationDepletionAndAmortization',
  stock_based_compensation:          'us-gaap:ShareBasedCompensation',
  net_cash_from_investing_activities: 'us-gaap:NetCashProvidedByUsedInInvestingActivities',
  net_cash_from_financing_activities: 'us-gaap:NetCashProvidedByUsedInFinancingActivities',

  // Balance Sheet — additional
  short_term_investments:              'us-gaap:ShortTermInvestments',
  other_current_assets:                'us-gaap:OtherAssetsCurrent',
  long_term_investments:               'us-gaap:LongTermInvestments',
  other_noncurrent_assets:             'us-gaap:OtherAssetsNoncurrent',
  short_term_debt:                     'us-gaap:ShortTermBorrowings',
  accrued_expenses:                    'us-gaap:AccruedLiabilitiesCurrent',
  deferred_revenue_current:            'us-gaap:DeferredRevenueCurrent',
  other_noncurrent_liabilities:        'us-gaap:OtherLiabilitiesNoncurrent',
  common_stock_and_apic:               'us-gaap:CommonStocksIncludingAdditionalPaidInCapital',

  // Cash Flow — additional
  change_in_accounts_receivable:       'us-gaap:IncreaseDecreaseInAccountsReceivable',
  change_in_inventory:                 'us-gaap:IncreaseDecreaseInInventories',
  change_in_accounts_payable:          'us-gaap:IncreaseDecreaseInAccountsPayable',
  change_in_other_working_capital:     'us-gaap:IncreaseDecreaseInOtherOperatingLiabilities',
  acquisitions:                        'us-gaap:PaymentsToAcquireBusinessesNetOfCashAcquired',
  purchases_of_investments:            'us-gaap:PaymentsToAcquireInvestments',
  sales_of_investments:                'us-gaap:ProceedsFromSaleMaturityAndCollectionOfInvestments',
  debt_repayment:                      'us-gaap:RepaymentsOfLongTermDebt',
  common_stock_repurchased:            'us-gaap:PaymentsForRepurchaseOfCommonStock',
  dividends_paid:                      'us-gaap:PaymentsOfDividendsCommonStock',
  net_change_in_cash:                  'us-gaap:CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalentsPeriodIncreaseDecreaseIncludingExchangeRateEffect',
};

/**
 * Resolves a tag string to its XBRL-namespaced form.
 * If the tag already contains ":" it is treated as already qualified.
 * Otherwise looks up the internal metric key in XBRL_TAGS.
 */
export function resolveXbrlTag(tag: string | undefined, fallback: string): string {
  const key = tag ?? fallback;
  if (key.includes(':')) return key;
  return XBRL_TAGS[key] ?? key;
}
