import * as React from 'react';
import { appConnector, Link } from 'app-support';
import { Segment, Menu } from 'semantic-ui-react';
import * as reducers from '../../reducers';
import { writerGet, writerUpdate, writerClear, cloneItem, registeredEngines } from '../../actions';
import { WriterModel } from '../../actions/model';
import { HeaderMenuWidget, dialogMenuWidget } from '../shared/MenuWidget';
import { WriterItem } from './WriterItem';
import { ConfirmWidget } from '../shared/DialogWidget';
import { JsonEditorGet } from '../shared/JsonEditorGet';
import { TableEditableWidget } from '../shared/EditableWidget';
import { Copy } from '../shared/Copy';


const conn = appConnector<{ id: string, onContinue?: (where: string) => void }>()(
    (s, p) => ({
        current: reducers.getWriter(s, p.id),
        writerEngineKindList: reducers.getWriterEngines(s)
    }),
    {
        writerGet,
        writerClear,
        writerUpdate,
        cloneItem,
        registeredEngines
    }
);

export interface WriterEditorState {
    currentstate?: WriterModel;
    editJSON: boolean;
    modified: boolean;
}

class WriterEditor extends conn.StatefulCompo<WriterEditorState> {
    config: { [kind: number]: any };
    oldkind: any;
    refJsonEditor: JsonEditorGet | null;
    constructor(props: any) {
        super(props);
        this.config = {};
        let copy: WriterModel | undefined = this.copyFrom(props.current);
        this.state = { currentstate: copy, editJSON: false, modified: false };
    }
    copyFrom = (curr: WriterModel) => {
        if (curr === undefined) return undefined;
        let copy: WriterModel = { ...curr };
        let config: any = { ...curr.config };
        // config.isCopy = true;
        config.value = { ...(config && config.value || {}) };
        copy.config = config;
        return copy;
    }

     
    componentDidUpdate(prevProps: any, prevState: WriterEditorState ): void {
         // solo una volta se this.state.current è undefined
        if (this.state.currentstate === undefined && this.props.current) {
            let copy: WriterModel | undefined = this.copyFrom(this.props.current);
            if (copy) {
                let kind: string = copy.kind || '';
                this.oldkind = kind;
                let value: any = copy.config && copy.config.value;
                this.config[kind] = { ...value };
            }
            this.setState({ ...this.state, currentstate: copy, modified: false });
        }
    }
    componentDidMount() {
        this.props.registeredEngines();
        this.props.writerGet(this.props.id);
    }
    componentWillUnmount(): void {
        this.props.writerClear(this.props.id);
    }
    updateCurrType = (newItem: any) => {
        let kind: string = newItem.kind || '';
        let conf: any = newItem.config;
        let value: any = conf && conf.value && conf.value || {};
        if (this.oldkind !== kind) {
            this.oldkind = kind;
            if (this.config[kind] === undefined) {
                this.config[kind] = {};
            }
        }  

        if (newItem.config && newItem.config.value) {
            this.config[kind] = { ...value };
        }
    }
    changeState = (newItem: WriterModel, modified: boolean = true) => {
        this.updateCurrType(newItem);
        this.setState({ ...this.state, currentstate: newItem, modified });
    }
    getJSON = () => {
        if (this.refJsonEditor) {
            return this.refJsonEditor.getJson();
        }
        return null;
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
                newState.currentstate = json;
            }
        }
        this.setState({ ...this.state, ...newState });
    }

    onEdit = () => this.setState({ ...this.state, modified: false });

    onCancel = () => {

        let copy: WriterModel | undefined = this.copyFrom(this.props.current as WriterModel);
        this.config = {};
        let kind: string | undefined = undefined;
        if (copy) {
            kind = copy.kind;
            if (kind !== undefined)
                this.config[kind] = { ...(copy.config && copy.config.value || {}) };
        }
        this.oldkind = kind;
        this.setState({ ...this.state, currentstate: copy, modified: false });
    }

    internalSave = (item: any) => {
        if (item) {
            if (this.props.writerUpdate) {
                this.props.writerUpdate(item);
            }
            this.setState({ ...this.state, modified: false });
        }
    }
    onSave = () => {
        const { currentstate, editJSON } = this.state;
        this.internalSave(editJSON ? this.getJSON() : currentstate);
    }

    cloneItem = () => {
        const { current } = this.props;
        if (this.props.cloneItem && this.props.onContinue) {
            let item: WriterModel = current as WriterModel;
            let clItem: WriterModel = {
                name: 'Clone of ' + item.name,
                description: item.description,
                args: item.args,
                kind: item.kind,
                config: item.config,
                tags: [...(item.tags || [])]
            };
            this.props.cloneItem(clItem);
            this.props.onContinue('/Writers');
        }
    }
    render() {
        const { currentstate, editJSON, modified } = this.state;

        if (currentstate) {
            let styleJS: React.CSSProperties = {
                backgroundColor: editJSON ? 'green' : 'white'
            };
            
            return (
                <React.Fragment>

                    <HeaderMenuWidget modified={modified} header="WRITERS" icon="edit" disabled={false}>
                        {!modified && <Menu.Item > 
                            <Copy 
                                button={{ color: 'green' }} 
                                textProvider={() => {
                                    const { currentstate } = this.state;
                                    return JSON.stringify(currentstate, null, 2);
                                }} 
                            />
                        </Menu.Item>}

                        {modified && dialogMenuWidget(modified, 'Save', this.onSave, 'save', 'Are you sure you want to save the changes?', { color: 'green' })}
                        {modified && dialogMenuWidget(modified, 'Cancel', () => this.onCancel(), 'reply', 'Are you sure you want to loose your changes?')}
                        {!modified && <Menu.Item as={Link} to={`/Writers/new`} icon="plus" content="New" />}
                        
                        {!modified &&
                            <ConfirmWidget
                                children={`Are you sure you want to clone ${currentstate.name} item?`}
                                onConfirm={() => this.cloneItem()}
                                trigger={<Menu.Item icon="clone outline" content="Clone" />}
                            />}

                        {!modified && <Menu.Item as={Link} to={`/Writers/Usage/${currentstate.id}`} icon="linkify" content="Usage" />}
                        <Menu.Item content={'JSON'} icon={'file alternate outline'} onClick={() => this.changeStateJSON()} style={styleJS} />
                    </HeaderMenuWidget>

                    <Segment>
                        {!editJSON &&
                            <WriterItem
                                writerEngineKindList={this.props.writerEngineKindList}
                                item={currentstate}
                                editJSON={editJSON}
                                disabled={false}
                                onChange={this.changeState}
                            />}

                        {editJSON &&
                            <TableEditableWidget edit={false}>
                                <JsonEditorGet 
                                    newitem={!modified} 
                                    item={currentstate} 
                                    ref={r => this.refJsonEditor = r} 
                                    onModified={(modified: boolean) => this.setState({ ...this.state, modified: modified })} 
                                />
                            </TableEditableWidget>
                        }


                    </Segment>
                </React.Fragment >
            );
        }

        return null;
    }
}

export default conn.connect(WriterEditor);