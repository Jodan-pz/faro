import * as React from 'react';
import * as reducers from '../../reducers';
import { appConnector } from 'app-support';
import { KeysIteratorModel, KeysIteratorSourceType } from '../../actions/model';
import { keysIteratorCreate, deleteCloneItem, registeredEngines } from '../../actions';
import { addMessage } from '../../actions/indexMsg';
import { TypeMessage } from '../../actions/modelMsg';
import { CopyDoc } from '../Utils';
import { JsonEditorGet } from '../shared/JsonEditorGet';
import { KeysIteratorContentEditor } from './KeysIteratorContentEditor';

const conn = appConnector<{ onExit?: (id: string) => void, onContinue?: (id: string) => void, onEdit?: (id: string) => void }>()(
    (s, p) => ({
        clone: reducers.getCloneItem(s),
        sourceTypeList: reducers.getKeysIteratorEngines(s)
    }),
    {
        keysIteratorCreate,
        deleteCloneItem,
        addMessage,
        registeredEngines
    }
);

export interface KeysIteratorNewItemState {
    current?: KeysIteratorModel;
    editJSON: boolean;
    modified: boolean;
}

class KeysIteratorNewItemComp extends conn.StatefulCompo<KeysIteratorNewItemState> {
    args: { [type: number]: any } = {};
    oldtype: any;
    refJsonEditor: JsonEditorGet | null;
    listenerAdded: boolean = false;
    constructor(props: any) {
        super(props);
        this.state = { current: undefined, editJSON: false, modified: false };
    }
    receiveClone = (clone: any) => {
        if (clone) {
            let currType = clone.source && clone.source.type;
            this.oldtype = currType;
            this.args[currType] = { ...(clone.source && clone.source.args) };
        }
    }
    componentDidMount() {
        if (window && window.scrollTo) window.scrollTo(0, 0);
        this.props.registeredEngines();
    }

    componentDidUpdate(prevProps: any, prevState: KeysIteratorNewItemState): void {
        const { editJSON } = this.state;
        if (!editJSON && !this.listenerAdded) {
            this.listenerAdded = true;
            CopyDoc.addListener(this.listenerCopy);
        } else if (!editJSON && this.listenerAdded) {
            this.listenerAdded = false;
            CopyDoc.removeListener();
        }
        // solo una volta se this.state.current è undefined
        if (this.state.current === undefined || this.state.current === null && this.props.clone) {
            this.receiveClone(this.props.clone);
            this.setState({ ...this.state, modified: true, current: { ...this.props.clone } });
        }
    }
    listenerCopy = (json: any) => {
        var keyIt: KeysIteratorModel = {
            args: json.args,
            description: json.description,
            fields: json.fields,
            filter: json.filter,
            name: json.name,
            tags: json.tags,
            when: json.when,
            source: json.source
        };

        if (this.args === undefined) this.args = {};
        if (json.source.type !== undefined && this.args[json.source.type] === undefined) {
            this.args[json.source.type] = { ...json.source.args };
        }
        this.setState({ current: keyIt, modified: true });
    }
    public componentWillUnmount(): void {
        this.props.deleteCloneItem();
        CopyDoc.removeListener();
    }


    validate = (item: KeysIteratorModel) => {
        if (item.name === undefined || item.name === null || item.name === '') return 'Name cannot be empty';
        if (item.source === undefined
            || item.source === null
            || item.source.type === undefined
            || item.source.type === null) return 'Type source must be not empty';
        return '';
    }
    callBack = (res: any) => {
        const { onExit, onContinue, onEdit } = this.props;
        if (onEdit) onEdit(res.id);
    }
    getJSON = () => {
        if (this.refJsonEditor) {
            return this.refJsonEditor.getJson();
        }
        return null;
    }
    internalSave = (item: any) => {
        if (this.props.keysIteratorCreate) {
            let message: string = this.validate(item);
            if (message.length === 0) {
                let prms = { keysIterator: item, call: this.callBack };
                this.props.keysIteratorCreate(prms);
            } else {
                this.props.addMessage({
                    id: 'save-keysIterator',
                    modal: false,
                    stackable: false,
                    timed: false,
                    typeMessage: TypeMessage.Warning,
                    title: 'Warning',
                    message: message
                });
            }
        }
    }

    onSave = () => {
        const { current, editJSON } = this.state;
        this.internalSave(editJSON ? this.getJSON() : current);
    }
    onCancel = () => {
        const { current } = this.state;
        this.args = {};
        this.oldtype = undefined;
        let currType = current && current.source && current.source.type;
        if (currType !== undefined)
            this.args[currType] = { ...(current && current.source && current.source.args) };

        this.props.deleteCloneItem();
        this.setState({ ...this.state, current: {}, modified: false });
    }
    updateCurrType = (newItem: any) => {
        let currType = newItem.source && newItem.source.type;
        if (currType !== undefined) {
            if (this.oldtype !== currType) {
                this.oldtype = currType;
                if (this.args[currType] === undefined) {
                    this.args[currType] = {};
                }
            }
            if (newItem.source && newItem.source.args) {
                this.args[currType] = { ...(newItem.source && newItem.source.args) };
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
    render() {
        const { modified, current, editJSON } = this.state;
        const currentItem = current
            ? { ...current }
            : {
                name: '',
                description: '',
                args: [],
                fields: [],
                source: { type: KeysIteratorSourceType.WEBAPI, args: {} }
            } as KeysIteratorModel;



        return (
            <KeysIteratorContentEditor
                changeState={this.changeState}
                changeStateJSON={this.changeStateJSON}
                current={current}
                onCancel={this.onCancel}
                onSave={this.onSave}
                sourceTypeList={this.props.sourceTypeList}
                onRefJsonEditor={(r: JsonEditorGet | null) => this.refJsonEditor = r}
                editJSON={editJSON}
                modified={modified}
            />);
    }

}

export const KeysIteratorNewItem = conn.connect(KeysIteratorNewItemComp);

