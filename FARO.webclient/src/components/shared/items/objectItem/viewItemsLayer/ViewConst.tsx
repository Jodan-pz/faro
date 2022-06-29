import * as React from 'react';
import { ItemValue } from '../../../../../actions/model';
import { Menu } from 'semantic-ui-react';
import { isNull } from 'util';
import { InputValue } from '../../InputValue';
import { DropValue } from '../../DropValue';

interface ViewConstProps extends ItemValue<any> {

}

export class ViewConst extends React.Component<ViewConstProps, { typeConst: string }> {
    textValue: string = '';
    numberValue: number = 0;
    boolValue: boolean = false;
    constructor(props: ViewConstProps) {
        super(props);
        this.state = this.initialState(props.value);
    }

    componentWillReceiveProps(props: any): void {
        this.setState(this.initialState(props.value));
    }

    initialState = (val: any) => {
        let isnull: boolean = isNull(val);
        let tpof: string = typeof (val);
        let type: string = isnull ? 'null' : (tpof === 'number' ? 'number' : (tpof === 'boolean' ? 'boolean' : 'text'));
        if (type === 'text') this.textValue = val;
        if (type === 'number') this.numberValue = val;
        if (type === 'boolean') this.boolValue = val;
        return {
            typeConst: type
        };
    }
    changeInput = (name: string | number, newValue: any) => {
        const { typeConst } = this.state;
        if (typeConst === 'text') this.textValue = newValue;
        if (typeConst === 'number') this.numberValue = parseInt(newValue, 10);
        if (typeConst === 'boolean') this.boolValue = newValue;
        this.update();
    }

    update = () => {
        const { typeConst } = this.state;
        if (this.props.onChange) {
            let val: any = typeConst === 'text' ? this.textValue : (typeConst === 'number' ? this.numberValue : (typeConst === 'boolean' ? this.boolValue : null));
            this.props.onChange('const', val);
        }
    }

    setMode = (type: string) => {
        const { typeConst } = this.state;
        if (type !== typeConst) {
            this.setState({ typeConst: type }, () => {
                this.update();
            });
        }
    }
    render() {
        const { typeConst } = this.state;
        let isNullValue: boolean = !(typeConst === 'text' || typeConst === 'number' || typeConst === 'boolean');
        let val: any = isNullValue ? 'null' : (typeConst === 'text' ? this.textValue : (typeConst === 'number' ? this.numberValue : this.boolValue));

        let typeInput: string = isNullValue || typeConst === 'boolean' ? 'text' : typeConst;
        return (
            <div style={{ width: '100%' }}>
                <Menu>
                    <Menu.Item content="Text value" active={typeConst === 'text'} onClick={() => this.setMode('text')} />
                    <Menu.Item content="Number value" active={typeConst === 'number'} onClick={() => this.setMode('number')} />
                    <Menu.Item content="Boolean value" active={typeConst === 'boolean'} onClick={() => this.setMode('boolean')} />
                    <Menu.Item content="Null value" active={typeConst === 'null'} onClick={() => this.setMode('null')} />
                </Menu>
                <div style={{ display: 'flex' }}>
                    {typeConst !== 'boolean' && <InputValue
                        style={{ width: '100%', marginRight: '5px' }}
                        disabled={isNullValue}
                        type={typeInput}
                        value={val}
                        name="const"
                        onChange={this.changeInput}
                    />}
                    {typeConst === 'boolean' &&
                        <DropValue
                            name={'const'}
                            style={{ width: '100%', marginRight: '5px' }}
                            items={['false', 'true']}
                            value={val.toString()}
                            onChange={(name: string | number, newValue: any) => {
                                let realVal: boolean = newValue === 'true';
                                this.changeInput(name, realVal);
                            }}
                        />}
                </div>
            </div>);
    }
}