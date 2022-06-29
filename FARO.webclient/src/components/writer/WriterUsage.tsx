import * as React from 'react';
import * as reducers from '../../reducers';
import { appConnector, Link } from 'app-support';
import { writerUsage, cleanWriterUsage } from '../../actions';
import { WriterUsageCollectionModel } from 'src/actions/model';
import { ObjectDefinitionDescriptor } from 'mglib-faro.webclient/MGLib_FARO.WEBAPI';
import { HeaderMenuWidget } from '../shared/MenuWidget';
import { Menu, Segment } from 'semantic-ui-react';
import Table, { ColumnRenderProps, Column } from 'mildev-react-table';

interface WriterUsageProps {
    id: string;
    onEdit?: (id: string) => void;
}
const conn = appConnector<WriterUsageProps>()(
    (s, p) => ({
        writerUsageItem: reducers.getWriterUsage(s)
    }),
    {
        writerUsage,
        cleanWriterUsage
    }
);


class WriterUsage extends conn.StatefulCompo<{}> {
    constructor(props: any) {
        super(props);
    }
    componentDidMount() {
        if (this.props.id) {
            this.props.writerUsage(this.props.id);
        }
    }
    componentWillUnmount(): void {
        this.props.cleanWriterUsage(this.props.id);
    }
    getColumns = (): Array<Column> => {
        return [{
            idColumn: 'writers',
            contexts: ['table']
        }, {
            idColumn: 'flow_name',
            contexts: ['table']
        },
        {
            idColumn: 'flow_description',
            contexts: ['table']
        }];
    }

    render() {
        const { writerUsageItem } = this.props;
        if (writerUsageItem === undefined) return null;
        let usage: WriterUsageCollectionModel = writerUsageItem as WriterUsageCollectionModel;

        let subject: ObjectDefinitionDescriptor = usage.subject!;

        let header: any = (
            <HeaderMenuWidget header={`Usage of Writer:  ${subject.name} - ${subject.description || ''}`} icon="linkify" disabled={false}>
                <Menu.Item as={Link} to={`/Writers/${this.props.id}/edit`} icon="edit" content="Writer" />
            </HeaderMenuWidget>
        );

        return (
            <Segment>
                {header}

                <Table
                    title={{ titleTab: 'Flows & Writers', style: { backgroundColor: 'white' } }}
                    headColumnHeight={1}
                    columns={this.getColumns()}
                    data={usage.items}
                    cellRender={(indexRow: number, column: ColumnRenderProps, dataRow: any) => {
                        const flow = dataRow.flows[0]!;
                        const writers: ObjectDefinitionDescriptor[] = dataRow.writers;
                        if (column.idColumn === 'writers') {
                            return (<div>
                                {writers.map(v => (
                                    <Menu.Item style={{ paddingRight: 4 }} as={Link} to={`/Writers/${v.id}/edit`} icon="edit" content={v.name} />
                                ))}
                            </div>);
                        } else if (column.idColumn === 'flow_description') {
                            return (
                                <span>{flow.description}</span>
                            );
                        } else if (column.idColumn === 'flow_name') {
                            return (
                                <Menu.Item as={Link} to={`/Flows/${flow.id}/edit`} icon="edit" content={flow.name} />
                            );
                        }
                        return null;
                    }}
                    alternateRow
                />
            </Segment>);
    }
}

export default conn.connect(WriterUsage);