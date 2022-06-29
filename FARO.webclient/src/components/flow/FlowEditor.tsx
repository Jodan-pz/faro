import * as React from 'react';
import * as reducers from '../../reducers';
import { flowRunnableGet, flowUpdate, flowClear, imageSearch, writerSearch, writerSearchClear, imageSearchClear, cloneItem } from '../../actions';
import { FlowModel, ArgumentListImage, ArgumentListWriter, UNIQUE_IMAGE, UNIQUE_WRITER, ImageModel, WriterModel } from '../../actions/model';
import { appConnector, Link } from 'app-support';
import { Segment, Menu } from 'semantic-ui-react';
import { HeaderMenuWidget, dialogMenuWidget } from '../shared/MenuWidget';
import { FlowItem } from './FlowItem';

import { searchArgumetListImage, searchArgumetListWriter } from '../Utils';
import FlowSummary from './FlowSummary';
import { FlowItemDefinition } from 'mglib-faro.webclient/MGLib_FARO.WEBAPI';
import { ConfirmWidget } from '../shared/DialogWidget';
import { TableEditableWidget } from '../shared/EditableWidget';
import { JsonEditorGet } from '../shared/JsonEditorGet';
import { Copy } from '../shared/Copy';

interface FlowEditorProps {
    id: string;
    onContinue?: (where: string) => void;
    onEdit?: (where: string, id: string) => void;
}

const conn = appConnector<FlowEditorProps>()(
    (s, p) => ({
        current: reducers.getFlow(s, p.id),
        searchImages: reducers.getImageSearch(s, UNIQUE_IMAGE),
        searchWriters: reducers.getWriterSearch(s, UNIQUE_WRITER)
    }),
    {
        imageSearch,
        writerSearch,
        flowRunnableGet,
        writerSearchClear,
        imageSearchClear,
        flowClear,
        cloneItem,
        flowUpdate
    }
);

export interface FlowEditorState {
    current?: FlowModel;
    editJSON: boolean;
    modified: boolean;
}

class FlowEditor extends conn.StatefulCompo<FlowEditorState> {

    refJsonEditor: JsonEditorGet | null;

    constructor(props: any) {
        super(props);
        this.state = { current: props.current && props.current.flow ? props.current.flow : undefined, editJSON: false, modified: false };
    }

    componentDidUpdate(prevProps: any, prevState: FlowEditorState): void {
        // solo una volta se this.state.current è undefined
        if (this.state.current === undefined && this.props.current) {
            this.setState({ ...this.state, current: this.props.current && this.props.current.flow ? { ...this.props.current.flow } : undefined, modified: false });
        }
    }

    componentDidMount() {
        if (window && window.scrollTo) window.scrollTo(0, 0);
        this.props.flowRunnableGet(this.props.id);
        let argumentA: ArgumentListImage = searchArgumetListImage();
        this.props.imageSearch(argumentA);
        let argumentB: ArgumentListWriter = searchArgumetListWriter();
        this.props.writerSearch(argumentB);
    }

    componentWillUnmount(): void {
        this.props.flowClear(this.props.id);
        this.props.writerSearchClear(UNIQUE_WRITER);
        this.props.imageSearchClear(UNIQUE_IMAGE);
    }
    changeState = (newItem: FlowModel, modified: boolean = true) => {
        this.setState({ current: newItem, modified });
    }
    onEdit = () => this.setState({ modified: false });

    onCancel = () => {
        const { current } = this.state;
        let flow: FlowItemDefinition = this.props.current && this.props.current.flow ? { ...this.props.current.flow } : { ...current };
        this.setState({ ...this.state, current: flow, modified: false });
    }
    getJSON = () => {
        if (this.refJsonEditor) {
            return this.refJsonEditor.getJson();
        }
        return null;
    }
    internalSave = (current: FlowItemDefinition) => {
        if (current) {
            this.props.flowUpdate(current);
            this.setState({ ...this.state, modified: false });
        }
    }
    onSave = () => {
        const { current, editJSON } = this.state;
        this.internalSave(editJSON ? this.getJSON() : current);
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
            let item: FlowModel | undefined = current && current.flow as FlowModel;
            let tags: any = item !== undefined && item.tags !== undefined ? item.tags.slice() : [];
            if (item) {
                let clItem: FlowModel = {
                    name: 'Clone of ' + item.name,
                    description: item.description,
                    aggregator: item.aggregator,
                    image: item.image,
                    tags: tags,
                    validator: item.validator,
                    writer: item.writer
                };
                if (this.props.cloneItem) {
                    this.props.cloneItem(clItem);
                    this.props.onContinue('/Flows');
                }
            }
        }
    }

    render() {
        const { current, editJSON, modified } = this.state;

        if (current) {
            let styleJS: React.CSSProperties = {
                backgroundColor: editJSON ? 'green' : 'white'
            };

            let imageSummary: ImageModel | undefined = this.props.searchImages && this.props.searchImages.length > 0 ? this.props.searchImages.find(im => im.id === current.image) : undefined;
            let writerSummary: WriterModel | undefined = this.props.searchWriters && this.props.searchWriters.length > 0 ? this.props.searchWriters.find(wr => wr.id === current.writer) : undefined;

            return (
                <React.Fragment>
                    <HeaderMenuWidget modified={modified} header="FLOWS" icon="edit" disabled={false}>
                        {!modified && <Menu.Item >
                            <Copy
                                button={{ color: 'green' }}
                                textProvider={() => {
                                    const { current } = this.state;
                                    return JSON.stringify(current, null, 2);
                                }}
                            />
                        </Menu.Item>}
                        {modified && dialogMenuWidget(modified, 'Save', this.onSave, 'save', 'Are you sure you want to save the changes?', { color: 'green' })}
                        {modified && dialogMenuWidget(modified, 'Cancel', this.onCancel, 'reply', 'Are you sure you want to loose your changes?')}
                        {!modified && <Menu.Item as={Link} to={`/Flows/new`} icon="plus" content="New" />}
                        {!modified &&
                            <ConfirmWidget
                                children={`Are you sure you want to clone ${current.name} item?`}
                                onConfirm={() => this.cloneItem()}
                                trigger={<Menu.Item icon="clone outline" content="Clone" />}
                            />}
                        {!modified && <Menu.Item as={Link} to={`/Flows/${current.id}/run`} icon="play" content="Run" />}
                        {!modified && <Menu.Item as={Link} to={`/Flows/${current.id}/validate`} icon="certificate" content="Check" color="orange" />}
                        <Menu.Item content={'JSON'} icon={'file alternate outline'} onClick={() => this.changeStateJSON()} style={styleJS} />
                    </HeaderMenuWidget>

                    <Segment>
                        {!editJSON && <FlowItem
                            modified={modified}
                            onEdit={(where: string, id: string) => this.props.onEdit && this.props.onEdit(where, id)}
                            searchImages={this.props.searchImages}
                            searchWriters={this.props.searchWriters}
                            item={current}
                            editJSON={editJSON}
                            disabled={false}
                            onChange={this.changeState}
                        />}
                        {editJSON &&
                            <TableEditableWidget edit={false}>
                                <JsonEditorGet newitem={!modified} item={current} ref={r => this.refJsonEditor = r} onModified={(modified: boolean) => this.setState({ ...this.state, modified: modified })} />
                            </TableEditableWidget>
                        }
                    </Segment>
                    <Segment>
                        <FlowSummary flow={current} image={imageSummary} writer={writerSummary} />
                    </Segment>

                </React.Fragment >
            );
        }

        return null;
    }
}

export default conn.connect(FlowEditor);