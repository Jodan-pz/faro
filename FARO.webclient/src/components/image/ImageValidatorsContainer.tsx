import * as React from 'react';
import * as reducers from '../../reducers';
import { appConnector } from 'app-support';
import {  ValidatorModel, UNIQUE_VALIDATOR, ArgumentListValidator, ValidatorEngineKind } from '../../actions/model';
import { Segment, Menu, Modal, Header, Button, Icon } from 'semantic-ui-react';
import { imageResetChanged, imageGetValidators, validatorDelete, validatorCreate, validatorUpdateCallBack, validatorSearch, registeredEngines } from '../../actions';
import { addMessage } from '../../actions/indexMsg';
import { MenuLayers } from '../shared/items/objectItem/MenuLayers';
import { TypeMessage } from 'src/actions/modelMsg';
import { HeaderMenuWidget, dialogMenuWidget } from '../shared/MenuWidget';
import { TableEditableWidget } from '../shared/EditableWidget';
import { JsonEditorGet } from '../shared/JsonEditorGet';
import { ValidatorItem } from '../validators/ValidatorItem';
import { DropValidatorList } from '../shared/items/objectItem/DropValidatorsList';
import { searchArgumetListValidator, eventPrevent } from '../Utils';
import { LabeledContainerItem } from '../shared/items/LabeledContainer';




const conn = appConnector<{ idImage: string, nameImage: string }>()(
    (s, p) => ({
        currentValidators: reducers.getCurrentValidators(s),
        imageIsChanged: reducers.imageIsChanged(s),
        validatorList: reducers.getValidatorSearch(s, UNIQUE_VALIDATOR),
        fields: reducers.getCurrentImagefields(s),
        validatorKindList: reducers.getValidatorEngines(s)
    }),
    {
        validatorSearch,
        imageResetChanged,
        imageGetValidators,
        validatorDelete,
        validatorCreate,
        validatorUpdateCallBack,
        addMessage,
        registeredEngines
    }
);
export interface ImageValidatorsContainerState {
    current?: ValidatorModel;
    editJSON: boolean;
    modified: boolean;
    editMode: boolean;
    currents: ValidatorModel[];
    clonedValidators: ValidatorModel | null;
}

class ImageValidatorsContainerComp extends conn.StatefulCompo<ImageValidatorsContainerState> {
    refJsonEditor: JsonEditorGet | null;
    constructor(props: any) {
        super(props);
        let currentValidators = props.currentValidators ? [...props.currentValidators] : [];
        this.state = {
            current: currentValidators.length > 0 ? currentValidators[0] : undefined,
            currents: currentValidators,
            editJSON: false,
            editMode: false,
            modified: false,
            clonedValidators: null
        };
    }
    reload = () => {
        this.props.imageGetValidators(this.props.idImage);
        let param: ArgumentListValidator = searchArgumetListValidator();
        this.props.validatorSearch(param);
    }
    componentDidMount() {
        this.props.registeredEngines();
        this.reload();
    }

    componentDidUpdate(): void {
        if (this.props.imageIsChanged) {
            // cambia lo stato in false    
            this.props.imageResetChanged();
            this.reload();
        }
    }

    componentWillReceiveProps(next: any): void {
        if (next.currentValidators) {
            const { current } = this.state;
            let newcurrents: ValidatorModel[] = [...(next.currentValidators || [])];
            // let lastSelectedId: string | undefined = current && current.id ? current.id : undefined;
            let newCurrent: ValidatorModel | undefined = undefined;
            if ( newcurrents.length > 0) {
                newCurrent = newcurrents[0];
            }
            this.setState({ ...this.state, current: newCurrent, currents: newcurrents, modified: false, editMode: true });
        }
    }

