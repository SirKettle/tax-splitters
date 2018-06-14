import * as React from "react";

interface INumberProps {
    val: number,
    step?: number,
    min?: number,
    onChange: (val: number) => void,
    disabled?: boolean
}

export default class NumberInput extends React.Component<INumberProps> {

    public static defaultProps = {
        disabled: false
    }

    public render() {
        return (
            <input
                type="number"
                onChange={this.onHandleChange}
                step={this.props.step || 1}
                min={this.props.min || 0}
                value={this.props.val}
                disabled={this.props.disabled}
            />
        );
    }

    private onHandleChange = (event: React.SyntheticEvent<EventTarget>) => {
        if (event.target instanceof HTMLInputElement) {
            window.console.log(event.target.value);
            this.props.onChange(parseInt(event.target.value, 10));
        }
    }
}