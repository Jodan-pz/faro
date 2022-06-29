import * as React from 'react';
import * as reducers from '../../reducers';
import { appConnector, Link } from 'app-support';
import { keysIteratorUsage, cleankeysIteratorUsage, setSelectField } from '../../actions';
import { KeysIteratorUsageCollectionModel } from 'src/actions/model';
import { KeysIteratorUsageItem, ObjectDefinitionDescriptor, KeysIteratorDefinition } from 'mglib-faro.webclient/MGLib_FARO.WEBAPI';
import { HeaderMenuWidget } from '../shared/MenuWidget';
import { Menu, Segment, Table, Header } from 'semantic-ui-react';

interface KeysIteratorUsageProps {
    id: string;
    onEdit?: (id: string) => void;
}

const conn = appConnector<KeysIteratorUsageProps>()(
    (s, p) => ({
        keysUsageItem: reducers.getKeysUsage(s)
    }),
    {
        keysIteratorUsage,
        cleankeysIteratorUsage,
        setSelectField
    }
);


class KeysIteratorUsage extends conn.StatefulCompo<{}> {
    constructor(props: any) {
        super(props);
    }
    componentDidMount() {
        if (this.props.id) {
            this.props.keysIteratorUsage(this.props.id);
        }
    }
    componentWillUnmount(): void {
        this.props.cleankeysIteratorUsage(this.props.id);
    }

    render() {
        const { keysUsageItem } = this.props;
        if (keysUsageItem === undefined) return null;
        let usage: KeysIteratorUsageCollectionModel = keysUsageItem as KeysIteratorUsageCollectionModel;

        let subject: ObjectDefinitionDescriptor = usage.subject!;
        let items: KeysIteratorUsageItem[] = usage.items || [];

        let header: any = (
            <HeaderMenuWidget header={`Usage of Keys Iterator:  ${subject.name} - ${subject.description || ''}`} icon="linkify" disabled={false}>
                <Menu.Item as={Link} to={`/KeysIterator/${this.props.id}/run`} icon="play" content="Run" />
                <Menu.Item as={Link} to={`/KeysIterator/${this.props.id}/edit`} icon="edit" content="Keys Iterator" />
            </HeaderMenuWidget>
        );

        return (
            <Segment>
                {header}
                <Table celled striped verticalAlign={'middle'}>

                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell><Header>Image</Header></Table.HeaderCell>
                            <Table.HeaderCell><Header>Keys Iterator</Header></Table.HeaderCell>
                            <Table.HeaderCell><Header>Flows</Header></Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>


                    <Table.Body style={{ height: '100%' }}>
                        {items.map((item: KeysIteratorUsageItem, indx: number) => {

                            if (item.image && item.image.id) {
                                let name: string = item.image.name || '';
                                let description: string = item.image.description || '';
                                let id: string = item.image.id;
                                let keys: KeysIteratorDefinition[] | undefined = item.keys;
                                let flows: ObjectDefinitionDescriptor[] = item.flows || [];

                                return (
                                    <Table.Row key={indx}>
                                        <Table.Cell width="3">
                                            <Menu.Item as={Link} to={`/Images/${id}/edit`} icon="edit" content={`${name} - ${description}`} />
                                        </Table.Cell>

                                        <Table.Cell width="4">
                                            {keys && keys.map((key: KeysIteratorDefinition, indxKey: number) => {

                                                let keyName: string = `${key.name} - ${key.description || ''}`;
                                                let myself: boolean = key.id === this.props.id;

                                                return (
                                                    <div
                                                        style={{ height: '30px', padding: '4px', border: myself ? '1px solid green' : '' }}
                                                        key={indxKey}
                                                    >
                                                        <Menu.Item
                                                            as={Link}
                                                            to={`/KeysIterator/${key.id}/edit`}
                                                            icon="edit"
                                                            content={keyName}
                                                        />
                                                    </div>);
                                            })}
                                        </Table.Cell>

                                        <Table.Cell width="3">
                                            {flows.map((flow: ObjectDefinitionDescriptor, indxFlow: number) => {
                                                if (flow.id) {
                                                    let nameFlow: string = flow.name || '';
                                                    let descriptionFlow: string = flow.description || '';
                                                    let idFlow: string = flow.id;
                                                    return (<div key={indxFlow} style={{ height: '26px', margin: 'auto' }}><Menu.Item as={Link} to={`/Flows/${idFlow}/edit`} icon="edit" content={`${nameFlow} - ${descriptionFlow}`} /></div>);
                                                }
                                                return '';
                                            })}
                                        </Table.Cell>
                                    </Table.Row>);
                            }
                            return '';
                        })}
                    </Table.Body>
                </Table>
            </Segment>);
    }
}

export default conn.connect(KeysIteratorUsage);