    // ======================================= CALL BACKS
    // CREATE
    onAddValidator = (name: string) => {
        const { currents } = this.state;
        let newcurrents: ValidatorModel[] = [...(currents as ValidatorModel[])];
        let exist: boolean = newcurrents.find(e => e.name === name) !== undefined;
        if (!exist) {
            let aggr: ValidatorModel = {
                name: name,
                kind: ValidatorEngineKind.DEFAULT
            };
            this.createValidator(aggr);
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
    createValidator = (item: any) => {
        if (item && this.props.validatorCreate) {
            if (this.props.idImage) {
                item.image = this.props.idImage;
                let prms = { validator: item, call: this.callBackCreate };
                this.props.validatorCreate(prms);
            }
        }
    }
    callBackCreate = (res: any) => {
        if (res) {
            if (res.Errors && res.Errors.lenght > 0) {
                this.props.addMessage({
                    id: 'create-validator',
                    modal: true,
                    stackable: true,
                    timed: false,
                    typeMessage: TypeMessage.Error,
                    title: 'Error',
                    message: res.Errors[0]
                });
            } else {
                const { currents } = this.state;
                let newcurrents: ValidatorModel[] = [...(currents as ValidatorModel[])];
                newcurrents.push(res);
                this.setState({ ...this.state, currents: newcurrents, current: res, modified: false }, () => {
                    this.reload();
                });
            }
        }
    }
    // DELETE
    onDeleteValidator = () => {
        const { current, currents, editMode, modified } = this.state;
        if (current) {
            if (current.id && this.props.validatorDelete) {
                let curDelete = current;
                let newcurrents: ValidatorModel[] = [...(currents as ValidatorModel[])];
                let index: number = newcurrents.indexOf(current);
                let newCurr: ValidatorModel | undefined = undefined;
                if (index >= 0) {
                    newcurrents.splice(index, 1);
                    let newIndex: number = index - 1;
                    if (newIndex >= 0 && newIndex < newcurrents.length) {
                        newCurr = newcurrents[newIndex];
                    }
                }

                this.setState({ ...this.state, currents: newcurrents, current: newCurr }, () => {
                    this.props.validatorDelete({
                        validator: curDelete,
                        call: this.callBackDelete
                    });
                });
            }
        }
    }

    callBackDelete = (res: any) => {
        if (res) {
            if (res.Errors && res.Errors.lenght > 0) {
                this.props.addMessage({
                    id: 'deleted-validator',
                    modal: true,
                    stackable: true,
                    timed: false,
                    typeMessage: TypeMessage.Error,
                    title: 'Error',
                    message: res.Errors[0]
                });
            } else {
                // this.props.imageGetValidators(this.props.idImage);
                this.reload();
            }
        }
    }
    // UPDATE

    validatorUpdate = (item: any) => {
        if (item) {
            this.props.validatorUpdateCallBack({ model: item, call: this.callBackUpdate });
        }
    }

    callBackUpdate = (res: any) => {
        if (res) {
            if (res.Errors && res.Errors.lenght > 0) {
                this.props.addMessage({
                    id: 'update-validator',
                    modal: true,
                    stackable: true,
                    timed: false,
                    typeMessage: TypeMessage.Error,
                    title: 'Error',
                    message: res.Errors[0]
                });
            } else {
                // this.props.imageGetValidators(this.props.idImage);
                this.reload();
            }
        }
    }


    onSelectValidator = (name: string) => {
        const { currents } = this.state;
        let current: ValidatorModel | undefined = currents.find(it => it.name === name);
        if (current) {
            this.setState({ ...this.state, current: current, modified: false });
        }
    }


    changeNameValidator = (oldName: string, newName: string) => {
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
        const { currentValidators } = this.props;
        const { current } = this.state;
        let newcurrents: ValidatorModel[] = [...(currentValidators || [])];
        let lastSelected: string | undefined = current && current.name ? current.name : undefined;
        let newCurrent: ValidatorModel | undefined = newcurrents.find(it => it.name === lastSelected);
        if (newCurrent === undefined && newcurrents.length > 0) {
            newCurrent = newcurrents[0];
        }
        this.setState({ ...this.state, current: newCurrent, currents: newcurrents, modified: false, editMode: true });
    }

    internalSave = (item: any) => {
        const { editMode } = this.state;
        if (editMode) {
            this.validatorUpdate({ ...item });
        } else {
            this.createValidator({ ...item });
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

    changeState = (newItem: ValidatorModel, modified: boolean = true) => {
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

    selectNewValidator = (newValue: ValidatorModel) => {
        if (newValue) {
            let clone: ValidatorModel = { ...newValue };
            this.setState({ ...this.state, clonedValidators: clone });

        }
    }

    confirmCloneValidator = () => {
        const { clonedValidators } = this.state;
        if (clonedValidators) {
            let clone: ValidatorModel = { ...clonedValidators };
            clone.id = undefined;
            clone.name = 'Clone of ' + clone.name;
            clone.image = this.props.idImage;
            this.setState({ ...this.state, clonedValidators: null }, () => {
                this.createValidator(clone);
            });
        }
    }
    cancelCloneValidator = () => {
        this.setState({ ...this.state, clonedValidators: null });
    }

    render() {
        const { validatorList  } = this.props;
        const { currents, modified, editJSON, editMode, current, clonedValidators } = this.state;

        if (currents) {
            let namesMenu: string[] = currents.map((agg: ValidatorModel) => agg.name!);
            let currName: string = current && current.name ? current.name : '';

            let header: string = this.props.nameImage ? 'VALIDATORs for image ' + this.props.nameImage : 'VALIDATORs';
            let styleJS: React.CSSProperties = {
                backgroundColor: editJSON ? 'green' : 'white'
            };

            let dropDownValidators: any = '';
            if (validatorList && validatorList.length > 0) {
                dropDownValidators = (
                    <LabeledContainerItem
                        style={{ width: '400px' }}
                        label="CLONE"
                        key={validatorList.length}
                        value={validatorList}
                        name="validator"
                        onChange={(name: string | number, newValue: any) => this.selectNewValidator(newValue)}
                    >
                        <DropValidatorList />
                    </LabeledContainerItem>);
            }

            return (
                <React.Fragment>

                    <HeaderMenuWidget header={header} icon={editMode ? 'edit' : 'file outline'} disabled={false}>
                        {!modified && dropDownValidators}
                        {modified && dialogMenuWidget(modified, 'Save', this.onSave, 'save', 'Are you sure you want to save the changes?', { color: 'green' })}
                        {modified && dialogMenuWidget(modified, 'Cancel', this.onCancel, 'reply', 'Are you sure you want to loose your changes?')}
                        {/* !this.props.hideNewButton && !modified && <Menu.Item as={Link} to={`/Aggregators/new`} icon="plus" content="New" /> */}
                        {namesMenu.length > 0 && <Menu.Item content={'JSON'} icon={'file alternate outline'} onClick={() => this.changeStateJSON()} style={styleJS} />}
                    </HeaderMenuWidget>

                    {clonedValidators !== null &&
                        <Modal open={true} onClose={this.cancelCloneValidator} dimmer={'inverted'} size={'small'} closeOnDimmerClick={false}>
                            <Header> <Icon name="question circle outline" />{'Are you sure you want clone ' + clonedValidators.name + ' ?'} </Header>
                            <Modal.Actions>
                                <Button onClick={eventPrevent(this.confirmCloneValidator)} size="mini" color="blue">
                                    <Icon name="checkmark" /> {'YES'}
                                </Button>
                                <Button onClick={eventPrevent(this.cancelCloneValidator)} size="mini" color="red" >
                                    <Icon name="remove" /> {'NO'}
                                </Button>
                            </Modal.Actions>
                        </Modal>
                    }

                    <Segment>
                        <MenuLayers
                            infoDelete={`Are you sure you want delete validator ${currName}?`}
                            value={namesMenu}
                            selected={currName}
                            onSelect={this.onSelectValidator}
                            onAdd={this.onAddValidator}
                            onDelete={this.onDeleteValidator}
                            onChange={this.changeNameValidator}
                        />

                        {!editJSON && namesMenu.length > 0 &&  
                            <ValidatorItem
                                validatorKindList={this.props.validatorKindList}
                                fields={this.props.fields}
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


export const ImageValidatorContainer = conn.connect(ImageValidatorsContainerComp);