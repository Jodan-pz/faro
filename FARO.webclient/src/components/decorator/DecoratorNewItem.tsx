import * as React from 'react';
import * as reducers from '../../reducers';
import { appConnector } from 'app-support';
import { DecoratorModel, DecoratorSourceType } from '../../actions/model';
import { HeaderMenuWidget, dialogMenuWidget } from '../shared/MenuWidget';
import { Menu, Segment } from 'semantic-ui-react';
import { decoratorCreate, deleteCloneItem, registeredEngines } from '../../actions';
import { addMessage } from '../../actions/indexMsg';
import { TypeMessage, MessageAction } from '../../actions/modelMsg';
import { DecoratorItem } from './DecoratorItem';
import { CopyDoc } from '../Utils';
import { JsonEditorGet } from '../shared/JsonEditorGet';
import { TableEditableWidget } from '../shared/EditableWidget';
import { DecoratorContentEditor } from './DecoratorContentEditor';

const conn = appConnector<{ onExit?: (id: string) => void, onContinue?: (id: string) => void, onEdit?: (id: string) => void }>()(
    (s, p) => ({
        clone: reducers.getCloneItem(s),
        sourceTypeList: reducers.getDecoratorEngines(s)
    }),
    {
        decoratorCreate,
        deleteCloneItem,
        addMessage,
        registeredEngines
    }
);

export interface DecoratorNewItemState {
    current?: DecoratorModel;
    editJSON: boolean;
    modified: boolean;
}

class DecoratorNewItemComp extends conn.StatefulCompo<DecoratorNewItemState> {
    args: { [type: number]: any } = {};
    oldtype: any;
    refJsonEditor: JsonEditorGet | null;
    listenerAdded: boolean = false;

    constructor(props: any) {
        super(props);
        this.receiveClone(props.clone);
        this.state = { current: props.clone || {}, editJSON: false, modified: !(props.clone === null) };
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

    componentDidUpdate(prevProps: any, prevState: DecoratorNewItemState): void {
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
        let newItem: DecoratorModel = {
            tags: json.tags ? json.tags : undefined,
            when: json.when ? json.when : undefined,
            args: json.args ? json.args : undefined,
            description: json.description ? json.description : undefined,
            fields: json.fields ? json.fields : undefined,
            name: json.name ? json.name : undefined,
            source: json.source ? json.source : undefined
        };

        if (this.args === undefined) this.args = {};
        if (json.source.type !== undefined && this.args[json.source.type] === undefined) {
            this.args[json.source.type] = { ...json.source.args };
        }
        this.setState({ current: newItem, modified: true });


    }
    public componentWillUnmount(): void {
        this.props.deleteCloneItem();
        CopyDoc.removeListener();
    }



    validate = (item: DecoratorModel) => {
        if (item.name === undefined || item.name === null || item.name === '') return 'Name cannot be empty';
        if (item.source === undefined
            || item.source === null
            || item.source.type === undefined
            || item.source.type === null) return 'Type source must be not empty';

        return '';
    }
    callBack = (res: any) => {
        const { onEdit } = this.props;
        if (onEdit) onEdit(res.id);
    }

    internalSave = (item: any) => {
        if (this.props.decoratorCreate) {
            let message: string = this.validate(item);
            if (message.length === 0) {
                let prms = { decorator: item, call: this.callBack };
                this.props.decoratorCreate(prms);
            } else {
                this.props.addMessage({
                    id: 'save-decorator',
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
            } else {
                this.args[currType] = { ...(newItem.source && newItem.source.args) };
            }
            if (newItem.source && newItem.source.args) {
                newItem.source.args = this.args[currType];
            }
        }
    }

    changeState = (newItem: DecoratorModel, modified: boolean = true) => {
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
    render() {
        const { modified, current, editJSON } = this.state;
        const currentItem = current
            ? { ...current }
            : {
                name: '',
                description: '',
                args: [],
                fields: [],
                source: { type: DecoratorSourceType.WEBAPI, args: {} }
            } as DecoratorModel;

        return (
            <DecoratorContentEditor
                changeState={this.changeState}
                changeStateJSON={this.changeStateJSON}
                current={currentItem}
                editJSON={editJSON}
                modified={modified}
                onCancel={this.onCancel}
                onSave={this.onSave}
                onRefJsonEditor={(r: JsonEditorGet | null) => this.refJsonEditor = r}
                sourceTypeList={this.props.sourceTypeList}
            />
        );
    }

}

export const DecoratorNewItem = conn.connect(DecoratorNewItemComp);

