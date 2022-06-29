import * as React from 'react';
import { Input, Segment } from 'semantic-ui-react';
import { ValidatorModel, ValidatorEngineKind } from '../../actions/model';
import { TableEditableWidget, RowEditableWidget } from '../shared/EditableWidget';
import { JsonEditorWidget } from '../shared/JsonEditorWidget';
import { InputValue } from '../shared/items/InputValue';
import { ValidatorKind } from '../shared/items/objectItem/ValidatorKind';
import { ConfigValidator } from '../shared/items/objectItem/ConfigValidator';
import { ArrayContainer } from '../shared/items/ArrayContainer';
import { ArrayContainerSearch } from '../shared/items/ArrayContainerSearch';

interface ValidatorItemProps {
    item?: ValidatorModel;
    fields?: Array<string>;
    validatorKindList?: Array<string>;
    nameImage?: string;
    freezeName?: boolean;
    disabled?: boolean;
    editJSON?: boolean;
    onChange?: (item: ValidatorModel) => void;
}


export class ValidatorItem extends React.PureComponent<ValidatorItemProps> {
    handlerChange = (newItem: ValidatorModel) => {
        const { onChange, disabled } = this.props;
        if (onChange && !disabled) onChange(newItem);
    }
    changeProp = (prop: keyof ValidatorModel, value: any) => {

        this.handlerChange({ ...(this.props.item || { kind: ValidatorEngineKind.DEFAULT }), [prop]: value });
    }
    JsonViewerWidget = (props: { name: string, item: any, disabled: boolean }) => {
        const { name, item, disabled } = props;
        return (
            <JsonEditorWidget key={name} name={name} item={item} disabled={disabled} onChange={this.changeProp} />
        );
    }

    render() {
        const { nameImage, item, editJSON, disabled = true } = this.props;

        const currentItem = item
            ? { ...item }
            : {
                name: '',
                id: undefined,
                description: undefined,
                tags: [],
                image: undefined,
                kind: ValidatorEngineKind.DEFAULT,
                config: undefined
            } as ValidatorModel;
        // nameImage
        return currentItem && (
            <TableEditableWidget edit={!disabled}>

                {nameImage !== undefined && nameImage.length > 0 && <RowEditableWidget label="Image">{nameImage}</RowEditableWidget>}

                {!this.props.freezeName &&
                    <RowEditableWidget label="Name" >
                        <Input fluid type="text" value={currentItem.name || ''} onChange={(e, v) => this.changeProp('name', v.value)} />
                    </RowEditableWidget>
                }
                <RowEditableWidget label="Description" >
                    <Input fluid type="text" value={currentItem.description || ''} onChange={(e, v) => this.changeProp('description', v.value)} />
                </RowEditableWidget>

                <RowEditableWidget label="Tags" >
                    <Segment basic attached="bottom">
                        <ArrayContainerSearch showRowNumber={true} defaultValue={''} showAdd showDelete value={currentItem.tags || []} disabled={disabled} name={'tags'} onChange={this.changeProp} >
                            <InputValue />
                        </ArrayContainerSearch>
                    </Segment>
                </RowEditableWidget>

                <RowEditableWidget label="Kind" >
                    {
                        <ValidatorKind 
                            validatorKindList={this.props.validatorKindList}
                            value={currentItem.kind} 
                            disabled={disabled} 
                            name={'kind'} 
                            onChange={this.changeProp} 
                        />
                    }
                </RowEditableWidget>

                <RowEditableWidget label="Config">
                    <Segment basic attached="bottom">
                        {
                            <ConfigValidator
                                fields={this.props.fields}
                                kind={currentItem.kind || ''}
                                disabled={disabled}
                                name={'config'}
                                value={currentItem.config}
                                onChange={this.changeProp}
                            />
                        }
                    </Segment>
                </RowEditableWidget>
            </TableEditableWidget>
        );
    }
}
