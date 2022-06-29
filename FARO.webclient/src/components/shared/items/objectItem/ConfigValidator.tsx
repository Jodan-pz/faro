import * as React from 'react';
import { Segment, Button, Modal, TextArea } from 'semantic-ui-react';
import { InputValue } from '../InputValue';
import { LabeledContainerItem } from '../LabeledContainer';

import { ItemValue, RuleConfig, ValidatorEngineKind } from '../../../../actions/model';
import { JsonEditorWidget } from '../../JsonEditorWidget';
import { ValidatorExpressionEditor } from '../../ValidatorExpressionEditor';
import '../../../../styles/items/items.css';
import { ArrayContainerSearch } from '../ArrayContainerSearch';
import { ExpandableContainer } from '../ExpandableContainer';
import { TextAreaItem } from '../TextAreaItem';
import { alternateStyle } from 'src/components/lib/UtilLib';

interface ConfigValidatorProps extends ItemValue<any> {
    kind: string;
    fields?: Array<string>;
}
interface ConfigValidatorState {

}
export class ConfigValidator extends React.Component<ConfigValidatorProps, ConfigValidatorState> {
    constructor(props: ConfigValidatorProps) {
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
                {kind === ValidatorEngineKind.DEFAULT && <DefaultEditor fields={this.props.fields} name={'value'} value={value && value.value || {}} disabled={disabled} onChange={this.listenerItemChange} />}
                {kind !== ValidatorEngineKind.DEFAULT && <JsonEditorWidget name={'value'} item={value && value.value || {}} disabled={disabled} onChange={this.listenerItemChange} />}
            </div>
        );
    }
}

interface DefaultEditorProps extends ItemValue<any> {
    fields?: Array<string>;
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
        let labStyle: React.CSSProperties = { width: '50px' };
        let rules: Array<any> = value.rules;
        let len: string = 'len-' + (rules !== undefined && rules !== null ? rules.length : 0);
        return (
            <LabeledContainerItem
                key={len}
                style={{ marginBottom: '5px', textAlign: 'center' }}
                label={'Rules:'}
                labelColor={'green'}
                value={rules}
                name={'rules'}
                disabled={disabled}
                onChange={this.listenerItemChange}
            >
                <ArrayContainerSearch alternateStyle={alternateStyle()} showAdd showDelete showRowNumber>
                    <DefaultRuleValue fields={this.props.fields} />
                </ArrayContainerSearch>
            </LabeledContainerItem>);
    }
}


// Default  ========================================================
interface DefaultRuleValueProps extends ItemValue<RuleConfig> {
    fields?: Array<string>;
}

class DefaultRuleValue extends React.Component<DefaultRuleValueProps, {}> {
    state = { open: false };
    shouldComponentUpdate(nextProps: DefaultRuleValueProps, nextState: any): boolean {
        const { value } = this.props;
        let nextValue: RuleConfig = nextProps.value as RuleConfig;
        let should: boolean = true;
        if (value && nextValue) {
            should = nextValue.context !== value.context
                || nextValue.expression !== value.expression
                || nextValue.message !== value.message
                || nextValue.name !== value.name;
        }
        return should;
    }

    listenerItemChange = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            let item: any = { ...this.props.value, [name]: newValue };
            this.props.onChange(this.props.name !== undefined ? this.props.name : '', item);
        }
    }

    render() {
        const { value, disabled , style} = this.props;
        let val: RuleConfig = value as RuleConfig;
        let disable: boolean = disabled || val === undefined || val.name === undefined || val.name.length === 0;

        return (
            <Segment style={{ ...style, width: '100%', margin: '0px', marginTop: '5px', padding: '6px' }}>
                <div style={{ width: '100%', margin: '0px', display: 'flex' }}>
                    <LabeledContainerItem 
                        style={{ textAlign: 'left' }} 
                        label={'Name: '} 
                        value={val && val.name || undefined} 
                        name={'name'} 
                        disabled={disabled} 
                        onChange={this.listenerItemChange}
                    >
                        <InputValue />
                    </LabeledContainerItem>
                    <LabeledContainerItem 
                        style={{ textAlign: 'left' }} 
                        label={'Context: '} 
                        value={val && val.context !== undefined ? val.context : undefined} 
                        name={'context'} 
                        disabled={disable} 
                        onChange={this.listenerItemChange}
                    >
                        <InputValue />
                    </LabeledContainerItem>
                </div>
                <div style={{ margin: '0px', marginRight: '6px', display: 'block' }}>
                    <LabeledContainerItem 
                        style={{ textAlign: 'left' }} 
                        label={'Expression: '} 
                        value={val && val.expression || undefined} 
                        name={'expression'} 
                        disabled={disable} 
                        onChange={this.listenerItemChange}
                    >
                        <ExpandableContainer disabled={disable}>
                            <InputValue />
                            <ValidatorExpressionEditor fields={this.props.fields} />
                        </ExpandableContainer>
                    </LabeledContainerItem>

                    <LabeledContainerItem 
                        style={{ textAlign: 'left' }} 
                        label={'Message: '} 
                        value={val && val.message || undefined} 
                        name={'message'} 
                        disabled={disable} 
                        onChange={this.listenerItemChange}
                    >
                        <ExpandableContainer disabled={disable}>
                            <InputValue />
                            <TextAreaItem />
                        </ExpandableContainer>
                    </LabeledContainerItem>
                </div>
            </Segment>
        );
    }
}