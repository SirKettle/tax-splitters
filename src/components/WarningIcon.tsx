import * as React from 'react';
import './WarningIcon.css';

interface IProps {
    backgroundColor?: string,
    color?: string,
    hide?: boolean
};

interface IStyles {
    backgroundColor?: string,
    borderColor?: string,
    color?: string,
    display?: string
}

const WarningIcon = (props: IProps) => {
    const styles: IStyles = {};

    if (props.color) {
        styles.color = props.color;
        styles.borderColor = props.color;
    }

    if (props.backgroundColor) {
        styles.backgroundColor = props.backgroundColor;
    }

    if (props.hide) {
        styles.display = 'none';
    }

    return (
        <span
            className="warning-icon"
            style={styles}
        >!</span>
    )
};

export default WarningIcon;