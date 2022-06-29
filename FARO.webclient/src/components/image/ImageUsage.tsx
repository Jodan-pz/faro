import * as React from 'react';
import * as reducers from '../../reducers';
import { appConnector, Link } from 'app-support';
import { imageUsage, cleanImageUsage } from '../../actions';
import { ImageUsageCollectionModel } from 'src/actions/model';
import { Segment, Header, Icon, Menu } from 'semantic-ui-react';
import { HeaderMenuWidget } from '../shared/MenuWidget';
import Table, { Column, ColumnRenderProps } from 'mildev-react-table';
import { ObjectDefinitionDescriptor } from 'mglib-faro.webclient/MGLib_FARO.WEBAPI';

interface ImageUsageProps {
    id: string;
    onEdit?: (id: string) => void;
}

const conn = appConnector<ImageUsageProps>()(
    (s, p) => ({
        imageUsageItem: reducers.getImageUsage(s)
    }),
    {
        imageUsage,
        cleanImageUsage
    }
);


class ImageUsage extends conn.StatefulCompo<{}> {
    constructor(props: any) {
        super(props);
    }
    componentDidMount() {
        if (this.props.id) {
            this.props.imageUsage(this.props.id);
        }
    }
    componentWillUnmount(): void {
        this.props.cleanImageUsage(this.props.id);
    }

    getColumn = (): Array<Column> => {
        return [{
            idColumn: 'name',
            contexts: ['table']
        },
        {
            idColumn: 'description',
            contexts: ['table']
        }];
    }

    render() {
        const { imageUsageItem } = this.props;
        if (imageUsageItem === undefined) return null;
        let usage: ImageUsageCollectionModel = imageUsageItem as ImageUsageCollectionModel;

        let subject: ObjectDefinitionDescriptor = usage.subject!;

        let flows: any = usage.items![0].flows;

        let header: any = (
            <HeaderMenuWidget header={`Usage of Image:  ${subject.name} - ${subject.description || ''}`} icon="linkify" disabled={false}>
                <Menu.Item as={Link} to={`/Images/${this.props.id}/run`} icon="cogs" content="Build" />
                <Menu.Item as={Link} to={`/Images/${this.props.id}/validate`} icon="certificate" content="Check" />
                <Menu.Item as={Link} to={`/Images/${this.props.id}/edit`} icon="edit" content="Image" />
            </HeaderMenuWidget>
        );

        return (
            <Segment>
                {header}

                <Table
                    title={{ titleTab: 'Flows', style: { backgroundColor: 'white' } }}
                    headColumnHeight={1}
                    columns={this.getColumn()}
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
    }
}

export default conn.connect(ImageUsage);