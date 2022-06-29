import * as React from 'react';
import { Input, Segment } from 'semantic-ui-react';
import { DecoratorModel, DecoratorSourceType } from '../../actions/model';
import { TableEditableWidget, RowEditableWidget } from '../shared/EditableWidget';
import { JsonEditorWidget } from '../shared/JsonEditorWidget';
import { ArgsItem } from '../shared/items/objectItem/ArgsItem';
import { ArrayContainer } from '../shared/items/ArrayContainer';
import { InputValue } from '../shared/items/InputValue';
import { SourceItem } from '../shared/items/objectItem/SourceItem';
import { ArrayContainerSearch } from '../shared/items/ArrayContainerSearch';
import { FieldItem } from '../shared/items/objectItem/FieldItem';
import { alternateStyle } from '../lib/UtilLib';

interface DecoratorItemProps {
    sourceTypeList?: string[];
    item?: DecoratorModel;
    disabled?: boolean;
    editJSON?: boolean;
    onChange?: (item: DecoratorModel) => void;
}


export class DecoratorItem extends React.PureComponent<DecoratorItemProps> {
    handlerChange = (newItem: DecoratorModel) => {
        const { onChange, disabled } = this.props;
        if (onChange && !disabled) onChange(newItem);
    }
    changeProp = (prop: keyof DecoratorModel, value: any) => {
        this.handlerChange({ ...this.props.item, [prop]: value });
    }
    JsonViewerWidget = (props: { name: string, item: any, disabled: boolean }) => {
        const { name, item, disabled } = props;
        return (
            <JsonEditorWidget key={name} name={name} item={item} disabled={disabled} onChange={this.changeProp} />
        );
    }

    render() {
        const { item, editJSON, disabled = true } = this.props;
        const currentItem = item
            ? { ...item }
            : {
                args: [{ name: '', description: '', optional: false }],
                name: '',
                description: '',
                tags: [],
                fields: [],
                source: { type: DecoratorSourceType.WEBAPI, args: {} }
            } as DecoratorModel;

        return currentItem && (
            <TableEditableWidget edit={!disabled}>

                <RowEditableWidget label="Name" >
                    <Input fluid type="text" value={currentItem.name || ''} onChange={(e, v) => this.changeProp('name', v.value)} />
                </RowEditableWidget>

                <RowEditableWidget label="Description" >
                    <Input fluid type="text" value={currentItem.description || ''} onChange={(e, v) => this.changeProp('description', v.value)} />
                </RowEditableWidget>
                
                <RowEditableWidget label="Tags" >
                    <Segment basic attached="bottom">
                        <ArrayContainerSearch showRowNumber={true} defaultValue={''} showAdd showDelete value={currentItem.tags || []} disabled={disabled} name={'tags'} onChange={this.changeProp}>
                            <InputValue />
                        </ArrayContainerSearch>
                    </Segment>
                </RowEditableWidget>

                <RowEditableWidget label="Args">
                    <Segment basic attached="bottom">
                        <ArrayContainerSearch  showRowNumber={true} height={'140px'} defaultValue={{}} showAdd showDelete value={currentItem.args} disabled={disabled} name={'args'} onChange={this.changeProp} >
                            <ArgsItem />
                        </ArrayContainerSearch>
                    </Segment>
                </RowEditableWidget>

                <RowEditableWidget label="When">
                    <Segment basic attached="bottom">
                        <InputValue value={(currentItem as any).when} disabled={disabled} name={'when'} onChange={this.changeProp} />
                    </Segment>
                </RowEditableWidget>


                <RowEditableWidget label="Source">
                    <Segment basic attached="bottom">
                        <SourceItem 
                            sourceTypeList={this.props.sourceTypeList}
                            decorator 
                            value={currentItem.source} 
                            disabled={disabled} 
                            name={'source'} 
                            onChange={this.changeProp} 
                        />
                    </Segment>
                </RowEditableWidget>

                <RowEditableWidget label="Fields">
                    <Segment basic attached="bottom">
                        <ArrayContainerSearch alternateStyle={alternateStyle()} showRowNumber={true} height={'300px'} defaultValue={''} showAdd showDelete value={currentItem.fields} disabled={disabled} name={'fields'} onChange={this.changeProp} >
                            <FieldItem />
                        </ArrayContainerSearch>
                    </Segment>

                </RowEditableWidget>
            </TableEditableWidget>
        );

    }
}