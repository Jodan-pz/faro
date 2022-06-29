import * as React from 'react';

import '../../../../styles/items/items.css';

import { DropValue } from '../DropValue';
import { ItemValue, DefaultAggregatorFunction } from 'src/actions/model';

interface DropAggregatorFunctionProps extends ItemValue<DefaultAggregatorFunction> {
}
type DropAggregatorFunctionText = {
    text: string;
    value: number;
};

export class DropAggregatorFunction extends React.Component<DropAggregatorFunctionProps, {}> {
    constructor(props: DropAggregatorFunctionProps) {
        super(props);
    }

    listenerItemChange = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            this.props.onChange(this.props.name !== undefined ? this.props.name : '', newValue);
        }
    }
    getCurrentType = (list: DropAggregatorFunctionText[], value: DefaultAggregatorFunction) => {
        return list.find((element: DropAggregatorFunctionText) => {
            return element.value === value;
        });
    }
    render() {
        const { value, disabled } = this.props;
        let clzz: string = this.props.className ? this.props.className : 'labeledContainerBox';
        let style: React.CSSProperties = this.props.style ? this.props.style : {};

        let items: DropAggregatorFunctionText[] = [];
        for (const kind in DefaultAggregatorFunction) {
            if (isNaN(parseFloat(kind))) continue;
            items.push({ text: DefaultAggregatorFunction[kind], value: parseFloat(kind) });
        }

        let currValue: DropAggregatorFunctionText | undefined = this.getCurrentType(items, value as DefaultAggregatorFunction);
        return (
            <div className={clzz} style={style} >
                <DropValue
                    className={clzz}
                    name={'kind'}
                    selection
                    search
                    disabled={disabled}
                    items={items}
                    keyValue={'text'}
                    multiple={false}
                    value={currValue}
                    onChange={(name: string | number, newValue: DropAggregatorFunctionText) => this.listenerItemChange(name, newValue.value)}
                />
            </div>
        );
    }
}
