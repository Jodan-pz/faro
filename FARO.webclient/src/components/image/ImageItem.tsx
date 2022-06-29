import * as React from 'react';
import { Input, Segment } from 'semantic-ui-react';
import { DecoratorModel, ImageModel, KeysIteratorModel } from '../../actions/model';
import { RowEditableWidget, TableEditableWidget } from '../shared/EditableWidget';
import { ArrayContainerSearch } from '../shared/items/ArrayContainerSearch';
import { InputValue } from '../shared/items/InputValue';
import { ImageKeyList } from '../shared/items/objectItem/ImageKeyList';
import { ViewImageLayers } from '../shared/items/objectItem/ViewImageLayers';
import { JsonEditorWidget } from '../shared/JsonEditorWidget';
  
interface ImageItemProps {
    modified?: boolean;
    onEdit?: (where: string, id: string) => void;
    item?: ImageModel;
    searchKeys?: Array<KeysIteratorModel>;
    searchDecorators?: Array<DecoratorModel>;
    disabled?: boolean;
    editJSON?: boolean;
    onChange?: (item: ImageModel) => void;
}

interface ImageItemState {
    item?: ImageModel;
}

export class ImageItem extends React.PureComponent<ImageItemProps> {
    handlerChange = (newItem: ImageModel) => {
        const { onChange, disabled } = this.props;
        if (onChange && !disabled) onChange(newItem);
    }
    changeProp = (prop: keyof ImageModel, value: any) => {
        this.handlerChange({ ...this.props.item, [prop]: value });
    }
    JsonViewerWidget = (props: { name: string, item: any, disabled: boolean }) => {
        const { name, item, disabled } = props;
        return (
            <JsonEditorWidget key={name} name={name} item={item} disabled={disabled} onChange={this.changeProp} />
        );
    }

    toStringKeys(): Array<{ id: string, name: string }> {
        let itemToChoose: Array<{ id: string, name: string }> = [];
        if (this.props.searchKeys && this.props.searchKeys.length > 0) {
            this.props.searchKeys.forEach((value: KeysIteratorModel, index: number) => {
                if (value.name !== undefined) {
                    itemToChoose.push({ id: value.id!, name: value.name });
                }
            });
        }
        return itemToChoose;
    }

    render() {
        const { item, disabled = true } = this.props;

        if (item === undefined) return null;

        const currentItem = item
            ? { ...item }
            : {
                name: '',
                keys: [],
                layers: []
            } as ImageModel;



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
                        <ArrayContainerSearch showRowNumber defaultValue={''} showAdd showDelete value={currentItem.tags || []} disabled={disabled} name={'tags'} onChange={this.changeProp} >
                            <InputValue />
                        </ArrayContainerSearch>
                    </Segment>
                </RowEditableWidget>

                <RowEditableWidget label="Keys" >

                    <ImageKeyList
                        value={currentItem.keys || []}
                        onChange={this.changeProp}
                        disabled={disabled}
                        name={'keys'}
                        searchKeys={this.props.searchKeys}
                    />

                </RowEditableWidget>

                <RowEditableWidget label="Filter" >
                    <Input fluid type="text" value={currentItem.filter || ''} onChange={(e, v) => this.changeProp('filter', v.value)} />
                </RowEditableWidget>

                <RowEditableWidget label="Layers">
                    <Segment attached="bottom">
                        <ViewImageLayers
                            searchKeys={this.props.searchKeys}
                            searchDecorators={this.props.searchDecorators}
                            value={currentItem.layers || []}
                            selectedKeys={currentItem.keys || []}
                            disabled={disabled}
                            name="layers"
                            onChange={(name: string | number, newValue: any) => this.changeProp('layers', newValue)}
                        />
                    </Segment>
                </RowEditableWidget>

            </TableEditableWidget>
        );

    }
}


/*
<ArrayContainer defaultValue={{ name: 'new', items: {} }} showAdd showDelete value={currentItem.layers} disabled={disabled} name={'layers'} onChange={this.changeProp} >
                            <LayerItem />

                        </ArrayContainer>


<RowEditableWidget label="Source">
    <this.JsonViewerWidget name="source" item={currentItem.source} disabled={disabled} />
</RowEditableWidget>
<RowEditableWidget label="Args">
    <this.JsonViewerWidget name="args" item={currentItem.args} disabled={disabled} />
</RowEditableWidget>
<RowEditableWidget label="Fields">
    <this.JsonViewerWidget name="fields" item={currentItem.fields} disabled={disabled} />
</RowEditableWidget>

*/