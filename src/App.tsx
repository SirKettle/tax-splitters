import * as classnames from 'classnames';
import * as React from 'react';
import './App.css';

import NumberInput from './components/NumberInput';
import Person, {IPersonData} from "./components/Person";
// import logo from './logo.svg';
import { ITaxReturn, ITaxYearConfig, ITaxYearConfigs, TAX_RATE_TYPE, TAX_YEARS } from './types';
import {calculateTax, currencyFormat, getTaxReturnSum} from "./utils/number";

const taxYears: ITaxYearConfigs = {
    [TAX_YEARS.FROM_17_TO_18]: {
        dividendAllowance: 5000,
        personalAllowance: 11500,
        recommendedSalary: 8052,
        taxRates: {
            [TAX_RATE_TYPE.BASIC]: {
                max: 33500,
                min: 0,
                rate: 0.075
            },
            [TAX_RATE_TYPE.HIGHER]: {
                max: 150000,
                min: 33501,
                rate: 0.325
            },
            [TAX_RATE_TYPE.ADDITIONAL]: {
                max: Infinity,
                min: 150001,
                rate: 0.381
            }
        }
    },
    [TAX_YEARS.FROM_18_TO_19]: {
        dividendAllowance: 2000,
        personalAllowance: 11850,
        recommendedSalary: 8424,
        taxRates: {
            [TAX_RATE_TYPE.BASIC]: {
                max: 33500,
                min: 0,
                rate: 0.075
            },
            [TAX_RATE_TYPE.HIGHER]: {
                max: 150000,
                min: 33501,
                rate: 0.325
            },
            [TAX_RATE_TYPE.ADDITIONAL]: {
                max: Infinity,
                min: 150001,
                rate: 0.381
            }
        }
    }
};

interface IState {
    isMultiShareholders: boolean,
    people: IPersonData[],
    share: number,
    taxYear: string,
    totalDividends: number
}

class App extends React.Component<{}, IState> {

    public state = {
        isMultiShareholders: false,
        people: [{
            active: true,
            onPayroll: true
        }, {
            active: false,
            onPayroll: false
        }],
        share: 1,
        taxYear: TAX_YEARS.FROM_18_TO_19,
        totalDividends: 50000
    }

