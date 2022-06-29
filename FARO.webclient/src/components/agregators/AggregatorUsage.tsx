import * as React from 'react';
import { Link } from 'app-support';
import { ImageUsageCollectionModel } from 'src/actions/model';
import { Segment, Menu } from 'semantic-ui-react';
import { HeaderMenuWidget } from '../shared/MenuWidget';
import Table, { Column, ColumnRenderProps } from 'mildev-react-table';
import { ObjectDefinitionDescriptor } from 'mglib-faro.webclient/MGLib_FARO.WEBAPI';
import { withResult } from 'src/actions/proxy';

interface AggregatorUsageCollectionModel extends ImageUsageCollectionModel { }

interface AggregatorUsageProps {
    id: string;
}

const AggregatorUsage = ({ id }: AggregatorUsageProps) => {
    const [usage, setUsage] = React.useState<AggregatorUsageCollectionModel>();

    React.useEffect(() => {
        const getData = async () => {
            const data = await withResult(fetch(`/api/v1/Aggregator/${id}/usage`).then(r => r.json()));
            return data as AggregatorUsageCollectionModel;
        };
        getData().then(setUsage);
    }, [id]);

    const getColumns = (): Array<Column> => {
        return [{
            idColumn: 'name',
            contexts: ['table']
        },
        {
            idColumn: 'description',
            contexts: ['table']
        }];
    };

    if (!usage) return null;
    let subject: ObjectDefinitionDescriptor = usage.subject!;

    let flows: any = usage.items![0].flows;

    let header: any = (
        <HeaderMenuWidget header={`Usage of Aggregator:  ${subject.name} - ${subject.description || ''}`} icon="linkify" disabled={false}>
            <Menu.Item as={Link} to={`/Aggregators/${id}/edit`} icon="edit" content="Aggregator" />
        </HeaderMenuWidget>
    );

    return (
        <Segment>
            {header}

            <Table
                title={{ titleTab: 'Flows', style: { backgroundColor: 'white' } }}
                headColumnHeight={1}
                columns={getColumns()}
                data={flows}
                cellRender={(indexRow: number, column: ColumnRenderProps, dataRow: any) => {
                    if (column.idColumn === 'name') {
                        return (
                            <Menu.Item as={Link} to={`/Flows/${dataRow.id}/edit`} icon="edit" content={dataRow.name} />
                        );
                    }
                    return null;
                }}
                alternateRow
            />
        </Segment>);
};

export default AggregatorUsage;