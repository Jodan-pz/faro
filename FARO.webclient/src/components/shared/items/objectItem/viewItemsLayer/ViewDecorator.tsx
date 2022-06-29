import * as React from 'react';
import { ItemValue, KeysIteratorModel, DecoratorModel, ArgumentModel, ArgsType } from '../../../../../actions/model';
import { getSplitDecorator,  getFields, getArgsObjects } from '../../../../../components/Utils';
import {  Segment, Table } from 'semantic-ui-react';
import { InputValue } from '../../InputValue';
import { LabeledContainerItem } from '../../LabeledContainer';
import { DropDecoratorItem } from '../DropDecoratorItem';
import { DropValue } from '../../DropValue';

type TypeObject = {
    decorator: string;
    args?: { [key: string]: string };
};

interface ViewDecoratorProps extends ItemValue<any> {
    searchKeys?: Array<KeysIteratorModel>;
    searchDecorators?: Array<DecoratorModel>;
}

export class ViewDecorator extends React.Component<ViewDecoratorProps, {}> {
    nameDec: string;
    fieldOut: string;
    listArgs: Array<any>;

    changeArgs = (name: string | number, newValue: any) => {
        const { value } = this.props;
        let objArgs: any = { ...value.args || {} };
        objArgs[newValue.key] = newValue.value;
        let clone: TypeObject = { ...value, args: objArgs };
        if (this.props.onChange) {
            this.props.onChange(this.props.name || '', clone);
        }
    }
    changeFields = (name: string | number, newValue: any) => {
        const { value } = this.props;
        let objArgs: any = { ...value.args || {} };
        let objSplit: any = getSplitDecorator(value.decorator);
        let dec: string = objSplit.id + (newValue.length > 0 ? '.' + newValue : '');
        let clone: TypeObject = {
            decorator: dec,
            args: objArgs
        };
        if (this.props.onChange) {
            this.props.onChange(this.props.name || '', clone);
        }
    }
    changeDecorator = (name: string | number, newValue: any) => {
        const { value, searchDecorators } = this.props;
        // let objArgs: any = value && value.args && { ...value.args } || {};
        let objArgs: any = {};

        let fields: Array<string> = getFields(newValue, searchDecorators);
        let fieldOut: string = fields.length >= 0 ? fields[0] : '';
        let dec: string = (newValue as string) + (fieldOut && fieldOut.length > 0 ? '.' + fieldOut : '');
        let clone: TypeObject = {
            decorator: dec,
            args: objArgs
        };
        if (this.props.onChange) {
            this.props.onChange(this.props.name || '', clone);
        }
    }



    render() {
        const { value, searchKeys, searchDecorators } = this.props;

        let objArgs: any = value && value.args || {};
        let decorator: string = value && value.decorator || '';
        let objSplit: any = getSplitDecorator(decorator);
        let fields: Array<string> = getFields(objSplit.id, searchDecorators);
        if (objSplit.field.length === 0 && fields.length > 0) objSplit.field = fields[0];

        let listArgs: Array<ArgumentModel> = getArgsObjects(objSplit.id, searchDecorators);
        let list: Array<ArgsType> = listArgs.map((element: ArgumentModel, indewx: number) => {
            let key: string = element.name || '';
            let val: string = objArgs[key] || '';
            return {
                index: indewx,
                key: key,
                value: val,
                description: element.description ? element.description : ''
            } as ArgsType;
        });
        let styleLab: React.CSSProperties = { marginBottom: '4px' };
        return (
            <Segment style={{ width: '100%' }}>

                <LabeledContainerItem style={{ ...styleLab }} key={objSplit.id + objSplit.field + 'a'} label="Decorator:" value={objSplit.id || ''} name={'decorator'} onChange={this.changeDecorator}>
                    <DropDecoratorItem listDecorators={searchDecorators} />
                </LabeledContainerItem>

                <LabeledContainerItem style={{ ...styleLab }} key={objSplit.id + objSplit.field + 'b'} value={objSplit.field} label="Field output:" name={'output'} onChange={this.changeFields}>
                    <DropValue items={fields} selection />
                </LabeledContainerItem>

                {list && list.length > 0 &&
                    <Table style={{ width: '100%' }}>
                        <Table.Body>
                            {list.map((element: ArgsType, index: number) => {
                                return (
                                    <Table.Row key={index} >
                                        <ArgsValue
                                            value={element}
                                            name={index}
                                            onChange={this.changeArgs}
                                        />
                                    </Table.Row>);
                            })}
                        </Table.Body>
                    </Table>
                }
            </Segment>);
    }
}

interface ArgsValueProps extends ItemValue<ArgsType> {
}

class ArgsValue extends React.Component<ArgsValueProps, {}> {

    changeValue = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            const { value } = this.props;
            let val: ArgsType = value as ArgsType;
            val.value = newValue;
            this.props.onChange(this.props.name || '', { ...val });
        }
    }
    render() {
        const { value } = this.props;
        let val: ArgsType = value as ArgsType;
        let key: string = val.key;
        let description: string = val.description;

        return (
            <React.Fragment>
                <Table.Cell width="1" textAlign="right"> {key}: </Table.Cell>
                <Table.Cell width="6" ><InputValue value={val.value} name={val.key} onChange={this.changeValue} /></Table.Cell>
                {description && description.length > 0 && <Table.Cell width="2" textAlign="left"> {description} </Table.Cell>}
            </React.Fragment>
        );
    }
}
