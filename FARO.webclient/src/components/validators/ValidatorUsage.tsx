import * as React from 'react';
import { Link } from 'app-support';
import { ImageUsageCollectionModel } from 'src/actions/model';
import { ObjectDefinitionDescriptor } from 'mglib-faro.webclient/MGLib_FARO.WEBAPI';
import { HeaderMenuWidget } from '../shared/MenuWidget';
import { Menu, Segment } from 'semantic-ui-react';
import Table, { ColumnRenderProps, Column } from 'mildev-react-table';
import { withResult } from 'src/actions/proxy';

interface ValidatorUsageCollectionModel extends ImageUsageCollectionModel { }

interface ValidatorUsageProps {
    id: string;
}

const ValidatorUsage = ({ id }: ValidatorUsageProps) => {
    const [usage, setUsage] = React.useState<ValidatorUsageCollectionModel>();

    React.useEffect(() => {
        const getData = async () => {
            const data = await withResult(fetch(`/api/v1/Validator/${id}/usage`).then(r => r.json()));
            return data as ValidatorUsageCollectionModel;
        };
        getData().then(setUsage);
    }, [id]);

    const getColumns = (): Array<Column> => {
        return [{
            idColumn: 'validators',
            contexts: ['table']
        }, {
            idColumn: 'flow_name',
            contexts: ['table']
        },
        {
            idColumn: 'flow_description',
            contexts: ['table']
        }];
    };

    if (!usage) return null;

    let subject: ObjectDefinitionDescriptor = usage.subject!;


    let header: any = (
        <HeaderMenuWidget header={`Usage of Validator:  ${subject.name} - ${subject.description || ''}`} icon="linkify" disabled={false}>
            <Menu.Item as={Link} to={`/Validators/${id}/edit`} icon="edit" content="Validator" />
        </HeaderMenuWidget>
    );

    return (
        <Segment>
            {header}
            <Table
                title={{ titleTab: 'Flows & Validators', style: { backgroundColor: 'white' } }}
                headColumnHeight={3}
                columns={getColumns()}
                data={usage.items}
                cellRender={(indexRow: number, column: ColumnRenderProps, dataRow: any) => {
                    const flow = dataRow.flows[0]!;
                    const validators: ObjectDefinitionDescriptor[] = dataRow.validators;
                    if (column.idColumn === 'validators') {
                        return (<div>
                            {validators.map(v => (
                                <Menu.Item style={{ paddingRight: 4 }} as={Link} to={`/Validators/${v.id}/edit`} icon="edit" content={v.name} />
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
};

export default ValidatorUsage;