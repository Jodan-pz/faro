import * as React from 'react';
import * as reducers from '../../reducers';
import { appConnector } from 'app-support';
import { AggregatorModel, UNIQUE_AGGREGATOR, ArgumentListAggregator, AggregatorEngineKind } from '../../actions/model';
import { Segment, Menu, Modal, Header, Icon, Button } from 'semantic-ui-react';
import { imageResetChanged, imageGetAggregators, aggregatorDelete, aggregatorCreate, aggregatorUpdateCallBack, aggregatorSearch, registeredEngines } from '../../actions';
import { addMessage } from '../../actions/indexMsg';
import { MenuLayers } from '../shared/items/objectItem/MenuLayers';
import { TypeMessage } from 'src/actions/modelMsg';
import { HeaderMenuWidget, dialogMenuWidget } from '../shared/MenuWidget';
import { AggregatorItem } from '../agregators/AggregatorItem';
import { TableEditableWidget } from '../shared/EditableWidget';
import { JsonEditorGet } from '../shared/JsonEditorGet';
import { searchArgumetListAggregator, eventPrevent } from '../Utils';
import { LabeledContainerItem } from '../shared/items/LabeledContainer';
import { DropAggregatorList } from '../shared/items/objectItem/DropAggregatorList';



const conn = appConnector<{ idImage: string, nameImage: string }>()(
    (s, p) => ({
        currentAggregators: reducers.getCurrentAggregators(s),
        imagefields: reducers.getCurrentImagefields(s),
        imageIsChanged: reducers.imageIsChanged(s),
        aggregatorList: reducers.getAggregatorsSearch(s, UNIQUE_AGGREGATOR),
        aggregatorKindList: reducers.getAggregatorEngines(s)
    }),
    {
        aggregatorSearch,
        aggregatorUpdateCallBack,
        imageResetChanged,
        imageGetAggregators,
        aggregatorCreate,
        aggregatorDelete,
        addMessage,
        registeredEngines
    }
);
export interface ImageAggregatorsContainerState {
    current?: AggregatorModel;
    editJSON: boolean;
    modified: boolean;
    editMode: boolean;
    currents: AggregatorModel[];
    cloneAggregator: AggregatorModel | null;
}

class ImageAggregatorsContainerComp extends conn.StatefulCompo<ImageAggregatorsContainerState> {
    refJsonEditor: JsonEditorGet | null;
    constructor(props: any) {
        super(props);
        let currentAggregators = props.currentAggregators ? [...props.currentAggregators] : [];
        this.state = {
            current: currentAggregators.length > 0 ? currentAggregators[0] : undefined,
            currents: currentAggregators,
            editJSON: false,
            editMode: false,
            modified: false,
            cloneAggregator: null
        };
    }

    reload = () => {
        this.props.imageGetAggregators(this.props.idImage);
        let param: ArgumentListAggregator = searchArgumetListAggregator();
        this.props.aggregatorSearch(param);
    }
    componentDidMount() {
        this.props.registeredEngines();
        this.reload();
    }

    componentDidUpdate(): void {
        if (this.props.imageIsChanged) {
            this.props.imageResetChanged();
            this.reload();
        }
    }

    componentWillReceiveProps(next: any): void {
        if (next.currentAggregators) {
            const { current } = this.state;
            let newcurrents: AggregatorModel[] = [...(next.currentAggregators || [])];
            let newCurrent: AggregatorModel | undefined = undefined;
            if (newcurrents && newcurrents.length > 0) {
                newCurrent = newcurrents[0];
            }
            this.setState({ ...this.state, current: newCurrent, currents: newcurrents, modified: false, editMode: true });
        }
    }
    onSelectAggregator = (name: string) => {
        const { currents } = this.state;
        let current: AggregatorModel | undefined = currents.find(it => it.name === name);
        if (current) {
            this.setState({ ...this.state, current: current, modified: false });
        }
    }
    // ======================================= CALL BACKS

