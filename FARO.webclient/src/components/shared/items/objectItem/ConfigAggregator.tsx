import * as React from 'react';
import { ItemValue, DefaultAggregatorConfig, DefaultAggregatorConfigField, CovipAggregatorConfig, AggregatorEngineKind } from '../../../../actions/model';
import { InputValue } from '../InputValue';
import { Segment } from 'semantic-ui-react';
import { LabeledContainerItem } from '../LabeledContainer';
import { DropAggregatorFunction } from './DropAggregatorFunction';
import { cloneObject } from 'src/components/Utils';
import { ArrayContainerSearch } from '../ArrayContainerSearch';

import '../../../../styles/items/items.css';
import { alternateStyle } from 'src/components/lib/UtilLib';

interface ConfigAggregatorProps extends ItemValue<any> {
    kind: string;
}
interface ConfigAggregatorState {

}
export class ConfigAggregator extends React.Component<ConfigAggregatorProps, ConfigAggregatorState> {
    constructor(props: ConfigAggregatorProps) {
        super(props);

    }
    listenerItemChange = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            let item: any = { ...this.props.value, [name]: newValue };
            this.props.onChange(this.props.name !== undefined ? this.props.name : '', item);
        }
    }
    render() {
        const { value, kind, disabled } = this.props;
        let clzz: string = this.props.className ? this.props.className : '';
        let style: React.CSSProperties = this.props.style ? this.props.style : {};
        return (
            <div className={clzz} style={style} >
                {kind === AggregatorEngineKind.DEFAULT && <DefaultEditor name={'value'} value={value && value.value || {}} disabled={disabled} onChange={this.listenerItemChange} />}
                {kind === AggregatorEngineKind.COVIP && <CovipEditor name={'value'} value={value && value.value || {}} disabled={disabled} onChange={this.listenerItemChange} />}
            </div>
        );
    }
}
// Default  ========================================================
interface DefaultFieldsValueProps extends ItemValue<DefaultAggregatorConfigField> {
}
class DefaultFieldsvalue extends React.Component<DefaultFieldsValueProps, {}> {
    state = { open: false };
    listenerItemChange = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            let item: any = { ...this.props.value, [name]: newValue };
            this.props.onChange(this.props.name !== undefined ? this.props.name : '', item);
        }
    }
    render() {
        const { value, disabled , style} = this.props;
        let val: DefaultAggregatorConfigField = value as DefaultAggregatorConfigField;
        return (
            <Segment style={{ ...style, width: '100%', margin: '0px', marginTop: '4px' }}>
                <LabeledContainerItem  label={'Name: '} value={val && val.name || undefined} name={'name'} disabled={disabled} onChange={this.listenerItemChange}>
                    <InputValue />
                </LabeledContainerItem>
                <LabeledContainerItem style={{ marginTop: '4px' }} label={'Function: '} value={val && val.function !== undefined ? val.function : undefined} name={'function'} disabled={disabled} onChange={this.listenerItemChange}>
                    <DropAggregatorFunction />
                </LabeledContainerItem>
            </Segment>
        );
    }
}
interface DefaultFieldsEditorProps extends ItemValue<any> {
}
class DefaultFieldsEditor extends React.Component<DefaultFieldsEditorProps, {  }> {
    
    listenerItemChange = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
           
            this.props.onChange(this.props.name !== undefined ? this.props.name : '', newValue);
        }
    }
    render() {
        const { value, disabled } = this.props;
        let listVal: Array<any> = value as Array<any>;
        return (
           
                <ArrayContainerSearch 
                    alternateStyle={alternateStyle()}
                    defaultValue={{}}
                    disabled={disabled} 
                    showAdd
                    showDelete
                    showRowNumber
                    value={listVal || []}
                    name={'fields'}
                    onChange={this.listenerItemChange}
                >
                    <DefaultFieldsvalue />
                </ArrayContainerSearch>
 
        );
    }
}

interface DefaultEditorProps extends ItemValue<any> {
}

class DefaultEditor extends React.Component<DefaultEditorProps, {}> {
    listenerItemChange = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            let item: any = { ...this.props.value, [name]: newValue };
            this.props.onChange(this.props.name !== undefined ? this.props.name : '', item);
        }
    }
    render() {
        const { value, disabled } = this.props;
        let val: DefaultAggregatorConfig = value as DefaultAggregatorConfig;
        let labStyle: React.CSSProperties = { width: '50px' };
        //  <DefaultFieldsEditor />
        return (
            <   >

                <LabeledContainerItem
                    style={{ marginBottom: '5px' }}
                    label={'Filter: '}
                    value={val.filter}
                    name={'filter'}
                    disabled={disabled}
                    onChange={this.listenerItemChange}
                >
                    <InputValue />
                </LabeledContainerItem>
 
                <LabeledContainerItem   label={'Fields: '} value={val.fields} name={'fields'} disabled={disabled} onChange={this.listenerItemChange}>
                    <DefaultFieldsEditor />
                </LabeledContainerItem>
            </ >

        );
    }
}

// Covip ========================================================
interface CovipEditorProps extends ItemValue<any> {
}
class CovipEditor extends React.Component<CovipEditorProps, {}> {
    listenerItemChange = (name: string, newValue: any) => {
        if (this.props.onChange) {
            let item: any = cloneObject(this.props.value, name, newValue);
            this.props.onChange(this.props.name !== undefined ? this.props.name : '', item);
        }
    }
    render() {
        const { value, disabled } = this.props;
        let val: CovipAggregatorConfig = value as CovipAggregatorConfig;
        let target: string = val.target || '';
        let connectionName: string = (val as any).connectionName || undefined;
        let currenciesFilePath: string = (val as any).currenciesFilePath || undefined;
        let style: React.CSSProperties = {marginBottom: '4px'};
        return (
            < >
                <LabeledContainerItem style={style} label={'Target: '} value={target} name={'target'} disabled={disabled} onChange={this.listenerItemChange}>
                    <InputValue />
                </LabeledContainerItem>
                
                <LabeledContainerItem style={style} label={'Connection: '} value={connectionName} name={'connectionName'} disabled={disabled} onChange={this.listenerItemChange}>
                    <InputValue />
                </LabeledContainerItem>

                <LabeledContainerItem style={style} label={'Currencies File Path: '} value={currenciesFilePath} name={'currenciesFilePath'} disabled={disabled} onChange={this.listenerItemChange}>
                    <InputValue />
                </LabeledContainerItem>
            </>);
    }
}