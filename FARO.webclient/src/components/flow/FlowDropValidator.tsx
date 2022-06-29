import { appConnector, Link } from 'app-support';
import * as React from 'react';
import * as reducers from '../../reducers';
import { imageGetValidators } from '../../actions';
import { DropValue } from '../shared/items/DropValue';
import { ValidatorModel } from 'src/actions/model';
import { Table, Button, Segment } from 'semantic-ui-react';
import { ConfirmWidget } from '../shared/DialogWidget';
import { ValidatorDefinition } from 'mglib-faro.webclient/MGLib_FARO.WEBAPI';


type ValidatorDrop = {
    text: string;
    description: string;
    id: string | undefined;
    value: number;
};


interface FlowDropValidatorProps {
    onEdit?: (where: string, id: string) => void;
    modified?: boolean;
    validator?: string;
    idImage?: string;
    onChange?: (newValue: string) => void;
    validators?: ValidatorDefinition[];
    disabled?: boolean;
}

const conn = appConnector<FlowDropValidatorProps>()(
    (s, p) => ({
        validators: (!p.idImage) ? p.validators : reducers.getCurrentValidators(s)
    }),
    {
        imageGetValidators
    }
);


interface FlowDropValidatorState {
}

class FlowDropValidator extends conn.StatefulCompo<FlowDropValidatorState> {

    constructor(props: any) {
        super(props);
    }

    loadValidator = (idImage: string) => {
        if (idImage && idImage.length > 0) {
            this.props.imageGetValidators(idImage);
        }
    }

    componentDidMount() {
        if (this.props.idImage) this.loadValidator(this.props.idImage);
    }
    componentDidUpdate(prevProps: any, prevState: any): void {
        if (this.props.idImage && this.props.idImage !== prevProps.idImage) {
            this.loadValidator(this.props.idImage);
        }
    }
    listenerItemChange = (newValue: any) => {
        if (this.props.onChange) {
            this.props.onChange(newValue);
        }
    }
    onConfirm = (where: string, id: string) => {
        if (this.props.onEdit) {
            this.props.onEdit(where, id);
        }
    }
    render() {
        const { validators, validator, modified, disabled } = this.props;
        if (validators) {
            let agg: ValidatorModel[] = validators as ValidatorModel[];

            let items: ValidatorDrop[] = agg.map((a: ValidatorModel, index: number) => {
                return {
                    id: a.id,
                    description: a.description,
                    text: a.name,
                    value: index
                } as ValidatorDrop;
            });

            let current: ValidatorDrop | undefined = items.find(it => it.id === validator);

            let thereis: boolean = items.length > 0;

            if (thereis) {
                items.unshift({
                    id: undefined,
                    description: 'no validator',
                    text: '',
                    value: items.length
                });
            }


            let description: string = !thereis ? 'no validator' : (current && current.description && current.description.length > 0 ? current.description : '');
            let linkId: string = current && current.id && current.id.length > 0 ? current.id : '';
            let enableBTN: boolean = linkId.length > 0;
            let whereGo: string = '/Validators';
            let link: string = whereGo + '/' + linkId + '/edit';

            return (
                <div className="divBox" >
                    <Table style={{ width: '100%' }}>
                        <Table.Body>
                            <Table.Row>
                                <Table.Cell width="2" textAlign="center">
                                    {description}
                                </Table.Cell>
                                <Table.Cell>
                                    <DropValue
                                        style={{ width: '100%' }}
                                        name={'flowdrop'}
                                        selection
                                        search
                                        disabled={disabled || !thereis}
                                        items={items}
                                        keyValue={'text'}
                                        multiple={false}
                                        value={current}
                                        onChange={(name: string | number, newValue: ValidatorDrop) => this.listenerItemChange(newValue.id)}
                                    />
                                </Table.Cell>

                                <Table.Cell width="2">

                                    {!modified && <Button disabled={disabled || !enableBTN} style={{ width: '90%' }} as={Link} to={link} icon="arrow alternate circle right" />}

                                    {modified &&
                                        <ConfirmWidget
                                            children={`The item has not been saved, continue?`}
                                            onConfirm={() => this.onConfirm(whereGo, linkId)}
                                            trigger={
                                                <Button
                                                    disabled={!enableBTN}
                                                    style={{ width: '90%' }}
                                                    icon="arrow alternate circle right"
                                                />
                                            }
                                        />}


                                </Table.Cell>

                            </Table.Row>
                        </Table.Body>
                    </Table>
                </div>);
        }
        return null;
    }

}


export default conn.connect(FlowDropValidator);