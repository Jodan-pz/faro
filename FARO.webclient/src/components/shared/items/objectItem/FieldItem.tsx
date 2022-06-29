import * as React from 'react';
import { ItemValue, OutputFieldModel } from '../../../../actions/model';
import { LabeledContainerItem } from '../LabeledContainer';
import { InputValue } from '../InputValue';
import { Popup, Icon, Modal, Button } from 'semantic-ui-react';
import { createHideProp } from 'src/components/lib/UtilLib';
import { OpenableRow } from '../OpenableRow';
interface FieldItemProps extends ItemValue<OutputFieldModel> {
}
export class FieldItem extends React.Component<FieldItemProps, {   }> {
    
    constructor(props: any) {
        super(props);
    }


    listenerItemChange = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            let item: any = { ...this.props.value, [name]: newValue };
            this.props.onChange(this.props.name === undefined ? '' : this.props.name, item);  
        }
    }

    render() { 
        const { value, disabled , style} = this.props;
        let field: OutputFieldModel = value as OutputFieldModel;
        let message: Array<any> = createHideProp(field, ['name', 'selector']);
        return (

            <OpenableRow   columns={2} message={message} style={{...style, marginTop: '3px', marginBottom: '3px'}}>  
                <LabeledContainerItem  labelPosition={'left'} value={field.name} name={'name'} label={'Name: '} disabled={disabled} onChange={this.listenerItemChange} >
                    <InputValue />
                </LabeledContainerItem>

                <LabeledContainerItem labelPosition={'left'} value={field.selector} name={'selector'} label={'Selector: '} disabled={disabled} onChange={this.listenerItemChange} >
                    <InputValue />
                </LabeledContainerItem>
 
                <LabeledContainerItem labelPosition={'left'} value={field.format} name={'format'} label={'Format: '} disabled={disabled} onChange={this.listenerItemChange} >
                    <InputValue />
                </LabeledContainerItem>

                <LabeledContainerItem labelPosition={'left'} value={field.type} name={'type'} label={'Type: '} disabled={disabled} onChange={this.listenerItemChange} >
                    <InputValue />
                </LabeledContainerItem>
                
                <LabeledContainerItem labelPosition={'left'} value={field.value} name={'value'} label={'Value: '} disabled={disabled} onChange={this.listenerItemChange} >
                    <InputValue />
                </LabeledContainerItem>
            </OpenableRow>

        );
    }
} 