    onAddAggregator = (name: string) => {
        const { currents } = this.state;
        let newcurrents: AggregatorModel[] = [...(currents as AggregatorModel[])];
        let exist: boolean = newcurrents.find(e => e.name === name) !== undefined;
        if (!exist) {
            let aggr: AggregatorModel = {
                name: name,
                kind: AggregatorEngineKind.DEFAULT
            };
            this.createAggregator(aggr);
        } else {
            this.props.addMessage({
                id: 'exist-name',
                modal: false,
                stackable: false,
                timed: true,
                typeMessage: TypeMessage.Info,
                title: 'Info',
                message: `The name: ${name} already exists`
            });
        }
    }
    createAggregator = (item: any) => {
        if (item && this.props.aggregatorCreate) {
            if (this.props.idImage) {
                item.image = this.props.idImage;
                let prms = { aggregator: item, call: this.callBackCreate };
                this.props.aggregatorCreate(prms);
            }
        }
    }
    callBackCreate = (res: any) => {
        if (res) {
            if (res.Errors && res.Errors.lenght > 0) {
                this.props.addMessage({
                    id: 'create-aggregator',
                    modal: true,
                    stackable: true,
                    timed: false,
                    typeMessage: TypeMessage.Error,
                    title: 'Error',
                    message: res.Errors[0]
                });
            } else {
                const { currents } = this.state;
                let newcurrents: AggregatorModel[] = [...(currents as AggregatorModel[])];
                newcurrents.push(res);
                this.setState({ ...this.state, currents: newcurrents, current: res, modified: false }, () => {
                    this.reload();
                });
            }
        }
    }
    // DELETE
    onDeleteAggregator = () => {
        const { current, currents, editMode, modified } = this.state;
        if (current) {
            if (current.id && this.props.aggregatorDelete) {
                let curDelete = current;
                let newcurrents: AggregatorModel[] = [...(currents as AggregatorModel[])];
                let index: number = newcurrents.indexOf(current);
                let newCurr: AggregatorModel | undefined = undefined;
                if (index >= 0) {
                    newcurrents.splice(index, 1);
                    let newIndex: number = index - 1;
                    if (newIndex >= 0 && newIndex < newcurrents.length) {
                        newCurr = newcurrents[newIndex];
                    }
                }
                this.setState({ ...this.state, currents: newcurrents, current: newCurr }, () => {
                    this.props.aggregatorDelete({
                        aggregator: curDelete, call: this.callBackDelete
                    });
                });
            }
        }
    }
    callBackDelete = (res: any) => {

        if (res) {
            if (res.Errors && res.Errors.lenght > 0) {
                this.props.addMessage({
                    id: 'deleted-aggregator',
                    modal: true,
                    stackable: true,
                    timed: false,
                    typeMessage: TypeMessage.Error,
                    title: 'Error',
                    message: res.Errors[0]
                });
            } else {
                this.reload();
            }
        }
    }

    // UPDATE
    updateAggregator = (item: any) => {
        if (item) {
            this.props.aggregatorUpdateCallBack({ model: item, call: this.callBackUpdate });
        }
    }

    callBackUpdate = (res: any) => {
        if (res) {
            if (res.Errors && res.Errors.lenght > 0) {
                this.props.addMessage({
                    id: 'update-aggregator',
                    modal: true,
                    stackable: true,
                    timed: false,
                    typeMessage: TypeMessage.Error,
                    title: 'Error',
                    message: res.Errors[0]
                });
            } else {
                this.setState({ ...this.state, current: res }, () => {
                    this.reload();
                });
            }
        }
    }

    changeNameAggregator = (oldName: string, newName: string) => {
        const { current } = this.state;
        if (current && newName) {
            current.name = newName;
            this.setState({ ...this.state, current: current, modified: false, editMode: true }, () => {
                this.onSave();
            });
        }
    }

    // =======================
    onCancel = () => {
        const { currentAggregators } = this.props;
        const { current } = this.state;
        let newcurrents: AggregatorModel[] = [...(currentAggregators || [])];
        let lastSelected: string | undefined = current && current.name ? current.name : undefined;
        let newCurrent: AggregatorModel | undefined = newcurrents.find(it => it.name === lastSelected);
        if (newCurrent === undefined && newcurrents.length > 0) {
            newCurrent = newcurrents[0];
        }
        this.setState({ ...this.state, current: newCurrent, currents: newcurrents, modified: false, editMode: true });
    }

