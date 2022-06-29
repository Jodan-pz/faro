import * as React from 'react';
import '../../../../styles/items/items.css';
import { DropValue } from '../DropValue';
import { ItemValue } from 'src/actions/model';

interface AggregatorKindrops extends ItemValue<string> {
    aggregatorKindList?: Array<string>;
}


export class AggregatorKind extends React.Component<AggregatorKindrops, {}> {
    constructor(props: AggregatorKindrops) {
        super(props);
    }
    listenerItemChange = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            this.props.onChange(this.props.name !== undefined ? this.props.name : '', newValue);
        }
    }
    render() {
        const { value, disabled, aggregatorKindList } = this.props;
        let clzz: string = this.props.className ? this.props.className : 'labeledContainerBox';
        let style: React.CSSProperties = this.props.style ? this.props.style : {};
        let list: Array<string> = aggregatorKindList || [];
        let currValue: string | undefined = value as string;
        return (
            <div className={clzz} style={style} >
                <DropValue
                    className={clzz}
                    name={'kind'}
                    selection
                    search
                    disabled={disabled}
                    items={list}
                    multiple={false}
                    value={currValue}
                    onChange={(name: string | number, newValue: string) => this.listenerItemChange(name, newValue)}
                />
            </div>
        );
    }
}
