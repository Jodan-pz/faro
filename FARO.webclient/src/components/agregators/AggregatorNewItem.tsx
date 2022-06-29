import * as React from 'react';
import * as reducers from '../../reducers';
import { appConnector } from 'app-support';
import { AggregatorModel, AggregatorEngineKind } from '../../actions/model';
import { HeaderMenuWidget, dialogMenuWidget } from '../shared/MenuWidget';
import { Menu, Segment } from 'semantic-ui-react';
import { aggregatorCreate, registeredEngines } from '../../actions';
import { addMessage } from '../../actions/indexMsg';
import { TypeMessage } from '../../actions/modelMsg';
import { AggregatorItem } from './AggregatorItem';
import { CopyDoc } from '../Utils';
import { AggregatorModalImageList } from './AggregatorModalImageList';
import { JsonEditorGet } from '../shared/JsonEditorGet';
import { TableEditableWidget } from '../shared/EditableWidget';

interface AggregatorNewItemProps {

    onChange?: (item: AggregatorModel) => void;
    onExit?: (id: string) => void;
    onContinue?: (id: string) => void;
    onEdit?: (id: string) => void;
}


const conn = appConnector<AggregatorNewItemProps>()(
    (s) => ({
        aggregatorKindList: reducers.getAggregatorEngines(s)
    }),
    {
        aggregatorCreate,
        addMessage,
        registeredEngines
    }
);

export interface AggregatorNewItemState {
    image?: { id: string, name: string };
    current?: AggregatorModel;
    editJSON: boolean;
    modified: boolean;
}

class AggregatorNewItemComp extends conn.StatefulCompo<AggregatorNewItemState> {
    listenerAdded: boolean = false;
    config: { [kind: number]: any };
    oldkind: any;
    refJsonEditor: JsonEditorGet | null;
    constructor(props: any) {
        super(props);
        this.config = {};
        let copy: AggregatorModel | undefined = this.copyFrom(props.current);
        this.state = { current: copy ? copy : { kind: AggregatorEngineKind.DEFAULT }, editJSON: false, modified: !(copy === undefined || copy === null) };
    }
    copyFrom = (curr: AggregatorModel) => {
        if (curr === null || curr === undefined) return undefined;
        let copy: AggregatorModel = { ...curr };
        let config: any = { ...curr.config };
        config.value = { ...(config && config.value || {}) };
        copy.config = config;
        return copy;
    }
    listenerCopy = (json: any) => {
        let newItem: AggregatorModel = {
            image: json.image ? json.image : undefined,
            description: json.description ? json.description : undefined,
            name: json.name ? json.name : undefined,
            tags: json.tags ? json.tags : undefined,
            config: json.config ? json.config : undefined,
            kind: json.kind ? json.kind : undefined,
        };
        this.onChange(newItem);
    }
    public componentDidMount() {
        if (window && window.scrollTo) window.scrollTo(0, 0);
        this.props.registeredEngines();
    }
    public componentWillUnmount(): void {
        CopyDoc.removeListener();
    }

    public componentDidUpdate(): void {
        const { editJSON } = this.state;
        if (editJSON && !this.listenerAdded) {
            this.listenerAdded = true;
            CopyDoc.addListener(this.listenerCopy);
        } else if (!editJSON && this.listenerAdded) {
            this.listenerAdded = false;
            CopyDoc.removeListener();
        }
    }

    validate = (item: AggregatorModel) => {
        if (item.name === undefined) return 'Name cannot be empty';
        return '';
    }
    callBack = (res: any) => {
        const { onExit, onContinue, onEdit } = this.props;
        if (onEdit) onEdit(res.id);
    }
    internalSave = (itemS: any) => {
        const { image } = this.state;
        if (this.props.aggregatorCreate) {
            let item: AggregatorModel = { ...(itemS as AggregatorModel) };
            item.image = image && image.id ? image.id : '';
            let message: string = this.validate(item);
            if (message.length === 0) {
                let prms = { aggregator: item, call: this.callBack };
                this.props.aggregatorCreate(prms);
            } else {
                this.props.addMessage({
                    id: 'save-aggregator',
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
                this.internalSave(json);
            }
        } else if (current) {
            this.internalSave(current);
        }
    }
    onCancel = () => {
        this.config = {};
        let kind: AggregatorEngineKind | undefined = undefined;
        this.oldkind = kind;
        this.setState({ ...this.state, current: { kind: AggregatorEngineKind.DEFAULT }, modified: false });
    }
    updateCurrType = (newItem: any) => {
        let kind: string = newItem.kind;
        let conf: any = newItem.config;
        let value: any = conf && conf.value && conf.value || {};
        if (this.oldkind !== kind) {
            this.oldkind = kind;
            if (this.config[kind] === undefined) {
                this.config[kind] = {};
            }
        } else {
            this.config[kind] = { ...value };
        }
        if (newItem.config && newItem.config.value) {
            newItem.config.value = this.config[kind];
        }
        if (this.props.onChange) {
            this.props.onChange(newItem);
        }
    }
    onChange = (newItem: AggregatorModel) => {
        this.updateCurrType(newItem);
        this.setState({ ...this.state, modified: true, current: newItem });
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
        const { modified, current, editJSON, image } = this.state;

        if (image === undefined) {
            return (
                <AggregatorModalImageList
                    onCloseModal={() => {
                        if (this.props.onExit) {
                            this.props.onExit('');
                        }
                    }}
                    onSelectImage={(image: any) => this.setState({ ...this.state, image })}
                />);
        } else {

            const currentItem = current
                ? { ...current }
                : {
                    name: '',
                    id: undefined,
                    description: undefined,
                    tags: [],
                    kind: AggregatorEngineKind.DEFAULT,
                    config: undefined,
                    image: image.id
                } as AggregatorModel;

            let styleJS: React.CSSProperties = {
                backgroundColor: this.state.editJSON ? 'green' : 'white'
            };


            return (
                <React.Fragment>

                    <HeaderMenuWidget header={'Aggregator New Item for Image: ' + image.name} icon={'file outline'} >
                        <Menu.Item style={styleJS} content={'JSON'} icon={'file alternate outline'} onClick={() => this.changeStateJSON()} />
                        {modified && dialogMenuWidget(modified, 'Save', this.onSave, 'save', 'Are you sure you want to save the changes?', { color: 'green' })}
                        {modified && dialogMenuWidget(modified, 'Cancel', this.onCancel, 'reply', 'Are you sure you want to loose your changes?')}
                    </HeaderMenuWidget>

                    <Segment>

                        {!editJSON &&
                            <AggregatorItem
                                aggregatorKindList={this.props.aggregatorKindList}
                                freezeName={false}
                                item={currentItem}
                                editJSON={editJSON}
                                disabled={false}
                                onChange={this.onChange}
                            />}

                        {editJSON &&
                            <TableEditableWidget edit={false}>
                                <JsonEditorGet newitem={!modified} item={currentItem} ref={r => this.refJsonEditor = r} onModified={(modified: boolean) => this.setState({ ...this.state, modified: modified })} />
                            </TableEditableWidget>
                        }

                    </Segment>
                </React.Fragment >
            );
        }
        return null;
    }
}

export const AggregatorNewItem = conn.connect(AggregatorNewItemComp);