    internalSave = (item: any) => {
        const { editMode } = this.state;
        if (editMode) {
            this.updateAggregator({ ...item });
        } else {
            this.createAggregator({ ...item });
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

    changeState = (newItem: AggregatorModel, modified: boolean = true) => {
        this.setState({ current: newItem, modified });
    }
    updateCurrType = (newItem: any) => {
        // 
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

    selectNewAggregator = (newValue: AggregatorModel) => {
        if (newValue) {
            let clone: AggregatorModel = { ...newValue };
            this.setState({ ...this.state, cloneAggregator: clone });
        }
    }
    confirmCloneAggregator = () => {
        const { cloneAggregator } = this.state;
        if (cloneAggregator) {
            let clone: AggregatorModel = { ...cloneAggregator };
            clone.id = undefined;
            clone.name = 'Clone of ' + clone.name;
            clone.image = this.props.idImage;
            this.setState({ ...this.state, cloneAggregator: null }, () => {
                this.createAggregator(clone);
            });
        }
    }
    cancelCloneAggregator = () => {
        this.setState({ ...this.state, cloneAggregator: null });
    }

    render() {
        const { aggregatorList } = this.props;
        const { currents, modified, editJSON, editMode, current, cloneAggregator } = this.state;

        if (currents) {
            let namesMenu: string[] = currents.map((agg: AggregatorModel) => agg.name!);
            let currName: string = current && current.name ? current.name : '';

            let header: string = this.props.nameImage ? 'AGGREGATOR for image ' + this.props.nameImage : 'AGGREGATOR';
            let styleJS: React.CSSProperties = {
                backgroundColor: editJSON ? 'green' : 'white'
            };

            let dropDownAggregators: any = '';
            if (aggregatorList && aggregatorList.length > 0) {
                dropDownAggregators = (
                    <LabeledContainerItem
                        style={{ width: '400px' }}
                        label="CLONE"
                        key={aggregatorList.length}
                        value={aggregatorList}
                        name="aggregator"
                        onChange={(name: string | number, newValue: any) => this.selectNewAggregator(newValue)}
                    >
                        <DropAggregatorList />
                    </LabeledContainerItem>);
            }


            return (
                <React.Fragment>

                    <HeaderMenuWidget header={header} icon={editMode ? 'edit' : 'file outline'} disabled={false}>
                        {!modified && dropDownAggregators}
                        {modified && dialogMenuWidget(modified, 'Save', this.onSave, 'save', 'Are you sure you want to save the changes?', { color: 'green' })}
                        {modified && dialogMenuWidget(modified, 'Cancel', this.onCancel, 'reply', 'Are you sure you want to loose your changes?')}
                        {/* !this.props.hideNewButton && !modified && <Menu.Item as={Link} to={`/Aggregators/new`} icon="plus" content="New" /> */}
                        {namesMenu.length > 0 && <Menu.Item content={'JSON'} icon={'file alternate outline'} onClick={() => this.changeStateJSON()} style={styleJS} />}
                    </HeaderMenuWidget>

                    {cloneAggregator !== null &&
                        <Modal open={true} onClose={this.cancelCloneAggregator} dimmer={'inverted'} size={'small'} closeOnDimmerClick={false}>
                            <Header> <Icon name="question circle outline" />{'Are you sure you want clone ' + cloneAggregator.name + ' ?'} </Header>
                            <Modal.Actions>
                                <Button onClick={eventPrevent(this.confirmCloneAggregator)} size="mini" color="blue">
                                    <Icon name="checkmark" /> {'YES'}
                                </Button>
                                <Button onClick={eventPrevent(this.cancelCloneAggregator)} size="mini" color="red" >
                                    <Icon name="remove" /> {'NO'}
                                </Button>
                            </Modal.Actions>
                        </Modal>
                    }

                    <Segment>
                        <MenuLayers
                            infoDelete={`Are you sure you want delete aggregator ${currName}?`}
                            value={namesMenu}
                            selected={currName}
                            onSelect={this.onSelectAggregator}
                            onAdd={this.onAddAggregator}
                            onDelete={this.onDeleteAggregator}
                            onChange={this.changeNameAggregator}
                        />

                        {!editJSON && namesMenu.length > 0 &&
                            <AggregatorItem
                                aggregatorKindList={this.props.aggregatorKindList}
                                freezeName
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

                </React.Fragment>
            );
        }
        return null;
    }
}


export const ImageAggregatorsContainer = conn.connect(ImageAggregatorsContainerComp);