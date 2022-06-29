import * as React from 'react';
import * as reducers from '../../reducers';
import { keysIteratorGet, keysIteratorUpdate, keysIteratorClear, cloneItem, registeredEngines } from '../../actions';
import { KeysIteratorModel, KeysIteratorSourceType, ArgumentModel } from '../../actions/model';
import { appConnector, Link } from 'app-support';
import { Segment, Button, Menu } from 'semantic-ui-react';
import { HeaderMenuWidget, dialogMenuWidget } from '../shared/MenuWidget';
import { KeysIteratorItem } from './KeysIteratorItem';
import { ConfirmWidget } from '../shared/DialogWidget';
import { TableEditableWidget } from '../shared/EditableWidget';
import { JsonEditorGet } from '../shared/JsonEditorGet';
import { Copy } from '../shared/Copy';
import { KeysIteratorContentEditor } from './KeysIteratorContentEditor';


const conn = appConnector<{ id: string, onContinue?: (where: string) => void }>()(
    (s, p) => ({
        current: reducers.getKeysIterator(s, p.id),
        sourceTypeList: reducers.getKeysIteratorEngines(s)
    }),
    {
        keysIteratorGet,
        keysIteratorClear,
        keysIteratorUpdate,
        cloneItem,
        registeredEngines
    }
);

export interface KeysIteratorEditorState {
    current?: KeysIteratorModel;
    editJSON: boolean;
    modified: boolean;
}

class KeysIteratorEditor extends conn.StatefulCompo<KeysIteratorEditorState> {
    args: { [type: number]: any } = {};
    oldtype: any;
    refJsonEditor: JsonEditorGet | null;

    constructor(props: any) {
        super(props);
        this.state = { current: props.current, editJSON: false, modified: false };
        if (props.current) this.updateCurrType(props.current);
    }

    componentDidMount() {
        if (window && window.scrollTo) window.scrollTo(0, 0);
        if (this.state.current === undefined) this.props.keysIteratorGet(this.props.id);
        this.props.registeredEngines();
    }
    getSnapshotBeforeUpdate(prevProps: any, prevState: KeysIteratorEditorState): any {
        // bisogna rilasciare uno snapshot solo quando effettivamente cambia la props current
        // e non quando passa di qui per via di un refresh dovuto allo state
        let inModified: boolean = prevState.modified !== this.state.modified || this.state.modified;
        let prevType = this.oldtype;
        let currType = this.props.current && this.props.current.source && this.props.current.source.type;
        if (!inModified && currType && prevType !== currType) {
            this.updateCurrType(this.props.current);
            return { ...this.props.current };
        }
        return null;
    }
    componentDidUpdate(prevProps: any, prevState: KeysIteratorEditorState, snapshot: any): void {
        if (snapshot !== null) {
            this.setState({ current: snapshot, modified: false });
        }
    }
    componentWillUnmount(): void {
        this.props.keysIteratorClear(this.props.id);
    }
    updateCurrType = (newItem: any) => {
        let currType = newItem.source && newItem.source.type;
        if (currType !== undefined) {
            this.oldtype = currType;
            if (newItem.source && newItem.source.args) {
                this.args[this.oldtype] = { ...(newItem.source && newItem.source.args) };
            }
        }
    }

    changeState = (newItem: KeysIteratorModel, modified: boolean = true) => {
        this.updateCurrType(newItem);
        this.setState({ current: newItem, modified });
    }

    changeStateJSON = () => {

        const { modified } = this.state;
        let newState: any = {};
        newState.modified = modified;
        newState.editJSON = !this.state.editJSON;
        if (modified) {
            let json: any = this.getJSON();
            if (json) {
                this.updateCurrType(json);
                newState.current = json;
            }
        }
        this.setState({ ...this.state, ...newState });
    }

    getJSON = () => {
        if (this.refJsonEditor) {
            return this.refJsonEditor.getJson();
        }
        return null;
    }

    onCancel = () => {
        this.args = {};
        this.oldtype = undefined;
        let currType = this.props.current && this.props.current.source && this.props.current.source.type;
        if (currType !== undefined)
            this.args[currType] = { ...(this.props.current && this.props.current.source && this.props.current.source.args) };

        this.setState({ current: this.props.current, modified: false });
    }
    internalSave = (item: any) => {
        if (item) {
            if (this.props.keysIteratorUpdate) {
                this.props.keysIteratorUpdate(item);
            }
            this.setState({ ...this.state, modified: false });
        }
    }
    onSave = () => {
        const { current, editJSON } = this.state;
        if (editJSON) {
            let json: any = this.getJSON();
            if (json) {
                this.internalSave(json);
            }
        } else if (current) {
            this.internalSave({ ...current });
        }
    }


    cloneItem = () => {
        const { current } = this.props;
        if (this.props.cloneItem && this.props.onContinue) {
            let item: KeysIteratorModel = current as KeysIteratorModel;

            let clItem: KeysIteratorModel = {
                name: 'Clone of ' + item.name,
                description: item.description,
                args: !item.args ? [] : item.args.slice(),
                fields: !item.fields ? [] : item.fields.slice(),
                source: { ... (item.source || { type: KeysIteratorSourceType.WEBAPI }) },
                tags: !item.tags ? [] : item.tags.slice()
            };
            this.props.cloneItem(clItem);
            this.props.onContinue('/KeysIterator');
        }
    }
    textProvider = () => {
        const { current } = this.state;
        return JSON.stringify(current, null, 2);
    }
    render() {
        const { current, editJSON, modified } = this.state;

        if (current) {
            return (
                <KeysIteratorContentEditor
                    key={current.id}
                    changeState={this.changeState}
                    changeStateJSON={this.changeStateJSON}
                    current={current}
                    onCancel={this.onCancel}
                    onSave={this.onSave}
                    sourceTypeList={this.props.sourceTypeList}
                    cloneItem={this.cloneItem}
                    onRefJsonEditor={(r: JsonEditorGet | null) => this.refJsonEditor = r}
                    editJSON={editJSON}
                    modified={modified}
                />);
        }
        return null;
    }
}

export default conn.connect(KeysIteratorEditor);