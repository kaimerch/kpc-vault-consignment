import { CommissionRule, CommissionTier } from '@/types';

// Commission rules based on requirements
export const COMMISSION_RULES: CommissionRule[] = [
  {
    tier: 'high-value',
    percentage: 25,
    minValue: 500,
    description: 'High-value items ($500+)'
  },
  {
    tier: 'standard',
    percentage: 33,
    minValue: 100,
    maxValue: 499.99,
    description: 'Standard items ($100-$499)'
  },
  {
    tier: 'low-value',
    percentage: 40,
    maxValue: 99.99,
    description: 'Low-value items (under $100)'
  },
  {
    tier: 'specialty',
    percentage: 35,
    description: 'Specialty items (custom commission)'
  }
];

export function calculateCommission(
  estimatedValue: number, 
  isSpecialty: boolean = false
): {
  tier: CommissionTier;
  percentage: number;
  commission: number;
  clientPayout: number;
  rule: CommissionRule;
} {
  let rule: CommissionRule;

  if (isSpecialty) {
    rule = COMMISSION_RULES.find(r => r.tier === 'specialty')!;
  } else if (estimatedValue >= 500) {
    rule = COMMISSION_RULES.find(r => r.tier === 'high-value')!;
  } else if (estimatedValue >= 100) {
    rule = COMMISSION_RULES.find(r => r.tier === 'standard')!;
  } else {
    rule = COMMISSION_RULES.find(r => r.tier === 'low-value')!;
  }

  const commission = (estimatedValue * rule.percentage) / 100;
  const clientPayout = estimatedValue - commission;

  return {
    tier: rule.tier,
    percentage: rule.percentage,
    commission,
    clientPayout,
    rule
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function getCommissionTierColor(tier: CommissionTier): string {
  const colors = {
    'high-value': 'bg-green-100 text-green-800',
    'standard': 'bg-blue-100 text-blue-800',
    'low-value': 'bg-yellow-100 text-yellow-800',
    'specialty': 'bg-purple-100 text-purple-800'
  };
  return colors[tier];
}