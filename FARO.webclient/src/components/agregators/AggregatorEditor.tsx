import * as React from 'react';
import * as reducers from '../../reducers';
import { aggregatorUpdate, aggregatorClear, aggregatorGetCallback, aggregatorUpdateRedux, imageGet, registeredEngines } from '../../actions';
import { addMessage } from '../../actions/indexMsg';
import { AggregatorModel } from '../../actions/model';
import { appConnector, Link } from 'app-support';
import { Segment, Menu } from 'semantic-ui-react';
import { HeaderMenuWidget, dialogMenuWidget } from '../shared/MenuWidget';

import { AggregatorItem } from './AggregatorItem';
import { JsonEditorGet } from '../shared/JsonEditorGet';
import { TableEditableWidget } from '../shared/EditableWidget';
import { ConfirmWidget } from '../shared/DialogWidget';
import { TypeMessage } from 'src/actions/modelMsg';
import { timingSafeEqual } from 'crypto';


const conn = appConnector<{ id: string, onEdit?: (where: string, id: string) => void }>()(
    (s, p) => ({
        current: reducers.getAggregator(s, p.id),
        image: reducers.getCurrentImage(s),
        aggregatorKindList: reducers.getAggregatorEngines(s)
    }),
    {
        imageGet,
        aggregatorUpdateRedux,
        aggregatorGetCallback,
        aggregatorClear,
        aggregatorUpdate,
        addMessage,
        registeredEngines
    }
);

export interface AggregatorEditorState {
    current?: AggregatorModel;
    editJSON: boolean;
    modified: boolean;
}

class AggregatorEditor extends conn.StatefulCompo<AggregatorEditorState> {
    config: { [kind: number]: any };
    oldkind: any;
    refJsonEditor: JsonEditorGet | null;

    constructor(props: any) {
        super(props);
        this.config = {};
        let copy: AggregatorModel | undefined = this.copyFrom(props.current);
        this.state = { current: copy as AggregatorModel, editJSON: false, modified: false };
    }
    copyFrom = (curr: AggregatorModel) => {
        if (curr === undefined) return undefined;
        let copy: AggregatorModel = { ...curr };
        let config: any = { ...curr.config };
        config.value = { ...(config && config.value || {}) };
        copy.config = config;
        return copy;
    }
     
    componentDidUpdate(prevProps: any, prevState: AggregatorEditorState ): void {
         // solo una volta se this.state.current è undefined
        if (this.state.current === undefined && this.props.current) {
            let copy: AggregatorModel | undefined = this.copyFrom(this.props.current);
            if (copy) {
                let kind: string = copy.kind || '';
                this.oldkind = kind;
                let value: any = copy.config && copy.config.value;
                this.config[kind] = { ...value };
            }
            this.setState({ ...this.state, current: copy, modified: false });
        }
    }
    componentDidMount() {
        if (window && window.scrollTo) window.scrollTo(0, 0);
        this.props.registeredEngines();
        this.aggregatorGet();
    }
    componentWillUnmount(): void {
        this.props.aggregatorClear(this.props.id);
    }

    aggregatorGet = () => {
        if (this.props.aggregatorGetCallback) {
            this.props.aggregatorGetCallback({
                idAgg: this.props.id, call: (res: any) => {
                    if (res) {
                        if (res.Errors && res.Errors.lenght > 0) {
                            this.props.addMessage({
                                id: 'get-aggregator',
                                modal: true,
                                stackable: true,
                                timed: false,
                                typeMessage: TypeMessage.Error,
                                title: 'Error',
                                message: res.Errors[0]
                            });
                        } else {
                            let aggregator: AggregatorModel = res as AggregatorModel;
                            let idAgg: string | undefined = aggregator && aggregator.id;
                            let idImage: string | undefined = aggregator && aggregator.image;
                            if (idAgg && idImage) {
                                this.props.aggregatorUpdateRedux({ param: idAgg, result: aggregator });
                                this.props.imageGet(idImage);
                            }
                        }
                    }
                }
            });
        }
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
        }  
        if (newItem.config && newItem.config.value) {
            this.config[kind] = { ...value };
        }
    }
    changeState = (newItem: AggregatorModel, modified: boolean = true) => {
        this.updateCurrType(newItem);
        this.setState({ current: newItem, modified });
    }
    onEdit = () => this.setState({ modified: false });

    onCancel = () => {
        let copy: AggregatorModel | undefined = this.copyFrom(this.props.current as AggregatorModel);
        this.config = {};
        let kind: string | undefined = undefined;
        if (copy) {
            kind = copy.kind;
            if (kind !== undefined)
                this.config[kind] = { ...(copy.config && copy.config.value || {}) };
        }
        this.oldkind = kind;
        this.setState({ current: copy as AggregatorModel, modified: false });
    }
    internalSave = (item: any) => {
        if (item) {
            if (this.props.aggregatorUpdate) {
                this.props.aggregatorUpdate(item);
            }
            this.setState({...this.state, modified: false});
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
        const { current, editJSON, modified } = this.state;
        if (current) {
            let styleJS: React.CSSProperties = {
                backgroundColor: editJSON ? 'green' : 'white'
            };

            let nameImage: string = this.props.image && this.props.image.name && this.props.image.name.length > 0 ? this.props.image.name : '';
            let idImage: string = this.props.image && this.props.image.id && this.props.image.id.length > 0 ? this.props.image.id : '';

            let header: any = nameImage.length > 0 && idImage.length > 0 ?
                (
                    <div style={{ display: 'flex', marginLeft: '5px' }}>
                        <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>AGGREGATOR for image:</div>
                        {modified &&
                            <ConfirmWidget
                                children={`The item has not been saved, continue?`}
                                trigger={<Menu.Item content={nameImage} />}
                                onConfirm={() => {
                                    if (this.props.onEdit) {
                                        this.props.onEdit('/Images', idImage);
                                    }
                                }}
                            />
                        }
                        {!modified && <Menu.Item content={nameImage} as={Link} to={`/Images/${idImage}/edit`} />}
                    </div>
                )
                : 'AGGREGATOR';

            return (
                <React.Fragment>
                    <HeaderMenuWidget modified={modified} header={header} icon={'edit'} disabled={false}>
                        {modified && dialogMenuWidget(modified, 'Save', this.onSave, 'save', 'Are you sure you want to save the changes?', { color: 'green' })}
                        {modified && dialogMenuWidget(modified, 'Cancel', this.onCancel, 'reply', 'Are you sure you want to loose your changes?')}
                        {!modified && <Menu.Item as={Link} to={`/Aggregators/new`} icon="plus" content="New" />}
                        <Menu.Item content={'JSON'} icon={'file alternate outline'} onClick={() => this.changeStateJSON()} style={styleJS} />

                    </HeaderMenuWidget>

                    <Segment>
                        {!editJSON &&
                            <AggregatorItem
                                aggregatorKindList={this.props.aggregatorKindList}
                                freezeName={false}
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
                </React.Fragment >
            );
        }

        return null;
    }
}

export default conn.connect(AggregatorEditor); 