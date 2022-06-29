import * as React from 'react';
import { appConnector, Link } from 'app-support';
import { Segment, Menu } from 'semantic-ui-react';
import * as reducers from '../../reducers';
import { validatorGetCallback, validatorClear, validatorUpdate, validatorUpdateRedux, imageGet, imageGetValidators, registeredEngines } from '../../actions';
import { addMessage } from '../../actions/indexMsg';
import { ValidatorModel, RuleConfig, ValidatorEngineKind } from '../../actions/model';
import { HeaderMenuWidget, dialogMenuWidget } from '../shared/MenuWidget';
import { ValidatorItem } from './ValidatorItem';
import { JsonEditorGet } from '../shared/JsonEditorGet';
import { TableEditableWidget } from '../shared/EditableWidget';
import { ConfirmWidget } from '../shared/DialogWidget';
import { TypeMessage } from 'src/actions/modelMsg';
import { Copy } from '../shared/Copy';


const conn = appConnector<{ id: string, onEdit?: (where: string, id: string) => void }>()(
    (s, p) => ({
        current: reducers.getValidator(s, p.id),
        image: reducers.getCurrentImage(s),
        fields: reducers.getCurrentImagefields(s),
        validatorKindList: reducers.getValidatorEngines(s)
    }),
    {
        imageGet,
        validatorGetCallback,
        validatorUpdateRedux,
        validatorClear,
        validatorUpdate,
        imageGetValidators,
        addMessage,
        registeredEngines
    }
);

export interface ValidatorEditorState {
    current?: ValidatorModel;
    editJSON: boolean;
    modified: boolean;
}

class ValidatorEditor extends conn.StatefulCompo<ValidatorEditorState> {
    config: { [kind: number]: any };
    oldkind: any;
    refJsonEditor: JsonEditorGet | null;

    constructor(props: any) {
        super(props);
        this.config = {};
        let copy: ValidatorModel | undefined = this.copyFrom(props.current);
        this.state = { current: copy as ValidatorModel, editJSON: false, modified: false };
    }

    copyFrom = (curr: ValidatorModel) => {
        if (curr === undefined) return undefined;
        let copy: ValidatorModel = { ...curr };
        let config: any = { ...curr.config };
        config.value = { ...(config && config.value || {}) };
        copy.config = config;
        return copy;
    }


    componentDidUpdate(prevProps: any, prevState: ValidatorEditorState): void {
        // solo una volta se this.state.current è undefined
        if (this.state.current === undefined && this.props.current) {
            let copy: ValidatorModel | undefined = this.copyFrom(this.props.current);
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
        this.props.registeredEngines();
        this.validatorGet();
    }

    componentWillUnmount(): void {
        this.props.validatorClear(this.props.id);
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
        } else {
            this.config[kind] = { ...value };
        }
        if (newItem.config && newItem.config.value) {
            newItem.config.value = this.config[kind];
        }
    }

    changeState = (newItem: ValidatorModel, modified: boolean = true) => {
        this.updateCurrType(newItem);
        this.setState({ current: newItem, modified });
    }

    onEdit = () => this.setState({ modified: false });


    onCancel = () => {
        let copy: ValidatorModel | undefined = this.copyFrom(this.props.current as ValidatorModel);
        this.config = {};
        let kind: string | undefined = undefined;
        if (copy) {
            kind = copy.kind;
            if (kind !== undefined)
                this.config[kind] = { ...(copy.config && copy.config.value || {}) };
        }
        this.oldkind = kind;
        this.setState({ current: copy as ValidatorModel, modified: false });
    }

    validatorGet = () => {
        this.props.validatorGetCallback({
            id: this.props.id,
            call: (res: any) => {
                if (res) {
                    if (res.Errors && res.Errors.length > 0) {
                        this.props.addMessage({
                            id: 'get-validator',
                            modal: true,
                            stackable: true,
                            timed: false,
                            typeMessage: TypeMessage.Error,
                            title: 'Error',
                            message: res.Errors[0]
                        });
                    } else {
                        let validator: ValidatorModel = res as ValidatorModel;
                        let idValidator: string | undefined = validator && validator.id;
                        // let idImage: string | undefined = validator.image;
                        if (idValidator) {
                            this.props.validatorUpdateRedux({ param: idValidator, result: validator });
                            // this.props.imageGetValidators(idImage);
                            // this.props.imageGet(idImage);
                        }
                    }
                }
            }
        });
    }

    validateValidator = (item: ValidatorModel) => {
        if (item.name === undefined || item.name === null || item.name === '') return 'Name cannot be empty';
        if (item.kind === ValidatorEngineKind.DEFAULT
            && item.config
            && item.config.value
            && item.config.value.rules) {
            let rules: RuleConfig[] = item.config.value.rules;
            let index: number = rules.findIndex(r => r.name === undefined || r.name.length === 0);
            if (index > -1) {
                return 'Rule Name at index: ' + (index + 1) + ' must be not empty';
            }
        }
        return '';
    }

    internalSave = (item: any) => {
        if (item && this.props.validatorUpdate) {
            let message: string = this.validateValidator(item as ValidatorModel);
            if (message && message.length > 0) {
                this.props.addMessage({
                    id: 'save-validator',
                    modal: false,
                    stackable: false,
                    timed: false,
                    typeMessage: TypeMessage.Warning,
                    title: 'Warning',
                    message: message
                });
            } else {
                this.props.validatorUpdate(item);
                this.setState({ ...this.state, modified: false });
            }
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
                        <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>VALIDATOR for image:</div>
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
                : 'VALIDATOR';

            return (
                <React.Fragment>
                    <HeaderMenuWidget modified={modified} header={header} icon={'edit'} disabled={false}>

                        {modified && dialogMenuWidget(modified, 'Save', this.onSave, 'save', 'Are you sure you want to save the changes?', { color: 'green' })}
                        {modified && dialogMenuWidget(modified, 'Cancel', this.onCancel, 'reply', 'Are you sure you want to loose your changes?')}
                        {!modified && <Menu.Item as={Link} to={`/Validators/new`} icon="plus" content="New" />}
                        <Menu.Item content={'JSON'} icon={'file alternate outline'} onClick={() => this.changeStateJSON()} style={styleJS} />

                    </HeaderMenuWidget>

                    <Segment>
                        {!editJSON &&
                            <ValidatorItem
                                validatorKindList={this.props.validatorKindList}
                                fields={this.props.fields}
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

export default conn.connect(ValidatorEditor);