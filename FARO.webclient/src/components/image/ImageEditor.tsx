import * as React from 'react';
import * as reducers from '../../reducers';
import { appConnector, Link } from 'app-support';
import { ImageModel, ArgumentListDecorator, ArgumentListKeysIterator, UNIQUE_KEYSITERATOR, UNIQUE_DECORATOR, LayerDefinitionModel } from '../../actions/model';
import { dialogMenuWidget, HeaderMenuWidget } from '../shared/MenuWidget';
import { Menu, Segment } from 'semantic-ui-react';
import { imageGet, decoratorClear, keysIteratorClear, imageClear, imageUpdate, keysIteratorSearch, decoratorSearch, setSelectField, cloneItem } from '../../actions';
import { addMessage } from '../../actions/indexMsg';
import { ImageItem } from './ImageItem';
import { searchArgumetListDecorator, searchArgumetListKeysIterator } from '../Utils';
import { ConfirmWidget } from '../shared/DialogWidget';
import { TableEditableWidget } from '../shared/EditableWidget';
import { JsonEditorGet } from '../shared/JsonEditorGet';
import { TypeMessage } from 'src/actions/modelMsg';
import { Copy } from '../shared/Copy';



export interface ImageEditorProps {
    id: string;
    onEdit?: (where: string, id: string) => void;
    onSave?: (item: ImageModel) => void;
    onContinue?: (where: string) => void;
    headerMenuClass?: string;
}

const conn = appConnector<ImageEditorProps>()(
    (s, p) => ({
        current: reducers.getCurrentImage(s),
        searchKeys: reducers.getKeysIteratorSearch(s, UNIQUE_KEYSITERATOR),
        searchDecorators: reducers.getDecorators(s, UNIQUE_DECORATOR)
    }),
    {
        keysIteratorSearch,
        decoratorSearch,
        imageGet,
        imageClear,
        decoratorClear,
        addMessage,
        keysIteratorClear,
        cloneItem,
        imageUpdate,
        setSelectField
    }
);

export interface ImageEditorState {
    current?: ImageModel;
    editJSON: boolean;
    modified: boolean;
}

class ImageEditorComp extends conn.StatefulCompo<ImageEditorState> {

    refJsonEditor: JsonEditorGet | null;

    constructor(props: any) {
        super(props);
        this.state = { current: props.current, editJSON: false, modified: false };
    }


    componentDidUpdate(prevProps: any, prevState: ImageEditorState): void {
        // solo una volta se this.state.current è undefined
        if (this.state.current === undefined && this.props.current) {
            let temp = { ...this.props.current };
            if (this.props.onSave) {
                this.props.onSave(temp);
            }
            this.setState({ current: temp, modified: false });
        }
    }


    componentDidMount() {
        if (window && window.scrollTo) window.scrollTo(0, 0);
        this.props.imageGet(this.props.id);
        let argumentA: ArgumentListKeysIterator = searchArgumetListKeysIterator();
        this.props.keysIteratorSearch(argumentA);
        let argumentB: ArgumentListDecorator = searchArgumetListDecorator();
        this.props.decoratorSearch(argumentB);
    }
    componentWillUnmount(): void {
        this.props.setSelectField(undefined);
        this.props.imageClear(this.props.id);
        this.props.decoratorClear(UNIQUE_DECORATOR);
        this.props.keysIteratorClear(UNIQUE_KEYSITERATOR);
    }
    changeState = (newItem: ImageModel, modified: boolean = true) => {
        this.setState({ current: newItem, modified });
    }

    onCancel = () => {
        const { current } = this.props;
        this.setState({ current: { ...current }, modified: false });
    }

    validateImage = (item: ImageModel) => {
        if (item.name === undefined || item.name === null || item.name === '') return 'Name cannot be empty';
        if (item.keys === undefined || item.keys === null || item.keys.length === 0) return 'Keys must be not empty';
        else {
            let indx: number = item.keys.findIndex(k => k.keyid === undefined);
            if (indx > -1) {
                return 'Keys at index ' + (indx + 1) + ' must be not empty';
            }
        }
        if (item.layers) {
            for (let i: number = 0; i < item.layers.length; i++) {
                let layer: LayerDefinitionModel = item.layers[i];
                if (layer.name === undefined || layer.name.length === 0) return 'Layer Name cannot be empty';
                if (layer.items && layer.items.length > 0) {
                    for (let j: number = 0; j < layer.items.length; j++) {
                        let itemLayer = layer.items[j];
                        var errMsg = 'The item at index ' + (j + 1) + ' of layer ' + layer.name;
                        if (!itemLayer.field && !itemLayer.config) return errMsg + ' is empty!';
                        if (itemLayer.field === '') return errMsg + '" has empty field name!';
                        if (itemLayer.config === undefined) return errMsg + ' has empty configuration!';
                    }
                }
            }
        }
        return '';
    }

