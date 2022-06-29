import * as React from 'react';
import { HeaderMenuWidget, dialogMenuWidget } from '../shared/MenuWidget';
import { Menu, Segment, Table } from 'semantic-ui-react';
import { Copy } from '../shared/Copy';
import { ConfirmWidget } from '../shared/DialogWidget';
import { DecoratorItem } from './DecoratorItem';
import { TableEditableWidget } from '../shared/EditableWidget';
import { JsonEditorGet } from '../shared/JsonEditorGet';
import { DecoratorModel } from 'src/actions/model';
import { Link } from 'app-support';

interface DecoratorContentEditorProps {
    current: DecoratorModel;
    sourceTypeList: Array<string>;
    editJSON: boolean;
    modified: boolean;
    onSave: () => void;
    onCancel: () => void;
    cloneItem?: () => void;
    changeStateJSON: () => void;
    changeState: (newItem: DecoratorModel, modified: boolean) => void;
    onRefJsonEditor: (refJsonEditor: JsonEditorGet | null) => void;
}

export class DecoratorContentEditor extends React.PureComponent<DecoratorContentEditorProps> {

    render() {
        const { current, editJSON, modified, sourceTypeList, onSave, onCancel, cloneItem, changeStateJSON, changeState, onRefJsonEditor } = this.props;
        let styleJS: React.CSSProperties = {
            backgroundColor: editJSON ? 'green' : 'white'
        };
        return (
            <React.Fragment>
                <HeaderMenuWidget modified={modified} header="DECORATORS" icon="edit" disabled={false}>
                    {!modified && <Menu.Item >
                        <Copy
                            button={{ color: 'green' }}
                            textProvider={() => {
                                return JSON.stringify(current, null, 2);
                            }}
                        />
                    </Menu.Item>}
                    {modified && dialogMenuWidget(modified, 'Save', onSave, 'save', 'Are you sure you want to save the changes?', { color: 'green' })}
                    {modified && dialogMenuWidget(modified, 'Cancel', onCancel, 'reply', 'Are you sure you want to loose your changes?')}
                    {!modified && cloneItem && <Menu.Item as={Link} to={`/Decorators/new`} icon="plus" content="New" />}
                    {!modified && cloneItem &&
                        <ConfirmWidget
                            children={`Are you sure you want to clone ${current.name} item?`}
                            onConfirm={cloneItem}
                            trigger={<Menu.Item icon="clone outline" content="Clone" />}
                        />}
                    {!modified && cloneItem && <Menu.Item as={Link} to={`/Decorators/Usage/${current.id}`} icon="linkify" content="Usage" />}
                    {!modified && cloneItem && <Menu.Item as={Link} to={`/Decorators/${current.id}/run`} icon="play" content="Run" />}
                    <Menu.Item content={'JSON'} icon={'file alternate outline'} onClick={changeStateJSON} style={styleJS} />
                </HeaderMenuWidget>

                <Segment>
                    {!editJSON &&
                        <DecoratorItem
                            sourceTypeList={sourceTypeList}
                            item={current}
                            editJSON={editJSON}
                            disabled={false}
                            onChange={(item: DecoratorModel) => changeState(item, true)}
                        />}

                    {editJSON &&
                        <TableEditableWidget>
                            <Table.Row>
                                <Table.Cell>
                                    <JsonEditorGet
                                        newitem={!modified}
                                        item={current}
                                        ref={r => onRefJsonEditor(r)}
                                        onModified={(modified: boolean) => changeState(current, modified)}
                                    />
                                </Table.Cell>
                            </Table.Row>

                        </TableEditableWidget>
                    }
                </Segment>
            </React.Fragment >
        );
    }
}