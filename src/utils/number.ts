
import * as R from 'ramda';
import { ITaxRate, ITaxReturn, ITaxYearConfig, TAX_RATE_TYPE } from '../types';

export const add = (acc: number, val: number) => acc + val;

export const currencyFormat = (amount: number): string => amount.toLocaleString(undefined, { style: 'currency', currency: 'GBP' });

export const calculateTax = (taxYearConfig: ITaxYearConfig, income: number): ITaxReturn => {
    const { dividendAllowance, personalAllowance, taxRates } = taxYearConfig;
    const taxable = Math.max(0, income - personalAllowance - dividendAllowance);

    const getTax = (taxRateType: TAX_RATE_TYPE) => {
        const taxRate: ITaxRate = taxRates[taxRateType];
        const taxableAmount = Math.min(Math.max(0, taxable - taxRate.min), taxRate.max);
        const tax = taxableAmount * taxRate.rate;
        return tax;
    };

    const payable = Object.keys(taxRates).map(getTax).reduce(R.add);

    return {
        income,
        isAdditionalRate: getTax(TAX_RATE_TYPE.ADDITIONAL) > 0,
        isHigherRate: getTax(TAX_RATE_TYPE.HIGHER) > 0,
        payable,
        taxable
    };
};

export const getTaxReturnSum = (taxReturns: ITaxReturn[], property: string) => {
    const list: number[] = taxReturns.map((taxReturn: ITaxReturn) => taxReturn[property]);
    return R.reduce(add, 0, list);
}
