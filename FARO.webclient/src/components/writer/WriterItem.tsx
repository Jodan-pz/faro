import * as React from 'react';
import { Input, Segment } from 'semantic-ui-react';
import { WriterModel, WriterEngineKind } from '../../actions/model';
import { TableEditableWidget, RowEditableWidget } from '../shared/EditableWidget';
import { JsonEditorWidget } from '../shared/JsonEditorWidget';
import { ArrayContainer } from '../shared/items/ArrayContainer';
import { InputValue } from '../shared/items/InputValue';
import { ArgsItem } from '../shared/items/objectItem/ArgsItem';
import { WriterKind } from '../shared/items/objectItem/WriterKind';
import { ConfigWriter } from '../shared/items/objectItem/configWriter/ConfigWriter';
import { ArrayContainerSearch } from '../shared/items/ArrayContainerSearch';

interface WriterItemProps {
    item?: WriterModel;
    writerEngineKindList?: string[];
    disabled?: boolean;
    editJSON?: boolean;
    onChange?: (item: WriterModel) => void;
}

export class WriterItem extends React.PureComponent<WriterItemProps> {
    handlerChange = (newItem: WriterModel) => {
        const { onChange, disabled } = this.props;
        if (onChange && !disabled) onChange(newItem);
    }
    changeProp = (prop: keyof WriterModel, value: any) => {
        if (this.props.item)
            this.handlerChange({ ...this.props.item, [prop]: value });
    }
    JsonViewerWidget = (props: { name: string, item: any, disabled: boolean }) => {
        const { name, item, disabled } = props;
        return (
            <JsonEditorWidget key={name} name={name} item={item} disabled={disabled} onChange={this.changeProp} />
        );
    }

    render() {
        const { item, disabled = true } = this.props;
        const currentItem = item
            ? { ...item }
            : {
                name: '',
                description: '',
                kind: WriterEngineKind.CONSOLE,
                args: [],
                config: {}
            } as WriterModel;


        return currentItem && (
            <TableEditableWidget edit={!disabled} >
                <RowEditableWidget label="Name" >
                    <Input fluid type="text" value={currentItem.name || ''} onChange={(e, v) => this.changeProp('name', v.value)} />
                </RowEditableWidget>

                <RowEditableWidget label="Description">
                    <Input fluid type="text" value={currentItem.description || ''} onChange={(e, v) => this.changeProp('description', v.value)} />
                </RowEditableWidget>

                <RowEditableWidget label="Tags" >
                    <Segment basic attached="bottom">
                        <ArrayContainerSearch showRowNumber={true} defaultValue={''} showAdd showDelete value={currentItem.tags || []} disabled={disabled} name={'tags'} onChange={this.changeProp}>
                            <InputValue />
                        </ArrayContainerSearch>
                    </Segment>
                </RowEditableWidget>

                <RowEditableWidget label="Kind">

                    <WriterKind
                        writerEngineKindList={this.props.writerEngineKindList}
                        value={currentItem.kind || ''}
                        disabled={disabled}
                        name={'kind'}
                        onChange={this.changeProp}
                    />

                </RowEditableWidget>

                <RowEditableWidget label="Args">
                    <Segment basic attached="bottom">
                        <ArrayContainerSearch showRowNumber={true} height={'200px'} defaultValue={{ name: 'new', description: '' }} showAdd showDelete value={currentItem.args} disabled={disabled} name={'args'} onChange={this.changeProp}>
                            <ArgsItem />
                        </ArrayContainerSearch>
                    </Segment>
                </RowEditableWidget>

                {currentItem.kind !== WriterEngineKind.CONSOLE && <RowEditableWidget label="Config">
                    <Segment basic attached="bottom">
                        <ConfigWriter
                            definition={currentItem}
                            disabled={disabled}
                            name={'config'}
                            value={currentItem.config}
                            onChange={this.changeProp}
                        />
                    </Segment>
                </RowEditableWidget>}
            </TableEditableWidget>
        );

    }
}