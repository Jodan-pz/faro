import * as React from 'react';
import { ItemValue, WriterEngineKind } from '../../../../../actions/model';
import { DelimitedEditor } from './DelimitedEditor';
import { ExceldEditor } from './ExceldEditor';
import { JSONEditor } from './JSONEditor';
import { FixedEditor } from './FixedEditor';
import '../../../../../styles/items/items.css';
import { JsonEditorWidget } from 'src/components/shared/JsonEditorWidget';
import { WriterDefinition } from 'src/actions/faro_api_proxy';
import { StreamConfigWriter } from './addons/StreamConfigWriter';
import { MultiConfigWriter } from './addons/MultiConfigWriter';
import { ConfigWriterProps } from './ConfigWriterProps';
import { FileOperationConfigWriter } from './addons/FileOperationConfigEditor';

interface ConfigWriterState {

}

export class ConfigWriter extends React.Component<ConfigWriterProps, ConfigWriterState> {
    constructor(props: ConfigWriterProps) {
        super(props);
    }
    listenerItemChange = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            let item: any = { ...this.props.value, [name]: newValue };
            this.props.onChange(this.props.name !== undefined ? this.props.name : '', item);
        }
    }
    render() {
        const { value, definition, disabled } = this.props;
        const { kind, args } = definition;
        let clzz: string = this.props.className ? this.props.className : '';
        let style: React.CSSProperties = this.props.style ? this.props.style : {};
        const knownEditors = [WriterEngineKind.DELIMITED,
        WriterEngineKind.JSON,
        WriterEngineKind.CONSOLE,
        WriterEngineKind.EXCEL,
        WriterEngineKind.FIXED,
        WriterEngineKind.FILE_OPE,
        WriterEngineKind.MULTI,
        WriterEngineKind.STREAM];
        const defaultEditor = kind ? knownEditors.indexOf(kind) === -1 : true;
        return (
            <div className={clzz} style={style} >
                {kind === WriterEngineKind.DELIMITED && <DelimitedEditor name={'value'} value={value && value.value || {}} disabled={disabled} onChange={this.listenerItemChange} />}
                {kind === WriterEngineKind.EXCEL && <ExceldEditor name={'value'} value={value && value.value || {}} disabled={disabled} onChange={this.listenerItemChange} />}
                {kind === WriterEngineKind.FIXED && <FixedEditor name={'value'} value={value && value.value || {}} disabled={disabled} onChange={this.listenerItemChange} />}
                {kind === WriterEngineKind.JSON && <JSONEditor name={'value'} value={value && value.value || {}} disabled={disabled} onChange={this.listenerItemChange} />}
                {kind === WriterEngineKind.FILE_OPE && <FileOperationConfigWriter name={'value'} value={value} definition={definition} disabled={disabled} onChange={this.listenerItemChange} />}
                {kind === WriterEngineKind.MULTI && <MultiConfigWriter name={'value'} value={value} definition={definition} disabled={disabled} onChange={this.listenerItemChange} />}
                {kind === WriterEngineKind.STREAM && <StreamConfigWriter name={'value'} value={value} definition={definition} disabled={disabled} onChange={this.listenerItemChange} />}
                {defaultEditor && <JsonEditorWidget name={'value'} item={value && value.value || {}} disabled={disabled} onChange={this.listenerItemChange} />}
            </div>
        );
    }
}