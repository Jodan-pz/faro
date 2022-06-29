import * as React from 'react';
import { ItemValue, Delimited, Field } from '../../../../../actions/model';
import { LabeledContainerItem } from '../../LabeledContainer';
import { CheckBoxValue } from '../../CheckBoxValue';
import { DelimitedValue } from '../DelimitedValue';
import { InputValue } from '../../InputValue';
import { listValues } from '../../../../Utils';
import { ArrayContainerSearch } from '../../ArrayContainerSearch';
import { createHideProp, alternateStyle } from 'src/components/lib/UtilLib';
import { OpenableRow } from '../../OpenableRow';

interface DelimitedEditorProps extends ItemValue<any> {
}

export class DelimitedEditor extends React.Component<DelimitedEditorProps, {}> {
    listenerItemChange = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            let item: any = { ...this.props.value, [name]: newValue };
            this.props.onChange(this.props.name !== undefined ? this.props.name : '', item);
        }
    }

    render() {
        const { value, disabled } = this.props;
        let val: Delimited = value as Delimited;
        let delim: string = val.delim || '';
        let style: React.CSSProperties = {};
        return (
            < >
                <LabeledContainerItem label={'Delim: '} value={delim} name={'delim'} disabled={disabled} onChange={this.listenerItemChange}>
                    <DelimitedValue />
                </LabeledContainerItem>

                <div style={{ width: '100%', display: 'flex', margin: '0px' }}>
                    <LabeledContainerItem label={'Culture: '} value={val.culture || ''} name={'culture'} disabled={disabled} onChange={this.listenerItemChange}>
                        <InputValue />
                    </LabeledContainerItem>
                    <LabeledContainerItem label={'Encoding: '} value={val.encoding || ''} name={'encoding'} disabled={disabled} onChange={this.listenerItemChange}>
                        <InputValue />
                    </LabeledContainerItem>
                    <LabeledContainerItem style={{ width: '160px' }} labelPosition={'left'} label={'Include header: '} value={val.includeheader || false} name={'includeheader'} disabled={disabled} onChange={this.listenerItemChange}>
                        <CheckBoxValue />
                    </LabeledContainerItem>
                </div>


                <LabeledContainerItem style={{ ...style }} label={'Fields: '} value={val.fields || []} name={'fields'} disabled={disabled} onChange={this.listenerItemChange}>
                    <FieldsEditor />
                </LabeledContainerItem>

            </>);
    }
}

// FIELDS ========================================================   

interface FieldsEditorProps extends ItemValue<any> {
}

class FieldsEditor extends React.Component<FieldsEditorProps, { list: Array<number> | null }> {
    state = { list: [] };
    listenerItemChange = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            this.props.onChange(this.props.name !== undefined ? this.props.name : '', newValue);
        }
    }
    render() {
        const { list } = this.state;
        const { value, disabled } = this.props;
        let listVal: Array<any> = list === null ? [] : list && list.length === 0 ? value : listValues(list, value);
        return (
            <ArrayContainerSearch 
                alternateStyle={alternateStyle()} 
                showRowNumber={true}   
                defaultValue={null} 
                showAdd 
                showDelete 
                value={listVal || []} 
                disabled={disabled} 
                onChange={this.listenerItemChange} 
            >
                <Fieldsvalue />
            </ArrayContainerSearch>
        );
    }
}

interface FieldsValueProps extends ItemValue<any> {
   
}

class Fieldsvalue extends React.Component<FieldsValueProps, {}> {

    listenerItemChange = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            let item: any = { ...this.props.value, [name]: newValue };
            this.props.onChange(this.props.name !== undefined ? this.props.name : '', item);
        }
    }

    render() {
        const { value, disabled, style } = this.props;
        let val: Field = value as Field;
        let message: Array<any> = createHideProp(val, ['name', 'order', 'label']);
        return (
            <OpenableRow columns={3} message={message} style={{...style, margin: '2px'}}>
                <LabeledContainerItem  label={'Name: '} value={val && val.name || undefined} name={'name'} disabled={disabled} onChange={this.listenerItemChange}>
                    <InputValue />
                </LabeledContainerItem>
                <LabeledContainerItem   label={'Label: '} value={val && val.label || undefined} name={'label'} disabled={disabled} onChange={this.listenerItemChange}>
                    <InputValue />
                </LabeledContainerItem>
                <LabeledContainerItem   label={'Order: '} value={val && val.order || undefined} name={'order'} disabled={disabled} onChange={this.listenerItemChange}>
                    <InputValue type={'number'} placeholder={'...'} />
                </LabeledContainerItem>
                <LabeledContainerItem label={'Type: '} value={val && val.type || undefined} name={'type'} disabled={disabled} onChange={this.listenerItemChange}>
                    <InputValue />
                </LabeledContainerItem>
                <LabeledContainerItem label={'Description: '} value={val && val.description || undefined} name={'description'} disabled={disabled} onChange={this.listenerItemChange}>
                    <InputValue />
                </LabeledContainerItem>
                <LabeledContainerItem label={'Format: '} value={val && val.format || undefined} name={'format'} disabled={disabled} onChange={this.listenerItemChange}>
                    <InputValue />
                </LabeledContainerItem>
                <LabeledContainerItem label={'Quote: '} value={val && val.quote || undefined} name={'quote'} disabled={disabled} onChange={this.listenerItemChange}>
                    <InputValue />
                </LabeledContainerItem>
                <LabeledContainerItem label={'When: '} value={val && val.when || undefined} name={'when'} disabled={disabled} onChange={this.listenerItemChange}>
                    <InputValue />
                </LabeledContainerItem>
            </OpenableRow>
        );
    }
}