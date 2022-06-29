import * as React from 'react';
import { HeaderMenuWidget, dialogMenuWidget } from '../shared/MenuWidget';
import { Copy } from '../shared/Copy';
import { Menu, Segment } from 'semantic-ui-react';
import { ConfirmWidget } from '../shared/DialogWidget';
import { KeysIteratorItem } from './KeysIteratorItem';
import { TableEditableWidget } from '../shared/EditableWidget';
import { JsonEditorGet } from '../shared/JsonEditorGet';
import { Link } from 'app-support';
import { KeysIteratorModel } from 'src/actions/model';


interface KeysIteratorContentEditorProps { 
    modified: boolean;
    editJSON: boolean;
    current: KeysIteratorModel | undefined;
    sourceTypeList: Array<string>;
    onSave: () => void;
    onCancel: () => void;
    cloneItem?: () => void;
    onRefJsonEditor: ( refJsonEditor: JsonEditorGet | null) => void;
    changeStateJSON: () => void;
    changeState: (newItem: KeysIteratorModel, modified: boolean) => void;
}

export class KeysIteratorContentEditor extends React.PureComponent<KeysIteratorContentEditorProps> {
     
    render() {
        const {editJSON, modified, current, onSave, onCancel, cloneItem, changeStateJSON, changeState, onRefJsonEditor, sourceTypeList} = this.props;
        let currentName: string =  current?.name || '';
        let currentId: string =  current?.id || '';
        let styleJS: React.CSSProperties = {
            backgroundColor: editJSON ? 'green' : 'white'
        };
        return (
            <React.Fragment>
                <HeaderMenuWidget modified={modified} header="KEYS ITERATOR" icon="edit" disabled={false}>
                    {!modified && <Menu.Item >
                        <Copy
                            button={{ color: 'green' }}
                            textProvider={() => {
                                return JSON.stringify(current, null, 2);
                            }}
                        />
                    </Menu.Item>}

                    {modified && dialogMenuWidget(modified, 'Save', () => onSave(), 'save', 'Are you sure you want to save the changes?', { color: 'green' })}
                    {modified && dialogMenuWidget(modified, 'Cancel', () => onCancel(), 'reply', 'Are you sure you want to loose your changes?')}
                    {!modified && cloneItem && <Menu.Item key={'New'} as={Link} to={`/KeysIterator/new`} icon="plus" content="New" />}

                    {!modified && cloneItem &&
                        <ConfirmWidget
                            children={`Are you sure you want to clone ${currentName} item?`}
                            onConfirm={() => cloneItem()}
                            trigger={<Menu.Item key={'Clone'} icon="clone outline" content="Clone" />}
                        />}
                    {!modified && cloneItem && <Menu.Item key={'Usage'} as={Link} to={`/KeysIterator/Usage/${currentId}`} icon="linkify" content="Usage" />}
                    {!modified && cloneItem && <Menu.Item key={'Run'} as={Link} to={`/KeysIterator/${currentId}/run`} icon="play" content="Run" />}
                    <Menu.Item content={'JSON'} icon={'file alternate outline'} onClick={() => changeStateJSON()} style={styleJS} />
                </HeaderMenuWidget>
                <Segment>

                    {!editJSON &&
                        <KeysIteratorItem
                            sourceTypeList={sourceTypeList}
                            item={current}
                            editJSON={editJSON}
                            disabled={false}
                            onChange={(item: KeysIteratorModel) => changeState(item, true)}
                        />}

                    {editJSON &&
                        <TableEditableWidget edit={false}>
                            <JsonEditorGet newitem={!modified} item={current} ref={r => onRefJsonEditor(r)} onModified={(modified: boolean) => changeState(current || {}, modified)} />
                        </TableEditableWidget>
                    }

                </Segment>
            </React.Fragment >
        );
    }
}