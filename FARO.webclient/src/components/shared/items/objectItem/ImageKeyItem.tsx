import { Link } from 'app-support';
import * as React from 'react';
import { Button, Container } from 'semantic-ui-react';
import { createHideProp, infoPopup } from 'src/components/lib/UtilLib';
import { ArgumentModel, ImageKeysIteratorsDefinitionModel, ItemValue, OutputFieldModel, ValueFieldKey } from '../../../../actions/model';
import '../../../../styles/items/items.css';
import { DropValue } from '../DropValue';
import { InputValue } from '../InputValue';
import { LabeledContainerItem } from '../LabeledContainer';
import { OpenableRow } from '../OpenableRow';


interface ImageKeyItemProps extends ItemValue<ImageKeysIteratorsDefinitionModel> {
    dropValueKeys: Array<ValueFieldKey>;
}

export class ImageKeyItem extends React.Component<ImageKeyItemProps, {}> {

    constructor(props: any) {
        super(props);
    }

    onChange = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            this.props.onChange(name, newValue);
        }
    }

    onChangeArg = (name: string | number, newValue: any) => {
        if (newValue !== undefined) {
            let item: ImageKeysIteratorsDefinitionModel = { ...this.props.value };
            if (item.args === undefined || item.args === null) item.args = {};
            if (newValue.length === 0) delete item.args[name];
            else item.args[name] = newValue;
            let thereis: boolean = false;
            for (const key in item.args) {
                if (item.args.hasOwnProperty(key)) {
                    thereis = true;
                    break;
                }
            }
            if (!thereis) item.args = undefined;
            this.onChange(this.props.name === undefined ? '' : this.props.name, item);
        }
    }

    onChangeField = (name: string | number, newValue: any) => {
        if (newValue !== undefined) {
            let item: ImageKeysIteratorsDefinitionModel = { ...this.props.value };
            if (item.fields === undefined || item.fields === null) item.fields = {};
            if (newValue.length === 0) delete item.fields[name];
            else item.fields[name] = newValue;
            let thereis: boolean = false;
            for (const key in item.fields) {
                if (item.fields.hasOwnProperty(key)) {
                    thereis = true;
                    break;
                }
            }

            if (!thereis) item.fields = undefined;

            this.onChange(this.props.name === undefined ? '' : this.props.name, item);

        }
    }
    onChangeDrop = (name: string | number, newValue: ValueFieldKey) => {
        if (newValue.value.id === null) {
            if (this.props.onChange) {
                this.props.onChange(this.props.name === undefined ? '' : this.props.name, {});
            }
        } else {
            if ((this.props.value as ImageKeysIteratorsDefinitionModel).keyid !== newValue.value.id) {
                let item: ImageKeysIteratorsDefinitionModel = { ...this.props.value };
                item.keyid = newValue.value.id;
                delete item.args;
                delete item.fields;
                this.onChange(this.props.name === undefined ? '' : this.props.name, item);
            }
        }
    }

    render() {
        const { value, disabled, dropValueKeys, style } = this.props;

        let imageKeysDef: ImageKeysIteratorsDefinitionModel = value as ImageKeysIteratorsDefinitionModel;
        let keyid: string | null = imageKeysDef.keyid ? imageKeysDef.keyid : null;
        let selectedImageKeysDef: ValueFieldKey | undefined = dropValueKeys.find((v: ValueFieldKey) => v.value.id === keyid);
        let fieldsObject: any = imageKeysDef.fields ? imageKeysDef.fields : {};
        let argsObject: any = imageKeysDef.args ? imageKeysDef.args : {};
        let fields: OutputFieldModel[] = [];
        let args: ArgumentModel[] = [];
        if (selectedImageKeysDef !== undefined) {
            fields = selectedImageKeysDef.value.fields;
            args = selectedImageKeysDef.value.args;
        }


        let message: Array<any> = [];

        let thereisfields: boolean = fields.length > 0;
        let thereisargs: boolean = args.length > 0;
        let message1: Array<any> = createHideProp(fieldsObject, [] );
        let message2: Array<any> = createHideProp(argsObject, [] );
        if (message1.length > 0) message1.unshift(infoPopup('FIELDS', undefined, 'green', 'green'));
        if (message2.length > 0) message2.unshift(infoPopup('ARGUMENTS', undefined, 'green', 'green'));
        message = message2.concat(message1);

        let link: string = '/KeysIterator/' + (keyid !== null ? keyid : '') + '/edit';

        return (

            <OpenableRow columns={2} style={style} message={message} alternateCellStyle={[{width: '5%'}, {width: '95%'}]}>
                <div style={{  margin: 'auto', width: '40px', height: '40px' }}>
                    <Button circular disabled={keyid === null} size={'small'}  as={Link} to={link} icon="arrow alternate circle right" />    
                </div>    
                 
                <LabeledContainerItem  style={{ width: '100%' }} label={selectedImageKeysDef ? selectedImageKeysDef.description : ''}>
                    <DropValue
                        style={{ width: '100%' }}
                        selection
                        search
                        name="keyid"
                        keyValue="text"
                        onChange={this.onChangeDrop}
                        disabled={disabled}
                        value={selectedImageKeysDef}
                        items={dropValueKeys}
                    />
                </LabeledContainerItem>
               

                <div style={{  margin: 'auto', width: '40px', height: '40px'  }}  />
                
               
                <Container style={{ display: 'flex', width: '100%' }} >

                    {thereisargs && <ArgBox name="args" style={{backgroundColor: 'red'}} argsData={argsObject} value={args} onChange={this.onChangeArg} />}

                    {thereisfields && <FieldBox name="fields" style={{backgroundColor: 'green'}} fieldsData={fieldsObject} value={fields} onChange={this.onChangeField} />}

                </Container>
               
               

            </OpenableRow>

        );
    }
}


