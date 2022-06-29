import * as React from 'react';
import { ItemValue, JsonConfig, JsonConfigField } from '../../../../../actions/model';
import { LabeledContainerItem } from '../../LabeledContainer';
import { InputValue } from '../../InputValue';
import { listValues } from '../../../../Utils';
import { createHideProp, alternateStyle } from 'src/components/lib/UtilLib';
import { ArrayContainerSearch } from '../../ArrayContainerSearch';
import { OpenableRow } from '../../OpenableRow';

interface JSONEditorProps extends ItemValue<any> {
}

export class JSONEditor extends React.Component<JSONEditorProps, {}> {
    listenerItemChange = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            let item: any = { ...this.props.value, [name]: newValue };
            this.props.onChange(this.props.name !== undefined ? this.props.name : '', item);
        }
    }
    render() {
        const { value, disabled } = this.props;

        let jsConf: JsonConfig = value as JsonConfig;
        let style: React.CSSProperties = { marginBottom: '5px' };
        return (
            < >
                <div style={{ width: '100%', display: 'flex', margin: '0px' }}>
                    <LabeledContainerItem style={{ ...style }} label={'Culture: '} value={jsConf && jsConf.culture || ''} name={'culture'} disabled={disabled} onChange={this.listenerItemChange}>
                        <InputValue />
                    </LabeledContainerItem>
                    <LabeledContainerItem style={{ ...style }} label={'Encoding: '} value={jsConf && jsConf.encoding || ''} name={'encoding'} disabled={disabled} onChange={this.listenerItemChange}>
                        <InputValue />
                    </LabeledContainerItem>
                </div>

                <LabeledContainerItem label={'Fields: '} labelColor={'green'} style={{ textAlign: 'center' }} value={jsConf && jsConf.fields || []} name={'fields'} disabled={disabled} onChange={this.listenerItemChange}>
                    <JSONFieldsList />
                </LabeledContainerItem>
            </>);
    }
}


interface JSONFieldsListProps extends ItemValue<any> {
}

class JSONFieldsList extends React.Component<JSONFieldsListProps, { list: Array<number> | null }> {
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
            <ArrayContainerSearch alternateStyle={alternateStyle()} showAdd showDelete defaultValue={{ name: '' }} value={listVal || []} disabled={disabled} onChange={this.listenerItemChange}>
                <JSONFieldsValue />
            </ArrayContainerSearch>
        );
    }
}


interface JSONFieldsValueProps extends ItemValue<any> {
}
class JSONFieldsValue extends React.Component<JSONFieldsListProps, {}> {
    listenerItemChange = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            let item: any = { ...this.props.value, [name]: newValue };
            this.props.onChange(this.props.name !== undefined ? this.props.name : '', item);
        }
    }
    render() {
        const { value, disabled, style } = this.props;
        let json: JsonConfigField = value as JsonConfigField;
        let message: Array<any> = createHideProp(json, ['name', 'type']);
        let lbStyle: React.CSSProperties = { textAlign: 'left' };
        return (

            <OpenableRow columns={2} message={message} style={style}>
                <LabeledContainerItem style={{ ...lbStyle }} label={'Name: '} value={json && json.name || undefined} name={'name'} disabled={disabled} onChange={this.listenerItemChange}>
                    <InputValue />
                </LabeledContainerItem>
                <LabeledContainerItem style={{ ...lbStyle }} label={'Type: '} value={json && json.type || undefined} name={'type'} disabled={disabled} onChange={this.listenerItemChange}>
                    <InputValue />
                </LabeledContainerItem>

                <LabeledContainerItem style={{ ...lbStyle }} label={'Label: '} value={json && json.label || undefined} name={'label'} disabled={disabled} onChange={this.listenerItemChange}>
                    <InputValue />
                </LabeledContainerItem>
                <LabeledContainerItem style={{ ...lbStyle }} label={'Format: '} value={json && json.format || undefined} name={'format'} disabled={disabled} onChange={this.listenerItemChange}>
                    <InputValue />
                </LabeledContainerItem>
                <LabeledContainerItem label={'When: '} value={json && json.when || undefined} name={'when'} disabled={disabled} onChange={this.listenerItemChange}>
                    <InputValue />
                </LabeledContainerItem>
            </OpenableRow>
        );
    }
}