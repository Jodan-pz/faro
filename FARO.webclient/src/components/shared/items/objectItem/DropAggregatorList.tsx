import * as React from 'react';

import '../../../../styles/items/items.css';

import { DropValue } from '../DropValue';
import { ItemValue, AggregatorModel } from 'src/actions/model';

interface DropAggregatorListProps extends ItemValue<AggregatorModel[]> {
}
type DropAggregatorListText = {
    index: number;
    text: string;
    value: AggregatorModel | null;
};

export class DropAggregatorList extends React.Component<DropAggregatorListProps, {}> {
    constructor(props: DropAggregatorListProps) {
        super(props);
    }

    listenerItemChange = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            this.props.onChange(this.props.name !== undefined ? this.props.name : '', newValue);
        }
    }

    render() {
        const { value, disabled } = this.props;
        let clzz: string = this.props.className ? this.props.className : 'labeledContainerBox';
        let style: React.CSSProperties = this.props.style ? this.props.style : {};

        let list: AggregatorModel[] = value ? value as AggregatorModel[] : [];

        let items: DropAggregatorListText[] = list.map((aggregator: AggregatorModel, index: number) => {
            let name: string = aggregator.name + (aggregator.description && aggregator.description.length > 0 ? ' ( ' + aggregator.description + ' )' : '');
            return {
                index: index + 1,
                text: name,
                value: aggregator
            } as DropAggregatorListText;
        });

        let currValue: DropAggregatorListText = {
            index: 0,
            text: 'none',
            value: null
        };

        items.unshift(currValue);

        return (
            <div className={clzz} style={style} >
                <DropValue
                    className={clzz}
                    name={'aggregatorList'}
                    selection
                    search
                    disabled={disabled}
                    items={items}
                    keyValue={'text'}
                    multiple={false}
                    value={currValue}
                    onChange={(name: string | number, newValue: DropAggregatorListText) => this.listenerItemChange(name, newValue.value)}
                />
            </div>
        );
    }
}
