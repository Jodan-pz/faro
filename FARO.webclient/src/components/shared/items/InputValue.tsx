import * as React from 'react';
import { Input, Button } from 'semantic-ui-react';
import { ItemValue } from '../../../actions/model';
import '../../../styles/items/items.css';

interface InputValueProps extends ItemValue<string | number | undefined> {
    placeholder?: string;
    /** The HTML input type. */
    type?: string;
    fireChangeOnBlur?: boolean;
}
interface InputValueState {
    text: any;
}
export class InputValue extends React.Component<InputValueProps, InputValueState> {

    state = { text: '' };

    shouldComponentUpdate(nextProps: InputValueProps, nextState: InputValueState): boolean {
        const { value, disabled, fireChangeOnBlur, style } = this.props;
        if (
            value !== nextProps.value
            || disabled !== nextProps.disabled
            || fireChangeOnBlur !== nextProps.fireChangeOnBlur
            || style !== nextProps.style
            || this.state.text !== nextState.text
        ) return true;
        return false;
    }

    componentDidMount(): void {
        if (this.props.value) {
            this.setState({ text: this.props.value as string });
        }
    }

    componentDidUpdate(prevProps: InputValueProps): void {
        const { fireChangeOnBlur } = this.props;
        if (fireChangeOnBlur && this.props.value !== prevProps.value) {
            this.setState({ text: (this.props.value as string) || '' });
        }
    }

    fireOut = (newVal: any) => {
        if (this.props.onChange && this.props.value !== newVal) {
            this.props.onChange(this.props.name !== undefined ? this.props.name : '', newVal);
        }
    }


    onChangeInput = (newVal: any) => {
        const { fireChangeOnBlur } = this.props;
        if (fireChangeOnBlur) {
            this.setState({ ...this.state, text: newVal });
        } else {
            this.fireOut(newVal);
        }
    }

    render() {
        const { disabled, fireChangeOnBlur, value } = this.props;
        let clzz: string = this.props.className ? this.props.className : 'inputBox';
        let style: React.CSSProperties = this.props.style ? this.props.style : {};
        let placeholder: string = this.props.placeholder || 'insert value...';
        let type: string = this.props.type || 'text';
        let showValue: any = fireChangeOnBlur ? this.state.text : (value || '');
        return (
            <Input
                onBlur={(ev: any) => {
                    if (fireChangeOnBlur) {
                        this.fireOut(showValue);
                    }
                }}
                className={clzz}
                style={style}
                type={type}
                disabled={disabled}
                placeholder={placeholder}
                value={showValue}
                onChange={(e: any, d: any) => this.onChangeInput(d.value)}
            >
                <input />
            </Input>
        );
    }
}
