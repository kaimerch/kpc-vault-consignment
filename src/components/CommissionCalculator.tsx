'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, TrendingUp } from 'lucide-react';
import { calculateCommission, formatCurrency, getCommissionTierColor, COMMISSION_RULES } from '@/lib/commission';
import { CommissionTier } from '@/types';

interface CommissionCalculatorProps {
  onCalculationChange?: (calculation: any) => void;
  initialValue?: number;
  initialSpecialty?: boolean;
}

export default function CommissionCalculator({ 
  onCalculationChange, 
  initialValue = 0, 
  initialSpecialty = false 
}: CommissionCalculatorProps) {
  const [estimatedValue, setEstimatedValue] = useState(initialValue);
  const [isSpecialty, setIsSpecialty] = useState(initialSpecialty);
  const [calculation, setCalculation] = useState(() => 
    calculateCommission(initialValue, initialSpecialty)
  );

  useEffect(() => {
    const newCalculation = calculateCommission(estimatedValue, isSpecialty);
    setCalculation(newCalculation);
    onCalculationChange?.(newCalculation);
  }, [estimatedValue, isSpecialty, onCalculationChange]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setEstimatedValue(value);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="text-blue-600" size={24} />
        <h2 className="text-xl font-semibold text-gray-800">Commission Calculator</h2>
      </div>

      <div className="space-y-4">
        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="estimatedValue" className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Item Value
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                id="estimatedValue"
                value={estimatedValue || ''}
                onChange={handleValueChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isSpecialty}
                onChange={(e) => setIsSpecialty(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Specialty Item (35% commission)</span>
            </label>
          </div>
        </div>

        {/* Commission Rules Display */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Commission Structure</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {COMMISSION_RULES.map((rule) => (
              <div
                key={rule.tier}
                className={`px-3 py-2 rounded-md text-sm ${
                  rule.tier === calculation.tier 
                    ? getCommissionTierColor(rule.tier)
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <div className="font-medium">{rule.percentage}%</div>
                <div className="text-xs opacity-80">{rule.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        {estimatedValue > 0 && (
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="text-blue-600" size={20} />
              <h3 className="text-lg font-semibold text-blue-800">Commission Breakdown</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {formatCurrency(calculation.commission)}
                </div>
                <div className="text-sm text-gray-600">KPC Vault Commission</div>
                <div className="text-xs text-gray-500">({calculation.percentage}%)</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(calculation.clientPayout)}
                </div>
                <div className="text-sm text-gray-600">Client Payout</div>
                <div className="text-xs text-gray-500">({(100 - calculation.percentage).toFixed(0)}%)</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(estimatedValue)}
                </div>
                <div className="text-sm text-gray-600">Item Value</div>
                <div className={`inline-block px-2 py-1 rounded-full text-xs ${getCommissionTierColor(calculation.tier)}`}>
                  {calculation.rule.description}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}