import * as React from 'react';
import * as reducers from '../../reducers';
import { appConnector, Link } from 'app-support';
import { decoratorUsage, cleanDecoratorUsage, setSelectField } from '../../actions';
import { DecoratorUsageCollectionModel } from 'src/actions/model';
import { ObjectDefinitionDescriptor, DecoratorUsageItem } from 'mglib-faro.webclient/MGLib_FARO.WEBAPI';
import { HeaderMenuWidget } from '../shared/MenuWidget';
import { Menu, Segment, Table, Header } from 'semantic-ui-react';

interface DecoratorUsageProps {
    id: string;
    onEdit?: (id: string) => void;
}

const conn = appConnector<DecoratorUsageProps>()(
    (s, p) => ({
        decoratorUsageItem: reducers.getDecoratorUsage(s)
    }),
    {
        decoratorUsage,
        cleanDecoratorUsage,
        setSelectField
    }
);

class DecoratorUsage extends conn.StatefulCompo<{}> {
    constructor(props: any) {
        super(props);
    }

    componentDidMount() {
        if (this.props.id) {
            this.props.decoratorUsage(this.props.id);
        }
    }
    componentWillUnmount(): void {
        this.props.cleanDecoratorUsage(this.props.id);
    }

    render() {

        const { decoratorUsageItem } = this.props;
        if (decoratorUsageItem === undefined) return null;
        let usage: DecoratorUsageCollectionModel = decoratorUsageItem as DecoratorUsageCollectionModel;

        let subject: ObjectDefinitionDescriptor = usage.subject!;
        let items: DecoratorUsageItem[] = usage.items || [];


        let header: any = (
            <HeaderMenuWidget header={`Usage of Decorator:  ${subject.name} - ${subject.description || ''}`} icon="linkify" disabled={false}>
                <Menu.Item as={Link} to={`/Decorators/${this.props.id}/run`} icon="play" content="Run" />
                <Menu.Item as={Link} to={`/Decorators/${this.props.id}/edit`} icon="edit" content="Decorator" />
            </HeaderMenuWidget>
        );

        return (
            <Segment>
                {header}
                <Table celled striped verticalAlign={'middle'}>

                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell><Header>Image</Header></Table.HeaderCell>
                            <Table.HeaderCell><Header>Fields</Header></Table.HeaderCell>
                            <Table.HeaderCell><Header>Flows</Header></Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>


                    <Table.Body style={{ height: '100%' }}>
                        {items.map((item: DecoratorUsageItem, indx: number) => {

                            if (item.image && item.image.id) {
                                let name: string = item.image.name || '';
                                let description: string = item.image.description || '';
                                let id: string = item.image.id;
                                let fields: string[] = item.fields || [];
                                let flows: ObjectDefinitionDescriptor[] = item.flows || [];
                                return (
                                    <Table.Row key={indx}>
                                        <Table.Cell width="4">
                                            <Menu.Item as={Link} to={`/Images/${id}/edit`} icon="edit" content={`${name} - ${description}`} />
                                        </Table.Cell>

                                        <Table.Cell width="2">
                                            {fields.map((field: string, indxField: number) => {
                                                // setSelectField
                                                // return (<div key={indxField}>{field}</div>); 
                                                return (
                                                    <div
                                                        key={indxField}
                                                    >
                                                        <Menu.Item
                                                            as={Link}
                                                            to={`/Images/${id}/edit`}
                                                            icon="edit"
                                                            content={`${field}`}
                                                            onClick={() => {
                                                                this.props.setSelectField(field);
                                                            }}
                                                        />
                                                    </div>);
                                            })}
                                        </Table.Cell>

                                        <Table.Cell width="4">
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

export default conn.connect(DecoratorUsage);
