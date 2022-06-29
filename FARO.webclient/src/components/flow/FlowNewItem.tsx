import * as React from 'react';
import * as reducers from '../../reducers';
import { appConnector } from 'app-support';
import { FlowModel, ArgumentListImage, ArgumentListWriter, UNIQUE_IMAGE, UNIQUE_WRITER } from '../../actions/model';
import { HeaderMenuWidget, dialogMenuWidget } from '../shared/MenuWidget';
import { Menu, Segment } from 'semantic-ui-react';
import { flowCreate, imageSearch, writerSearch, writerSearchClear, imageSearchClear, deleteCloneItem } from '../../actions';
import { addMessage } from '../../actions/indexMsg';
import { TypeMessage, MessageAction } from '../../actions/modelMsg';


import { FlowItem } from './FlowItem';
import { CopyDoc, searchArgumetListImage, searchArgumetListWriter } from '../Utils';
import { TableEditableWidget } from '../shared/EditableWidget';
import { JsonEditorGet } from '../shared/JsonEditorGet';

const conn = appConnector<{ onExit?: (id: string) => void, onContinue?: (id: string) => void, onEdit?: (id: string) => void }>()(
    (s, p) => ({
        searchImages: reducers.getImageSearch(s, UNIQUE_IMAGE),
        searchWriters: reducers.getWriterSearch(s, UNIQUE_WRITER),
        clone: reducers.getCloneItem(s)
    }),
    {
        flowCreate,
        imageSearch,
        writerSearchClear,
        imageSearchClear,
        writerSearch,
        deleteCloneItem,
        addMessage
    }
);

export interface FlowNewItemState {
    current?: FlowModel;
    editJSON: boolean;
    modified: boolean;
}

class FlowNewItemComp extends conn.StatefulCompo<FlowNewItemState> {
    listenerAdded: boolean = false;

    refJsonEditor: JsonEditorGet | null;

    constructor(props: any) {
        super(props);
        this.state = { current: {}, editJSON: false, modified: false };
    }
    componentWillReceiveProps(nextProps: any): void {
        if (nextProps.clone) {
            this.setState({ ...this.state, modified: true, current: { ...nextProps.clone } });
        }
    }
    componentDidMount() {
        if (window && window.scrollTo) window.scrollTo(0, 0);
        let argumentA: ArgumentListImage = searchArgumetListImage();
        this.props.imageSearch(argumentA);
        let argumentB: ArgumentListWriter = searchArgumetListWriter();
        this.props.writerSearch(argumentB);
    }
    listenerCopy = (json: any) => {
        let newItem: FlowModel = {
            description: json.description ? json.description : undefined,
            image: json.image ? json.image : undefined,
            name: json.name ? json.name : undefined,
            writer: json.writer ? json.writer : undefined,
            validator: json.validator ? json.validator : undefined,
            aggregator: json.aggregator ? json.aggregator : undefined,
            tags: json.tags ? json.tags : undefined
        };

        this.onChange(newItem);
    }


    public componentWillUnmount(): void {
        this.props.deleteCloneItem();
        this.props.imageSearchClear(UNIQUE_IMAGE);
        this.props.writerSearchClear(UNIQUE_WRITER);
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
    validate = (item: FlowModel) => {
        if (item.name === undefined || item.name === null || item.name === '') return 'Name cannot be empty';
        if (item.image === undefined || item.image === null || item.image === '') return 'Image must be not empty';
        // if (item.writer === undefined || item.writer === null || item.writer === '') return 'Writer must be not empty';
        return '';
    }
    callBack = (res: any) => {
        const { onExit, onContinue, onEdit } = this.props;
        // let actions: Array<MessageAction> = [];
        if (onEdit) onEdit(res.id);
        /*
        if (onContinue !== undefined) actions.push({ name: 'New Item', action: () => { onContinue(res.id); } });
        if (onExit !== undefined) actions.push({ name: 'Go to the list', action: () => { onExit(res.id); } });
        if (onEdit !== undefined) actions.push({ name: 'Close', action: () => { onEdit(res.id); } });

        if (res.id !== undefined && (res.id as string).length > 0) {
            this.props.addMessage({
                id: 'saved-flow',
                actions: actions,
                modal: true,
                stackable: false,
                timed: false,
                typeMessage: TypeMessage.Info,
                title: 'Info',
                message: 'Flow created'
            });
        }
        */
    }
    internalSave = (item: any) => {
        if (this.props.flowCreate) {
            let message: string = this.validate(item);
            if (message.length === 0) {
                let prms = { flowItem: item, call: this.callBack };
                this.props.flowCreate(prms);
            } else {
                this.props.addMessage({
                    id: 'save-flow',
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
    getJSON = () => {
        if (this.refJsonEditor) {
            return this.refJsonEditor.getJson();
        }
        return null;
    }
    onSave = () => {
        const { current, editJSON } = this.state;
        if (editJSON) {
            let json: any = this.getJSON();
            if (json !== null) {
                this.internalSave(json);
            }
        } else if (!editJSON) {
            let item: FlowModel = { ...current };
            this.internalSave(item);
        }
    }

    onCancel = () => {
        this.props.deleteCloneItem();
        this.setState({ ...this.state, current: {}, modified: false });
    }

    onChange = (item: FlowModel) => {
        this.setState({ ...this.state, modified: true, current: item });
    }

    changeStateJSON = () => {
        const { modified } = this.state;
        let newState: any = {};
        newState.modified = modified;
        newState.editJSON = !this.state.editJSON;
        if (modified) {
            let json: any = this.getJSON();
            if (json) {
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
                image: '',
                validator: '',
                writer: '',
            } as FlowModel;

        let styleJS: React.CSSProperties = {
            backgroundColor: this.state.editJSON ? 'green' : 'white'
        };

        return (
            <React.Fragment>

                <HeaderMenuWidget header={'Flow New Item'} icon="file outline" >
                    <Menu.Item style={styleJS} content={'JSON'} icon={'file alternate outline'} onClick={() => this.changeStateJSON()} />
                    {modified && dialogMenuWidget(modified, 'Save', this.onSave, 'save', 'Are you sure you want to save the changes?', { color: 'green' })}
                    {modified && dialogMenuWidget(modified, 'Cancel', this.onCancel, 'reply', 'Are you sure you want to loose your changes?')}
                </HeaderMenuWidget>

                {<Segment>
                    {!editJSON && <FlowItem
                        searchImages={this.props.searchImages}
                        searchWriters={this.props.searchWriters}
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


                </Segment>}
            </React.Fragment >

        );
    }

}

export const FlowNewItem = conn.connect(FlowNewItemComp);

