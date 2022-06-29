import { ItemValue } from 'src/actions/model';
import * as React from 'react';
import { CheckBoxValue } from '../CheckBoxValue';
import { Input, InputOnChangeData } from 'semantic-ui-react';


interface DelimitedValueProps extends ItemValue<string> {
}

export class DelimitedValue extends React.Component<DelimitedValueProps, { freeText: string }> {
 
    getChar = (name: string) => {
        if (name === 'tab') return '\t';
        if (name === 'semicolon') return ';';
        if (name === 'comma') return ',';
        return '';
    }

    onChangeCheckbox = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            let resVal: string = '';
            if (name !== 'free') resVal = this.getChar(name as string);
            else {
                if (typeof (newValue) === 'string') {
                    resVal = (newValue as string).length > 1 ? (newValue as string).charAt(0) : newValue;
                }
            }
            this.props.onChange(this.props.name || '', resVal);
        }
    }

    render() {
        const { value, disabled } = this.props;
        let tabVal: boolean = value === '\t';
        let semiVal: boolean = value === ';';
        let commaVal: boolean = value === ',';
        let freeVal: boolean = !tabVal && !semiVal && !commaVal;

        let disabledFree: boolean = !(disabled || freeVal);

        let style: React.CSSProperties = {
            marginTop: 'auto',
            marginBottom: 'auto',
            marginRight: '15px',
        };

        let styleCheck: React.CSSProperties = {
            ...style,
            paddingRight: '15px',
            borderRightColor: 'grey',
            borderRightStyle: 'dotted',
            borderRightWidth: '1px'
        };

        return (
            <div style={{ display: 'flex' }}>
                <div style={{ ...styleCheck }} >
                    <CheckBoxValue
                        disabled={disabled}
                        value={tabVal}
                        toggle={false}
                        name={'tab'}
                        label={'TAB'}
                        onChange={this.onChangeCheckbox}
                    />
                </div>
                <div style={{ ...styleCheck }} >
                    <CheckBoxValue
                        disabled={disabled}
                        value={semiVal}
                        toggle={false}
                        name={'semicolon'}
                        label={'SEMI COLON'}
                        onChange={this.onChangeCheckbox}
                    />
                </div>
                <div style={{ ...styleCheck }} >
                    <CheckBoxValue
                        disabled={disabled}
                        value={commaVal}
                        toggle={false}
                        name={'comma'}
                        label={'COMMA'}
                        onChange={this.onChangeCheckbox}
                    />
                </div>
                <div style={{ ...style }} >
                    <CheckBoxValue
                        disabled={disabled}
                        value={freeVal}
                        toggle={false}
                        name={'free'}
                        label={'FREE CHAR'}
                        onChange={this.onChangeCheckbox}
                    />
                </div>
                <div style={{ ...styleCheck }} >
                    <Input
                        style={{ width: '60px' }}
                        value={!disabledFree ? value : ''}
                        type={'text'}
                        disabled={disabledFree}
                        onChange={(event: React.SyntheticEvent<HTMLInputElement>, data: InputOnChangeData) => this.onChangeCheckbox('free', data.value)}
                    />
                </div>
            </div>
        );
    }
}