import * as React from 'react';
import { Input, Segment } from 'semantic-ui-react';
import { FlowModel, ImageModel, WriterModel, AggregatorModel } from '../../actions/model';
import { TableEditableWidget, RowEditableWidget } from '../shared/EditableWidget';
import { JsonEditorWidget } from '../shared/JsonEditorWidget';
import { DropImageItem } from '../shared/items/objectItem/DropImageItem';
import { DropWriterItem } from '../shared/items/objectItem/DropWriterItem';
import { ArrayContainer } from '../shared/items/ArrayContainer';
import { InputValue } from '../shared/items/InputValue';
import FlowDropAggregator from './FlowDropAggregator';
import { ArrayContainerSearch } from '../shared/items/ArrayContainerSearch';
import FlowDropValidator from './FlowDropValidator';
import { FlowItemDefinition, WriterDefinition } from 'mglib-faro.webclient/MGLib_FARO.WEBAPI';
import { withResult } from 'src/actions/proxy';



interface FlowItemProps {
    item?: FlowModel;
    searchImages?: ImageModel[];
    searchWriters?: WriterModel[];
    aggregators?: AggregatorModel[];
    disabled?: boolean;
    editJSON?: boolean;
    modified?: boolean;
    onEdit?: (where: string, id: string) => void;
    onChange?: (item: FlowModel) => void;
}

interface FlowItemState {

}

type CheckedWriterProps = {
    currentItem: FlowItemDefinition;
    modified?: boolean;
    disabled: boolean;
    onEdit?: (where: string, id: string) => void;
    changeProp: (scope: string, val: any) => void;
};

const CheckedWriter = ({ currentItem, modified, disabled, onEdit, changeProp }: CheckedWriterProps) => {
    const [checkedWriters, setCheckedWriters] = React.useState<WriterDefinition[]>();
    React.useEffect(() => {
        const getData = async () => {
            if (currentItem.image) {
                const aggId = currentItem.aggregator ? `?aggregatorId=${currentItem.aggregator}` : '';
                const data = await withResult(fetch(`/api/v1/Image/${currentItem.image}/writers${aggId}`).then(r => r.json()));
                return data as WriterDefinition[];
            }
            return [];
        };
        getData().then(setCheckedWriters);
    }, [currentItem.image, currentItem.aggregator]);

    return (
        <DropWriterItem
            modified={modified}
            onEdit={(where: string, id: string) => onEdit && onEdit(where, id)}
            disabled={disabled}
            listWriter={checkedWriters}
            value={currentItem.writer}
            onChange={(name: string, newValue: string) => changeProp('writer', newValue)}
        />
    );
};

export class FlowItem extends React.PureComponent<FlowItemProps> {

    handlerChange = (newItem: FlowModel) => {
        const { onChange, disabled } = this.props;
        if (onChange && !disabled) onChange(newItem);
    }

    changePropImage = (value: any) => {
        let img: FlowModel = { ...this.props.item, ['image']: value };
        img.validator = undefined;
        img.aggregator = undefined;
        img.writer = undefined;
        this.handlerChange(img);
    }

    changePropAggregator = (value: any) => {
        let img: FlowModel = { ...this.props.item, ['aggregator']: value };
        img.writer = undefined;
        this.handlerChange(img);
    }

    changeProp = (prop: keyof FlowModel, value: any) => {
        this.handlerChange({ ...this.props.item, [prop]: value });
    }

    JsonViewerWidget = (props: { name: string, item: any, disabled: boolean }) => {
        const { name, item, disabled } = props;
        return (
            <JsonEditorWidget key={name} name={name} item={item} disabled={disabled} onChange={this.changeProp} />
        );
    }


    render() {
        const { item, modified, disabled = true } = this.props;
        if (!this.props.searchImages) return null;

        const currentItem = item
            ? { ...item }
            : {
                name: '',
                description: '',
                image: '',
                aggregator: '',
                tags: [],
                validator: '',
                writer: '',

            } as FlowModel;


        return currentItem && (
            <TableEditableWidget edit={!disabled}>
                <RowEditableWidget label="Name" >
                    <Input fluid type="text" value={currentItem.name || ''} onChange={(e, v) => this.changeProp('name', v.value)} />
                </RowEditableWidget>

                <RowEditableWidget label="Description" >
                    <Input fluid type="text" value={currentItem.description || ''} onChange={(e, v) => this.changeProp('description', v.value)} />
                </RowEditableWidget>

                <RowEditableWidget label="Tags" >
                    <Segment disabled={disabled} basic attached="bottom">
                        <ArrayContainerSearch showRowNumber={true} defaultValue={null} showAdd showDelete value={currentItem.tags || []} disabled={disabled} name={'tags'} onChange={this.changeProp}>
                            <InputValue />
                        </ArrayContainerSearch>
                    </Segment>
                </RowEditableWidget>

                <RowEditableWidget label="Image" >
                    <DropImageItem
                        modified={modified}
                        onEdit={(where: string, id: string) => this.props.onEdit && this.props.onEdit(where, id)}
                        listImage={this.props.searchImages}
                        value={currentItem.image}
                        onChange={(name: string, newValue: string) => this.changePropImage(newValue)}
                    />
                </RowEditableWidget>

                <RowEditableWidget label="Validator" >
                    <FlowDropValidator
                        modified={modified}
                        onEdit={(where: string, id: string) => this.props.onEdit && this.props.onEdit(where, id)}
                        idImage={currentItem.image || ''}
                        validator={currentItem.validator}
                        onChange={(newValue: string) => this.changeProp('validator', newValue)}
                    />
                </RowEditableWidget>

                <RowEditableWidget label="Aggregator" >
                    <FlowDropAggregator
                        modified={modified}
                        onEdit={(where: string, id: string) => this.props.onEdit && this.props.onEdit(where, id)}
                        idImage={currentItem.image || ''}
                        aggregator={currentItem.aggregator}
                        onChange={(newValue: string) => this.changePropAggregator(newValue)}
                    />
                </RowEditableWidget>

                <RowEditableWidget label="Writer" >
                    <CheckedWriter
                        changeProp={this.changeProp}
                        currentItem={currentItem}
                        modified={modified}
                        onEdit={this.props.onEdit}
                        disabled={disabled}
                    />

                    {/* <DropWriterItem                        
                        modified={modified}
                        onEdit={(where: string, id: string) => this.props.onEdit && this.props.onEdit(where, id)}
                        disabled={disabled}
                        listWriter={checkedWriters}
                        value={currentItem.writer}
                        onChange={(name: string, newValue: string) => this.changeProp('writer', newValue)}
                    /> */}
                </RowEditableWidget>


            </TableEditableWidget>
        );




    }
}