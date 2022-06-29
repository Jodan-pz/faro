import * as React from 'react';
import { Modal, Button, Form, ModalProps } from 'semantic-ui-react';
import AceEditor from 'react-ace';
import 'brace/mode/json';
import 'brace/theme/terminal';

import { Segment, Message, Icon } from 'semantic-ui-react';

interface JsonEditorWidgetProps {
    name: string;
    item?: any;
    descriptor?: any;
    disabled?: boolean;
    onChange?: (name: string, item: any) => void;
    onError?: (name: string, messages?: string[]) => void;
    onValidated?: (name: string) => void;
}

export class JsonEditorWidget extends React.Component<JsonEditorWidgetProps, { value: string, errors?: any[], save: boolean }> {
    aceReference: any;
    modified: boolean = false;
    origValue: string;
    constructor(props: JsonEditorWidgetProps) {
        super(props);
        this.origValue = JSON.stringify(props.item, null, 2);
        this.state = { value: this.origValue, save: false, errors: undefined };
    }
    componentWillReceiveProps(next: JsonEditorWidgetProps): void {
        this.modified = false;
        this.origValue = JSON.stringify(next.item, null, 2);
        this.setState({ save: false, errors: undefined, value: this.origValue });
    }
    componentDidUpdate(): void {
        const { errors, value, save } = this.state;
        if (this.modified && save && errors === undefined && this.origValue !== value) {
            try {
                const { name, onChange } = this.props;
                const item = JSON.parse(value);
                if (onChange) onChange(name, item);
            } catch (err) {
                // 
            }
        }
    }
    hdlChange = (text: string) => {
        this.modified = true;
        this.setState({ ...this.state, value: text, save: false });
    }
    hdlValidate = (value: any[]) => {
        if (value && value.length > 0) {
            let err: any[] = value.map(v => `ROW: ${v.row} - COLUMN: ${v.column} : ${v.text}`);
            this.setState({ ...this.state, errors: err, save: false });
        } else {
            this.setState({ ...this.state, errors: undefined, save: true });
        }
    }


    render() {
        const { name, disabled } = this.props;
        const { value, errors } = this.state;
        let line: number = value ? value.split('\n').length : 1;
        let h: string = (line * 17) + 10 + 'px';
        return (
            <Segment attached style={{ padding: '5px' }}>
                {!disabled
                    ? (
                        <>
                            {/*this.modified && <Button style={{ width: '100%' }} onClick={() => this.hdlSave()}>Validate</Button>*/}
                            {errors && errors.length > 0 && <Message warning attached="bottom"><Icon name="warning" />{errors.map((v, i) => v)}</Message>}
                            <AceEditor
                                mode="json"
                                theme={'terminal'}
                                width="100%"
                                height={h}
                                name={name}
                                readOnly={disabled}
                                value={value}
                                onChange={this.hdlChange}
                                onValidate={this.hdlValidate}
                                fontSize={14}
                                showPrintMargin={false}
                                showGutter={true}
                                highlightActiveLine={true}
                                editorProps={{ $blockScrolling: true }}
                                setOptions={{ showLineNumbers: true }}
                            />
                        </>
                    )
                    : <pre style={{ margin: 0 }}>{value}</pre>}
            </Segment>
        );
    }
}