
export enum TAX_YEARS {
    FROM_17_TO_18 = '2017-18',
    FROM_18_TO_19 = '2018-19'
}

export enum TAX_RATE_TYPE {
    BASIC = 'Basic rate',
    HIGHER = 'Higher rate',
    ADDITIONAL = 'Additional rate'
}

export interface ITaxRate {
    max: number,
    min: number,
    rate: number
}

export interface ITaxReturn {
    income: number,
    isAdditionalRate: boolean,
    isHigherRate: boolean,
    payable: number
    taxable: number
}

export interface ITaxYearConfig {
    recommendedSalary: number,
    personalAllowance: number,
    dividendAllowance: number,
    taxRates: {
        [key: string]: ITaxRate
    }
}

export interface ITaxYearConfigs {
    [key: string]: ITaxYearConfig
}