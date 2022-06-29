import * as React from 'react';
import { appConnector } from 'app-support';
import { Menu, Segment } from 'semantic-ui-react';
import * as reducers from '../../reducers';
import { WriterModel, WriterEngineKind } from '../../actions/model';
import { HeaderMenuWidget, dialogMenuWidget } from '../shared/MenuWidget';
import { writerCreate, deleteCloneItem, registeredEngines } from '../../actions';
import { addMessage } from '../../actions/indexMsg';
import { TypeMessage } from '../../actions/modelMsg';
import { WriterItem } from './WriterItem';
import { CopyDoc } from '../Utils';
import { JsonEditorGet } from '../shared/JsonEditorGet';
import { TableEditableWidget } from '../shared/EditableWidget';

export interface WriterNewItemProps {
    onExit?: (id: string) => void;
    onContinue?: (id: string) => void;
    onEdit?: (id: string) => void;
}
export interface WriterNewItemState {
    current?: WriterModel;
    editJSON: boolean;
    modified: boolean;
}
const conn = appConnector<WriterNewItemProps>()(
    (s, p) => ({
        clone: reducers.getCloneItem(s),
        writerEngineKindList: reducers.getWriterEngines(s)
    }),
    {
        writerCreate,
        deleteCloneItem,
        addMessage,
        registeredEngines
    }
);



class WriterNewItemComp extends conn.StatefulCompo<WriterNewItemState> {
    config: { [kind: number]: any };
    oldkind: string | undefined;
    refJsonEditor: JsonEditorGet | null;
    listenerAdded: boolean = false;
    constructor(props: any) {
        super(props);
        this.config = {};
        let copy: WriterModel | undefined = this.copyFrom(props.clone);
        this.receiveClone(copy);
        this.state = { current: copy ? copy : { kind: WriterEngineKind.CONSOLE }, editJSON: false, modified: !(copy === undefined || copy === null) };
    }
    receiveClone = (clone: any) => {
        if (clone) {
            let kind: string = clone.kind || '';
            this.oldkind = kind;
            let value: any = clone.config && clone.config.value;
            this.config[kind] = { ...value };
        }
    }
    copyFrom = (curr: WriterModel) => {
        if (curr === null || curr === undefined) return undefined;
        let copy: WriterModel = { ...curr };
        let config: any = { ...curr.config };
        config.value = { ...(config && config.value || {}) };
        copy.config = config;
        return copy;
    }

    listenerCopy = (json: any) => {

        var keyIt: WriterModel = {
            tags: json.tags ? json.tags : undefined,
            description: json.description ? json.description : undefined,
            args: json.args ? json.args : undefined,
            name: json.name ? json.name : undefined,
            config: json.config ? json.config : undefined,
            kind: json.kind ? json.kind : undefined,
        };

        if (this.config === undefined) this.config = {};
        if (json.kind !== undefined && this.config[json.kind] === undefined) {
            this.config[json.kind] = { ...json.config.value };
        }
        this.setState({ current: keyIt, modified: true });


    }

    componentWillReceiveProps(nextProps: any): void {
        if (nextProps.clone) {
            let copy: WriterModel | undefined = this.copyFrom(nextProps.clone);
            if (copy) this.receiveClone(copy);
            this.setState({ ...this.state, modified: true, current: copy });
        }
    }
    public componentDidMount(): void {
        this.props.registeredEngines();
    }
    public componentWillUnmount(): void {
        this.props.deleteCloneItem();
        CopyDoc.removeListener();
    }

    public componentDidUpdate(): void {
        const { editJSON } = this.state;
        if (!editJSON && !this.listenerAdded) {
            this.listenerAdded = true;
            CopyDoc.addListener(this.listenerCopy);
        } else if (!editJSON && this.listenerAdded) {
            this.listenerAdded = false;
            CopyDoc.removeListener();
        }
    }
    getJSON = () => {
        if (this.refJsonEditor) {
            return this.refJsonEditor.getJson();
        }
        return null;
    }
    updateCurrType = (newItem: any) => {
        let kind: string = newItem.kind || '';
        if (kind !== undefined) {
            if (this.oldkind !== kind) {
                this.oldkind = kind;
                if (this.config[kind] === undefined) {
                    this.config[kind] = {};
                }
            } else {
                let conf: any = newItem.config;
                let value: any = conf && conf.value && conf.value || {};
                this.config[kind] = { ...value };
            }
            if (newItem.config && newItem.config.value) {
                newItem.config.value = this.config[kind];
            }
        }
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
    validate = (item: WriterModel) => {
        if (item.name === undefined) return 'Name cannot be empty';
        return '';
    }

    callBack = (res: any) => {
        const { onExit, onContinue, onEdit } = this.props;
        if (onEdit) onEdit(res.id);
    }

    internalSave = (item: any) => {
        if (this.props.writerCreate) {
            let message: string = this.validate(item);
            if (message.length === 0) {
                let prms = { writer: item, call: this.callBack };
                this.props.writerCreate(prms);
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
        if (editJSON) {
            let json: any = this.getJSON();
            if (json) {
                this.internalSave({ ...json, kind: json && json.kind ? json.kind : WriterEngineKind.CONSOLE });
            }
        } else if (current) {
            this.internalSave({ ...current, kind: current && current.kind ? current.kind : WriterEngineKind.CONSOLE });
        }
    }

    onCancel = () => {
        this.props.deleteCloneItem();
        let copy: WriterModel | undefined = this.copyFrom(this.props.clone as WriterModel);
        this.config = {};
        let kind: string | undefined = undefined;
        this.oldkind = kind;
        this.setState({ ...this.state, current: { kind: WriterEngineKind.CONSOLE }, modified: false });
    }

    onChange = (newItem: WriterModel) => {
        this.updateCurrType(newItem);
        this.setState({ ...this.state, modified: true, current: newItem });
    }

    render() {
        const { modified, current, editJSON } = this.state;
        const currentItem = current
            ? { ...current }
            : {
                name: '',
                description: '',
                kind: WriterEngineKind.CONSOLE,
                args: [],
                config: {}
            } as WriterModel;

        let styleJS: React.CSSProperties = {
            backgroundColor: this.state.editJSON ? 'green' : 'white'
        };

        return (
            <React.Fragment>
                <HeaderMenuWidget header={'Writer New Item'} icon="file outline" >
                    <Menu.Item style={styleJS} content={'JSON'} icon={'file alternate outline'} onClick={() => this.changeStateJSON()} />
                    {modified && dialogMenuWidget(modified, 'Save', this.onSave, 'save', 'Are you sure you want to save the changes?', { color: 'green' })}
                    {modified && dialogMenuWidget(modified, 'Cancel', this.onCancel, 'reply', 'Are you sure you want to loose your changes?')}
                </HeaderMenuWidget>
                <Segment>
                    {!editJSON &&
                        <WriterItem
                            writerEngineKindList={this.props.writerEngineKindList}
                            item={currentItem}
                            editJSON={editJSON}
                            disabled={false}
                            onChange={this.onChange}
                        />}
                    {editJSON &&
                        <TableEditableWidget edit={false}>
                            <JsonEditorGet
                                newitem={!modified}
                                item={currentItem}
                                ref={r => this.refJsonEditor = r}
                                onModified={(modified: boolean) => this.setState({ ...this.state, modified: modified })}
                            />
                        </TableEditableWidget>
                    }
                </Segment>
            </React.Fragment >
        );
    }

}

export const WriterNewItem = conn.connect(WriterNewItemComp);

