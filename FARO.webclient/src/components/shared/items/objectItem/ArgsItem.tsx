import * as React from 'react';
import { ArgumentModel, ItemValue } from '../../../../actions/model';
import { LabeledContainerItem } from '../LabeledContainer';
import { InputValue } from '../InputValue';
import '../../../../styles/items/items.css';
import { CheckBoxValue } from '../CheckBoxValue';
import { cloneObject } from 'src/components/Utils';

interface ArgsItemProps extends ItemValue<ArgumentModel> {
}

export class ArgsItem extends React.Component<ArgsItemProps, {}> {
    constructor(props: ArgsItemProps) {
        super(props);
    }

    listenerItemChange = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            let item: ArgumentModel = cloneObject(this.props.value, name as string, newValue) as ArgumentModel;
            this.props.onChange(this.props.name !== undefined ? this.props.name : '', item);
        }
    }

    render() {
        const { value, disabled } = this.props;
        let clzz: string = this.props.className ? this.props.className : 'divbox';
        let style: React.CSSProperties = this.props.style ? this.props.style : {};
        let args: ArgumentModel = value as ArgumentModel;
        return (
            <div className={clzz} style={style} > 
                <LabeledContainerItem  labelPosition={'left'} value={args.name} name={'name'} label={'Name: '} disabled={disabled} onChange={this.listenerItemChange} >
                    <InputValue />
                </LabeledContainerItem>
                <LabeledContainerItem   labelPosition={'left'} value={args.description} name={'description'} label={'Description: '} defaultValue={''} disabled={disabled} onChange={this.listenerItemChange} >
                    <InputValue />
                </LabeledContainerItem>
                <LabeledContainerItem  labelPosition={'left'} style={{width: '140px'}}  value={args.optional} name={'optional'} label={'Optional: '}  disabled={disabled} onChange={this.listenerItemChange} >
                    <CheckBoxValue />
                </LabeledContainerItem>
            </div>
        );
    }
}
