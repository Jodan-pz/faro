import * as React from 'react';
import { ItemValue } from '../../../../../actions/model';
import { LabeledContainerItem } from '../../LabeledContainer';
import { CheckBoxValue } from '../../CheckBoxValue';
interface ConsoleEditorProps extends ItemValue<any> {
}

export class ConsoleEditor extends React.Component<ConsoleEditorProps, {}> {
    listenerItemChange = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            let item: any = { ...this.props.value, [name]: newValue };
            this.props.onChange(this.props.name !== undefined ? this.props.name : '', item);
        }
    }
    render() {
        const { value, disabled } = this.props;
        let debug: string = value && value.debug;
        return (
            <LabeledContainerItem labelPosition={'left'} label={'Debug: '} value={debug} name={'debug'} disabled={disabled} onChange={this.listenerItemChange}>
                <CheckBoxValue style={{marginLeft: '20px'}}/>
            </LabeledContainerItem>
        );
    }
}