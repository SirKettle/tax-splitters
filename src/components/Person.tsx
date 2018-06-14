import * as React from "react";
import { currencyFormat } from "../utils/number";

export interface IPersonData {
    onPayroll: boolean
}

interface IProps extends IPersonData {
    dividends: number,
    onChangePayroll: (onPayroll: boolean) => void
    salary: number
}

export default class Person extends React.Component<IProps> {

    public render() {
        return (
            <div>
                <p>
                    On payroll? <input type="checkbox" checked={this.props.onPayroll} onChange={this.onHandlePayrollChange} />
                </p>
                <p>
                    Dividends: {currencyFormat(this.props.dividends)}
                    <br /><em><small>Equivalent to monthly dividends of {currencyFormat(this.props.dividends / 12)}</small></em>
                </p>
                { this.renderSalary() }
            </div>
        );
    }

    private renderSalary = () => {
        // if (this.props.onPayroll) {
            return (
                <p>
                    Salary: *{currencyFormat(this.props.salary)}
                    <br /><em><small>Monthly salary: {currencyFormat(this.props.salary / 12)}</small></em>
                </p>
            );
        // }
        // return null;
    }

    private onHandlePayrollChange = (event: React.SyntheticEvent<EventTarget>) => {
        if (event.target instanceof HTMLInputElement) {
            this.props.onChangePayroll(event.target.checked);
        }
    }
}
