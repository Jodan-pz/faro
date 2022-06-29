import * as React from 'react';
import { createHideProp, alternateStyle } from 'src/components/lib/UtilLib';
import { FixedConfig, FixedConfigField, ItemValue } from '../../../../../actions/model';
import { listValues } from '../../../../Utils';
import { ArrayContainerSearch } from '../../ArrayContainerSearch';
import { InputValue } from '../../InputValue';
import { LabeledContainerItem } from '../../LabeledContainer';
import { OpenableRow } from '../../OpenableRow';

interface FixedEditorProps extends ItemValue<any> {
}
export class FixedEditor extends React.Component<FixedEditorProps, {}> {


    listenerItemChange = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            let item: any = { ...this.props.value, [name]: newValue };
            this.props.onChange(this.props.name !== undefined ? this.props.name : '', item);
        }
    }
    render() {
        const { value, disabled } = this.props;

        let fxConf: FixedConfig = value as FixedConfig;

        return (
            < >
                <div style={{ width: '100%', display: 'flex', margin: '0px' }}>
                    <LabeledContainerItem label={'Culture: '} value={fxConf && fxConf.culture || ''} name={'culture'} disabled={disabled} onChange={this.listenerItemChange}>
                        <InputValue />
                    </LabeledContainerItem>
                    <LabeledContainerItem label={'Encoding: '} value={fxConf && fxConf.encoding || ''} name={'encoding'} disabled={disabled} onChange={this.listenerItemChange}>
                        <InputValue />
                    </LabeledContainerItem>
                    <LabeledContainerItem label={'Length: '} value={fxConf && fxConf.length || ''} name={'length'} disabled={disabled} onChange={this.listenerItemChange}>
                        <InputValue type={'number'} />
                    </LabeledContainerItem>
                </div>

                <LabeledContainerItem
                    style={{ textAlign: 'center' }}
                    labelColor={'green'}
                    label={'Fields:'}
                    value={fxConf && fxConf.fields || []}
                    name={'fields'}
                    disabled={disabled}
                    onChange={this.listenerItemChange}
                >
                    <FixedFieldsList />
                </LabeledContainerItem>
            </>);
    }
}

interface FixedFieldsValueProps extends ItemValue<any> {
}
class FixedFieldsValue extends React.Component<FixedFieldsValueProps, { open: boolean }> {
    state = { open: false };

    listenerItemChange = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            let item: any = { ...this.props.value, [name]: newValue };
            this.props.onChange(this.props.name !== undefined ? this.props.name : '', item);
        }
    }

    render() {
        const { value, disabled , style} = this.props;
        const { open } = this.state;
        let fixField: FixedConfigField = value as FixedConfigField;
        let message: Array<any> = createHideProp(fixField, ['name', 'type', 'format']);
        let styleItem: React.CSSProperties = { textAlign: 'left' };

        return (
            <OpenableRow columns={3} message={message} style={style}>
                <LabeledContainerItem style={{ ...styleItem }} label={'Name: '} value={fixField && fixField.name || undefined} name={'name'} disabled={disabled} onChange={this.listenerItemChange}>
                    <InputValue />
                </LabeledContainerItem>
                <LabeledContainerItem style={{ ...styleItem }} label={'Type: '} value={fixField && fixField.type || undefined} name={'type'} disabled={disabled} onChange={this.listenerItemChange}>
                    <InputValue />
                </LabeledContainerItem>
                <LabeledContainerItem style={{ ...styleItem }} label={'Format: '} value={fixField && fixField.format || undefined} name={'format'} disabled={disabled} onChange={this.listenerItemChange}>
                    <InputValue />
                </LabeledContainerItem>
                <LabeledContainerItem style={{ ...styleItem }} label={'Description: '} value={fixField && fixField.description || undefined} name={'description'} disabled={disabled} onChange={this.listenerItemChange}>
                    <InputValue />
                </LabeledContainerItem>
                <LabeledContainerItem style={{ ...styleItem }} label={'When: '} value={fixField && fixField.when || undefined} name={'when'} disabled={disabled} onChange={this.listenerItemChange}>
                    <InputValue />
                </LabeledContainerItem>
                <LabeledContainerItem style={{ ...styleItem }} label={'Start: '} value={fixField && fixField.start || undefined} name={'start'} disabled={disabled} onChange={this.listenerItemChange}>
                    <InputValue type={'number'} />
                </LabeledContainerItem>
                <LabeledContainerItem style={{ ...styleItem }} label={'Length: '} value={fixField && fixField.length || undefined} name={'length'} disabled={disabled} onChange={this.listenerItemChange}>
                    <InputValue type={'number'} />
                </LabeledContainerItem>
                <LabeledContainerItem label={'Virtual Dec: '} value={fixField && fixField.virtualDec || undefined} name={'virtualDec'} disabled={disabled} onChange={this.listenerItemChange}>
                    <InputValue type={'number'} />
                </LabeledContainerItem>
            </OpenableRow>
        );
    }
}



interface FixedFieldsListProps extends ItemValue<any> {
}

class FixedFieldsList extends React.Component<FixedFieldsListProps, { list: Array<number> | null }> {
    state = { list: [] };
    listenerItemChange = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            this.props.onChange(this.props.name !== undefined ? this.props.name : '', newValue);
        }
    }
    render() {
        const { value, disabled } = this.props;
        const { list } = this.state;
        let listVal: Array<any> = list === null ? [] : list && list.length === 0 ? value : listValues(list, value);
        return (
            <ArrayContainerSearch alternateStyle={alternateStyle()} showAdd showDelete showRowNumber onChange={this.listenerItemChange} defaultValue={{}} value={listVal || []} disabled={disabled}>
                <FixedFieldsValue />
            </ArrayContainerSearch>
        );
    }
}