    public render() {
        const people = this.state.people.filter(person => person.active);
        const peopleTaxReturns = people.map(this.calculatePersonTax);
        const totals = {
            income: getTaxReturnSum(peopleTaxReturns, 'income'),
            taxPayable: getTaxReturnSum(peopleTaxReturns, 'payable')
        }

        const isHigherRate = peopleTaxReturns.some(taxReturn => taxReturn.isHigherRate);
        const isAdditionalRate = peopleTaxReturns.some(taxReturn => taxReturn.isAdditionalRate);

        return (
            <div className="App">
                <div className="main">
                    <header className="App-header">
                        <h1>Tax splitter!</h1>
                        <h2>Your estimated Self Assessment tax return figures...</h2>
                        <p>
                            1) Select the tax year: { this.renderSelectTaxYear() }
                        </p>
                        <p>
                            2) Annual dividends: £ <NumberInput val={this.state.totalDividends} onChange={this.onHandleTotalDividendsChange} step={100} />
                        </p>
                        <p>
                            3) Are you Income splitting with your partner?: <input type="checkbox" checked={this.state.isMultiShareholders} onChange={this.onHandleIsIncomeSplittingChange} />
                        </p>
                        { this.renderIncomeSplit() }
                    </header>
                    <div className="people">
                        { people.map(this.renderPerson) }
                    </div>
                    <div className={
                        classnames('summary', {
                            'additional-rate': isAdditionalRate,
                            'higher-rate': isHigherRate
                        })
                    }>
                        <p><strong>Gross income: {currencyFormat(totals.income)}</strong></p>
                        <p>NET income: {currencyFormat(totals.income - totals.taxPayable)}</p>
                        <h3>Tax payable: {currencyFormat(totals.taxPayable)}</h3>
                        { this.renderTaxMessage(isHigherRate, isAdditionalRate) }
                    </div>
                </div>
                <section className="smallprint">
                    <p>A very simplistic tax calculator which assumes a few things:</p>
                    <ul>
                        <li>You are a contractor using a UK Ltd Company</li>
                        <li>All shareholders of the limited company have no other income</li>
                        <li>Salaries are based on recommended</li>
                    </ul>

                    <small>* <a href="https://www.itcontracting.com/it-contractor-pay/">Recommended salary for this tax year</a></small>
                </section>
            </div>
        );
    }

    private renderTaxMessage = (isHigherRate: boolean, isAdditionalRate: boolean) => {
        const hmrcDividendTaxUrl = 'https://www.gov.uk/tax-on-dividends';
        if (isAdditionalRate) {
            return <p className="additional-rate-message"><a href={hmrcDividendTaxUrl}>Based on your dividends, you will be paying some of your tax at the ‘Additional’ rate</a></p>;
        }
        if (isHigherRate) {
            return <p className="higher-rate-message"><a href={hmrcDividendTaxUrl}>Based on your dividends, you will be paying some of your tax at the ‘Higher’ rate</a></p>;
        }
        return <p className="message"><a href={hmrcDividendTaxUrl}>Based on your dividends, you will be paying all of your tax at the ‘Basic’ rate</a></p>
    }

    private renderIncomeSplit = () => {
      if (!this.state.isMultiShareholders) {
          return null;
      }

      return (
          <div>
              <p>Share split: <input
                  type="range"
                  value={this.state.share}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={this.onShareChange}
              /> ({Math.round(this.state.share * 100)}%)
              </p>
          </div>
      )
    };

    private getPersonShare = (index: number) => index === 0 ? this.state.share : 1 - this.state.share;

    private getPersonDividends = (index: number): number => Math.round(this.getPersonShare(index) * this.state.totalDividends);

    private renderPerson = (person: IPersonData, index: number) => {
        const taxYearConfig = this.getTaxYearConfig();
        const salary = person.onPayroll ? taxYearConfig.recommendedSalary : 0;
        const taxReturn = this.calculatePersonTax(person, index);
        const dividends = this.getPersonDividends(index);
        const onHandlePayroll = (onPayroll: boolean) => this.onHandlePayrollChange(onPayroll, index);

        return (
            <div className="card" key={`person${index}`}>
                <h3>Director #{index + 1} - <em>{Math.round(this.getPersonShare(index) * 100)}%</em></h3>
                <Person
                    onChangePayroll={onHandlePayroll}
                    dividends={dividends}
                    onPayroll={person.onPayroll}
                    salary={salary}
                />
                <div className={
                    classnames('individual-return', {
                        'additional-rate': taxReturn.isAdditionalRate,
                        'higher-rate': taxReturn.isHigherRate
                    })
                }>
                    <p><strong>Annual income: {currencyFormat(taxReturn.income)}</strong></p>
                    <h3>Tax payable: {currencyFormat(taxReturn.payable)}</h3>
                    <p>NET income: {currencyFormat(taxReturn.income - taxReturn.payable)}</p>
                    <p>Taxable income: {currencyFormat(taxReturn.taxable)}</p>
                </div>
            </div>
        );
    }

    private renderSelectTaxYear = () => (
        <select
            value={this.state.taxYear}
            onChange={this.onHandleTaxYearChange}
        >
            {
                Object.keys(TAX_YEARS).map(key => (
                    <option
                        key={key}
                        value={TAX_YEARS[key]}
                    >{ TAX_YEARS[key] }</option>
                ))
            }
        </select>
    )

    private setPersonActive = (active: boolean, selectedIndex: number = 1) => {
        return this.state.people.map((person: IPersonData, index: number) => {
            if (index === selectedIndex) {
                return {
                    ...person,
                    active
                };
            }
            return person;
        });
    }

    private addPerson = () => {
        this.setState({
            people: this.setPersonActive(true, 1),
            share: 0.5
        });
    }

    private removePerson = () => {
        this.setState({
            people: this.setPersonActive(false, 1),
            share: 1
        });
    }

    private calculatePersonTax = (person: IPersonData, index: number): ITaxReturn => {
        const taxYearConfig = this.getTaxYearConfig();
        const salary = person.onPayroll ? taxYearConfig.recommendedSalary : 0;
        const annualIncome = salary + this.getPersonDividends(index);
        return calculateTax(this.getTaxYearConfig(), annualIncome);
    }

    private getTaxYearConfig = (): ITaxYearConfig => taxYears[this.state.taxYear];

    private onHandleTaxYearChange = (event: React.SyntheticEvent<EventTarget>) => {
        if (event.target instanceof HTMLSelectElement) {
            window.console.log(event.target.value);
            this.setState({
                taxYear: event.target.value
            });
        }
    }

    private onHandlePayrollChange = (onPayroll: boolean, currentIndex: number) => {
        const people = this.state.people.map((person: IPersonData, index: number) => {
            if (currentIndex === index) {
                return {
                    ...person,
                    onPayroll
                };
            }
            return person;
        });

        this.setState({
            people
        });
    }

    private onShareChange = (event: React.SyntheticEvent<EventTarget>) => {
        if (event.target instanceof HTMLInputElement) {
            this.setState({
                share: Number(event.target.value)
            });
        }
    }
    private onHandleIsIncomeSplittingChange = (event: React.SyntheticEvent<EventTarget>) => {
        if (event.target instanceof HTMLInputElement) {
            this.setState({
                isMultiShareholders: event.target.checked
            });

            if (event.target.checked) {
                this.addPerson();
            } else {
                this.removePerson();
            }
        }
    }

    private onHandleTotalDividendsChange = (totalDividends: number) => {
        this.setState({
            totalDividends
        });
    }
}

export default App;