    internalSave = (item: any) => {
        if (item) {
            let message: string = this.validateImage(item as ImageModel);
            if (message && message.length > 0) {
                this.props.addMessage({
                    id: `save-image_${message.length}`,
                    modal: false,
                    stackable: false,
                    timed: true,

                    typeMessage: TypeMessage.Warning,
                    title: 'Warning',
                    message: message
                });
            } else {
                this.props.imageUpdate(item);
                if (this.props.onSave) {
                    this.props.onSave(item);
                }
                this.setState({ ...this.state, modified: false });
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

    cloneItem = () => {
        const { current } = this.props;
        if (this.props.cloneItem && this.props.onContinue) {
            let item: ImageModel = current as ImageModel;
            let clItem: ImageModel = {
                name: 'Clone of ' + item.name,
                description: item.description,
                keys: [...(item.keys || [])],
                layers: item.layers,
                tags: [...(item.tags || [])]
            };
            this.props.cloneItem(clItem);
            this.props.onContinue('/Images');
        }
    }
    textProvider = () => {
        const { current } = this.state;
        return JSON.stringify(current, null, 2);
    }

    // current: reducers.getCurrentImage(s),
    // searchKeys: reducers.getKeysIteratorSearch(s, UNIQUE_KEYSITERATOR),
    // searchDecorators:
    render() {
        const { current, editJSON, modified } = this.state;
        if (current && this.props.current !== undefined) {
            let styleJS: React.CSSProperties = {
                backgroundColor: editJSON ? 'green' : 'white'
            };

            return (
                <React.Fragment>
                    <HeaderMenuWidget modified={modified} className={this.props.headerMenuClass || ''} header="IMAGE" icon="edit" disabled={false}>
                        {!modified && <Menu.Item > <Copy button={{ color: 'green' }} textProvider={this.textProvider} /></Menu.Item>}
                        {modified && dialogMenuWidget(modified, 'Save', this.onSave, 'save', 'Are you sure you want to save the changes?', { color: 'green' })}
                        {modified && dialogMenuWidget(modified, 'Cancel', this.onCancel, 'reply', 'Are you sure you want to loose your changes?')}
                        {!modified && <Menu.Item as={Link} to={`/Images/new`} icon="plus" content="New" />}
                        {!modified &&
                            <ConfirmWidget
                                children={`Are you sure you want to clone ${current.name} item?`}
                                onConfirm={() => this.cloneItem()}
                                trigger={<Menu.Item icon="clone outline" content="Clone" />}
                            />}
                        {!modified && <Menu.Item as={Link} to={`/Images/Usage/${current.id}`} icon="linkify" content="Usage" />}
                        {!modified && <Menu.Item as={Link} to={`/Images/${current.id}/run`} icon="cogs" content="Build" />}
                        {!modified && <Menu.Item as={Link} to={`/Images/${current.id}/validate`} icon="certificate" content="Check" />}
                        <Menu.Item content={'JSON'} icon={'file alternate outline'} onClick={() => this.changeStateJSON()} style={styleJS} />
                    </HeaderMenuWidget>

                    <Segment style={{ margin: '0px' }}>
                        {!editJSON &&
                            <ImageItem
                                modified={modified}
                                onEdit={(where: string, id: string) => this.props.onEdit && this.props.onEdit(where, id)}
                                searchDecorators={this.props.searchDecorators}
                                searchKeys={this.props.searchKeys}
                                item={current}
                                editJSON={editJSON}
                                disabled={false}
                                onChange={this.changeState}
                            />}


                        {editJSON &&
                            <TableEditableWidget edit={false}>
                                <JsonEditorGet
                                    newitem={!modified}
                                    item={current}
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

export const ImageEditor = conn.connect(ImageEditorComp);