interface FieldBoxProps extends ItemValue<OutputFieldModel[]> {
    fieldsData: any;
}

class FieldBox extends React.Component<FieldBoxProps, {}> {
    render() {
        const { value, fieldsData } = this.props;
        let fields: OutputFieldModel[] = value as OutputFieldModel[];

        return (
            <LabeledContainerItem label={'FIELDS'} labelColor={'green'} style={{ textAlign: 'center' }}>
                <div style={{ display: 'block', width: '100%', padding: '6px' }}>
                    {fields.map((field: OutputFieldModel, index: number) => {
                        let name: string = field.name ? field.name : '';
                        let value: any = fieldsData[name];
                        return (
                            <LabeledContainerItem
                                style={{ marginTop: '5px', backgroundColor: 'lightgrey', textAlign: 'left' }}
                                key={name}
                                label={name}
                                value={value}
                                name={name}
                                onChange={this.props.onChange}
                            >
                                <InputValue />
                            </LabeledContainerItem>);
                    })}
                </div>
            </LabeledContainerItem>);
    }
}
interface ArgBoxProps extends ItemValue<ArgumentModel[]> {
    argsData: any;
}

class ArgBox extends React.Component<ArgBoxProps, {}> {
    onChange = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            this.props.onChange(name || '', newValue);
        }
    }

    render() {
        const { value, argsData } = this.props;
        let args: ArgumentModel[] = value as ArgumentModel[];
        return (
            <LabeledContainerItem label={'ARGUMENTS'} labelColor={'green'} style={{ textAlign: 'center' }}>
                <div style={{ display: 'block', width: '100%', padding: '6px' }}>
                    {args.map((arg: ArgumentModel, index: number) => {
                        let name: string = arg.name ? arg.name : '';
                        let value: any = argsData[name];
                        return (
                            <LabeledContainerItem
                                style={{ marginTop: '5px', backgroundColor: 'lightgrey', textAlign: 'left' }}
                                key={name}
                                label={name}
                                value={value}
                                name={name}
                                onChange={this.onChange}
                            >
                                <InputValue />
                            </LabeledContainerItem>);
                    })}
                </div>
            </LabeledContainerItem>
        );
    }
}