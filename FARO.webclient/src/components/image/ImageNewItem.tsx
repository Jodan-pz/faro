import * as React from 'react';
import * as reducers from '../../reducers';
import { appConnector } from 'app-support';
import { ImageModel, ArgumentListDecorator, ArgumentListKeysIterator, UNIQUE_KEYSITERATOR, UNIQUE_DECORATOR } from '../../actions/model';
import { HeaderMenuWidget, dialogMenuWidget } from '../shared/MenuWidget';
import { Menu, Segment } from 'semantic-ui-react';
import { imageCreate, decoratorClear, keysIteratorClear, keysIteratorSearch, decoratorSearch, deleteCloneItem } from '../../actions';
import { addMessage } from '../../actions/indexMsg';
import { ImageItem } from './ImageItem';
import { TypeMessage } from '../../actions/modelMsg';
import { CopyDoc, searchArgumetListDecorator, searchArgumetListKeysIterator } from '../Utils';
import { TableEditableWidget } from '../shared/EditableWidget';
import { JsonEditorGet } from '../shared/JsonEditorGet';


const conn = appConnector<{ onExit?: (id: string) => void, onContinue?: (id: string) => void, onClose?: (id: string) => void, onEdit?: (id: string) => void }>()(
    (s, p) => ({
        searchKeys: reducers.getKeysIteratorSearch(s, UNIQUE_KEYSITERATOR),
        searchDecorators: reducers.getDecorators(s, UNIQUE_DECORATOR),
        clone: reducers.getCloneItem(s)
    }),
    {
        decoratorSearch,
        keysIteratorSearch,
        imageCreate,
        decoratorClear,
        keysIteratorClear,
        deleteCloneItem,
        addMessage
    }
);

export interface ImageNewItemState {
    current?: ImageModel;
    editJSON: boolean;
    modified: boolean;
}

class ImageNewItemComp extends conn.StatefulCompo<ImageNewItemState> {
    listenerAdded: boolean = false;

    refJsonEditor: JsonEditorGet | null;

    constructor(props: any) {
        super(props);
        this.state = { current: props.clone || {}, editJSON: false, modified: !(props.clone === null) };
    }

    componentWillReceiveProps(nextProps: any): void {
        if (nextProps.clone) {
            this.setState({ ...this.state, modified: true, current: { ...nextProps.clone } });
        }
    }


    componentDidMount() {
        if (window && window.scrollTo) window.scrollTo(0, 0);
        let argumentK: ArgumentListKeysIterator = searchArgumetListKeysIterator();
        this.props.keysIteratorSearch(argumentK);
        let argumentD: ArgumentListDecorator = searchArgumetListDecorator();
        this.props.decoratorSearch(argumentD);
    }

    listenerCopy = (json: any) => {
        let newItem: ImageModel = {
            description: json.description ? json.description : undefined,
            keys: json.keys ? json.keys : undefined,
            name: json.name ? json.name : undefined,
            layers: json.layers ? json.layers : undefined,
            tags: json.tags ? json.tags : undefined,
        };
        this.onChange(newItem);
    }
    public componentWillUnmount(): void {
        this.props.deleteCloneItem();
        this.props.decoratorClear(UNIQUE_DECORATOR);
        this.props.keysIteratorClear(UNIQUE_KEYSITERATOR);
        CopyDoc.removeListener();
    }

    public componentDidUpdate(): void {
        const { editJSON } = this.state;
        if (!editJSON && !this.listenerAdded) {
            this.listenerAdded = true;
            CopyDoc.addListener(this.listenerCopy);
        } else if (editJSON && this.listenerAdded) {
            this.listenerAdded = false;
            CopyDoc.removeListener();
        }
    }
    validate = (item: ImageModel) => {
        if (item.name === undefined || item.name === null || item.name === '') return 'Name cannot be empty';
        if (item.keys === undefined || item.keys === null || item.keys.length === 0) return 'Keys must be not empty';
        return '';
    }
    callBack = (res: any) => {
        const { onExit, onContinue, onEdit } = this.props;
        if (onEdit) onEdit(res.id);
        /*
        let actions: Array<MessageAction> = [];
        if (onContinue !== undefined) actions.push({ name: 'New Item', action: () => { onContinue(res.id); } });
        if (onExit !== undefined) actions.push({ name: 'Go to the list', action: () => { onExit(res.id); } });
        if (onEdit !== undefined) actions.push({ name: 'Close', action: () => { onEdit(res.id); } });

        if (res.id !== undefined && (res.id as string).length > 0) {
            this.props.addMessage({
                id: 'saved-image',
                actions: actions,
                modal: true,
                stackable: false,
                timed: false,
                typeMessage: TypeMessage.Info,
                title: 'Info',
                message: 'Image created'
            });
        }
        */
    }
    getJSON = () => {
        if (this.refJsonEditor) {
            return this.refJsonEditor.getJson();
        }
        return null;
    }

    internalSave = (item: any) => {
        if (this.props.imageCreate) {
            let message: string = this.validate(item);
            if (message.length === 0) {
                let prms = { image: item, call: this.callBack };
                this.props.imageCreate(prms);
            } else {
                this.props.addMessage({
                    id: 'save-image',
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
    onCancel = () => {
        this.props.deleteCloneItem();
        this.setState({ ...this.state, current: {}, modified: false });
    }

    onChange = (item: ImageModel) => {
        this.setState({ ...this.state, modified: true, current: { ...item } });
    }

    render() {
        const { modified, current, editJSON } = this.state;
        const currentItem = current
            ? { ...current }
            : {
                name: '',
                keys: [],
                layers: [{ name: '', items: [] }]
            } as ImageModel;

        let styleJS: React.CSSProperties = {
            backgroundColor: this.state.editJSON ? 'green' : 'white'
        };

        return (
            <React.Fragment>
                <HeaderMenuWidget header={'Images New Item'} icon="file outline" >
                    <Menu.Item style={styleJS} content={'JSON'} icon={'file alternate outline'} onClick={() => this.changeStateJSON()} />
                    {modified && dialogMenuWidget(modified, 'Save', this.onSave, 'save', 'Are you sure you want to save the changes?', { color: 'green' })}
                    {modified && dialogMenuWidget(modified, 'Cancel', this.onCancel, 'reply', 'Are you sure you want to loose your changes?')}
                </HeaderMenuWidget>

                <Segment>
                    {!editJSON &&
                        <ImageItem
                            searchKeys={this.props.searchKeys}
                            searchDecorators={this.props.searchDecorators}
                            item={current}
                            editJSON={editJSON}
                            disabled={false}
                            onChange={this.onChange}
                        />}

                    {editJSON &&
                        <TableEditableWidget edit={false}>
                            <JsonEditorGet newitem={!modified} item={current} ref={r => this.refJsonEditor = r} onModified={(modified: boolean) => this.setState({ ...this.state, modified: modified })} />
                        </TableEditableWidget>
                    }

                </Segment>
            </React.Fragment >

        );
    }

}

export const ImageNewItem = conn.connect(ImageNewItemComp);

