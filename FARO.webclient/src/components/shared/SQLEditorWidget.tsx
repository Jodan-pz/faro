import * as React from 'react';
import { Modal, Button, Form, ModalProps } from 'semantic-ui-react';
import AceEditor from 'react-ace';
import 'brace/mode/sql';
import 'brace/theme/sqlserver';

import { Segment, Message, Icon } from 'semantic-ui-react';

interface SQLEditorWidgetProps {
    name: string;
    item?: any;
    disabled?: boolean;
    onChange?: (name: string, item: any) => void;

}

export class SQLEditorWidget extends React.Component<SQLEditorWidgetProps, { value: string, open: boolean }> {
    aceReference: any;
    modified: boolean = false;
    origValue: string;
    constructor(props: SQLEditorWidgetProps) {
        super(props);
        this.origValue = props.item;
        this.state = { value: this.origValue, open: false };
    }
    componentWillReceiveProps(next: SQLEditorWidgetProps): void {
        this.modified = false;
        this.origValue = next.item;
        this.setState({ value: this.origValue });
    }
    componentDidUpdate(): void {
        const { value } = this.state;
        if (this.modified && this.origValue !== value) {
            try {
                const { name, onChange } = this.props;
                if (onChange) onChange(name, value);
            } catch (err) {
                // 
            }
        }
    }
    hdlChange = (text: string) => {
        this.modified = true;
        this.setState({ ...this.state, value: text });
    }

    onClose = () => {
        this.setState({ ...this.state, open: false });
    }

    render() {
        const { name, disabled } = this.props;
        const { value, open } = this.state;
        let line: number = value ? value.split('\n').length : 1;
        let h: string = (open ? 500 : (line * 17) + 10) + 'px';
        let ace: any = (
            <AceEditor
                mode={'sql'}
                theme={'sqlserver'}
                width="100%"
                height={h}
                name={name}
                readOnly={disabled}
                value={value}
                onChange={this.hdlChange}
                fontSize={14}
                showPrintMargin={false}
                showGutter={true}
                highlightActiveLine={true}
                editorProps={{ $blockScrolling: true }}
                setOptions={{
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    enableSnippets: true,
                    showLineNumbers: true
                }}
            />);

        return (
            
            <Segment attached style={{ padding: '5px' }}>
               
                {!open && !disabled &&
                    <div style={{ width: '100%', display: 'flex' }}>
                        <Button
                            style={{ height: '30px', marginTop: 'auto', marginBottom: 'auto' }}
                            size="tiny"
                            icon="expand arrows alternate"
                            onClick={() => this.setState({ ...this.state, open: true })}
                        />
                        {ace}
                    </div>}
                {open && !disabled &&
                    <Modal closeIcon open={true} onClose={this.onClose} style={{ width: '90%' }} closeOnDimmerClick={false}>
                        <Modal.Content scrolling={true}>
                            {ace}
                        </Modal.Content>
                    </Modal>
                }
                {!open && disabled && <pre style={{ margin: 0 }}>{value}</pre>}
            </Segment>);
    }
}