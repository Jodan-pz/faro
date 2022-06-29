import { appConnector, Link } from 'app-support';
import * as React from 'react';
import * as reducers from '../../reducers';
import { imageGetAggregators } from '../../actions';
import { DropValue } from '../shared/items/DropValue';
import { AggregatorModel } from 'src/actions/model';
import { Table, Button } from 'semantic-ui-react';
import { ConfirmWidget } from '../shared/DialogWidget';
import { AggregatorDefinition } from 'mglib-faro.webclient/MGLib_FARO.WEBAPI';


type AggregatorDrop = {
    text: string;
    description: string;
    id: string | undefined;
    value: number;
};


interface FlowDropAggregatorProps {
    modified?: boolean;
    onEdit?: (where: string, id: string) => void;
    aggregator?: string;
    idImage?: string;
    onChange?: (newValue: string) => void;
    aggregators?: AggregatorDefinition[];
}

const conn = appConnector<FlowDropAggregatorProps>()(
    (s, p) => ({
        aggregators: (!p.idImage) ? p.aggregators : reducers.getCurrentAggregators(s)
    }),
    {
        imageGetAggregators
    }
);


interface FlowDropAggregatorState {
}

class FlowDropAggregator extends conn.StatefulCompo<FlowDropAggregatorState> {

    constructor(props: any) {
        super(props);
    }

    loadAggregator = (idImage: string) => {
        if (idImage && idImage.length > 0) {
            this.props.imageGetAggregators(idImage);
        }
    }

    componentDidMount() {
        if (this.props.idImage) this.loadAggregator(this.props.idImage);
    }
    componentDidUpdate(prevProps: any, prevState: any): void {
        if (this.props.idImage && this.props.idImage !== prevProps.idImage) {
            // this.listenerItemChange(undefined);
            this.loadAggregator(this.props.idImage);
        }
    }
    listenerItemChange = (newValue: any) => {
        if (this.props.onChange) {
            this.props.onChange(newValue);
        }
    }

    onConfirm = (where: string, id: string) => {
        if (this.props.onEdit) {
            this.props.onEdit(where, id);
        }
    }
    render() {
        const { aggregators, aggregator, modified } = this.props;
        if (aggregators) {
            let agg: AggregatorModel[] = aggregators as AggregatorModel[];

            let items: AggregatorDrop[] = agg.map((a: AggregatorModel, index: number) => {
                return {
                    id: a.id,
                    description: a.description,
                    text: a.name,
                    value: index
                } as AggregatorDrop;
            });

            let current: AggregatorDrop | undefined = items.find(it => it.id === aggregator);

            let thereis: boolean = items.length > 0;

            items.unshift({
                id: undefined,
                description: 'no aggregator',
                text: '',
                value: items.length
            });


            let description: string = !thereis ? 'no aggregator' : (current && current.description && current.description.length > 0 ? current.description : '');
            let linkId: string = current && current.id && current.id.length > 0 ? current.id : '';
            let enableBTN: boolean = linkId.length > 0;
            let whereGo: string = '/Aggregators';
            let link: string = whereGo + '/' + linkId + '/edit';

            return (
                <div className={'divbox'} >

                    <Table style={{ width: '100%' }}>
                        <Table.Body>
                            <Table.Row>
                                <Table.Cell width="2" textAlign="center">
                                    {description}
                                </Table.Cell>
                                <Table.Cell>
                                    <DropValue
                                        style={{ width: '100%' }}
                                        name={'flowdrop'}
                                        selection
                                        search
                                        disabled={!thereis}
                                        items={items}
                                        keyValue={'text'}
                                        multiple={false}
                                        value={current}
                                        onChange={(name: string | number, newValue: AggregatorDrop) => this.listenerItemChange(newValue.id)}
                                    />
                                </Table.Cell>

                                <Table.Cell width="2">
                                    {!modified && <Button disabled={!enableBTN} style={{ width: '90%' }} as={Link} to={link} icon="arrow alternate circle right" />}

                                    {modified &&
                                        <ConfirmWidget
                                            children={`The item has not been saved, continue?`}
                                            onConfirm={() => this.onConfirm(whereGo, linkId)}
                                            trigger={
                                                <Button
                                                    disabled={!enableBTN}
                                                    style={{ width: '90%' }}
                                                    icon="arrow alternate circle right"
                                                />
                                            }
                                        />}

                                </Table.Cell>

                            </Table.Row>
                        </Table.Body>
                    </Table>
                </div>);
        }
        return null;
    }

}


export default conn.connect(FlowDropAggregator);