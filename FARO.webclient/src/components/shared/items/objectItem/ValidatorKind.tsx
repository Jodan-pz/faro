import * as React from 'react';
import { DropValue } from '../DropValue';
import { ItemValue } from '../../../../actions/model';
import '../../../../styles/items/items.css';


interface ValidatorKindrops extends ItemValue<string> {
    validatorKindList?: Array<string>;
}


export class ValidatorKind extends React.Component<ValidatorKindrops, {}> {
    constructor(props: ValidatorKindrops) {
        super(props);
    }

    listenerItemChange = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            this.props.onChange(this.props.name !== undefined ? this.props.name : '', newValue);
        }
    }

    render() {
        const { value, disabled, validatorKindList } = this.props;
        let clzz: string = this.props.className ? this.props.className : 'labeledContainerBox';
        let style: React.CSSProperties = this.props.style ? this.props.style : {};
        return (
            <div className={clzz} style={style} >
                <DropValue
                    className={clzz}
                    name={'kind'}
                    selection
                    search
                    disabled={disabled}
                    items={validatorKindList || []}
                    multiple={false}
                    value={value}
                    onChange={(name: string | number, newValue: string) => this.listenerItemChange(name, newValue)}
                />
            </div>
        );
    }
}
