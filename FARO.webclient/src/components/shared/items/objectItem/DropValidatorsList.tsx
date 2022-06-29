import * as React from 'react';

import '../../../../styles/items/items.css';

import { DropValue } from '../DropValue';
import { ItemValue, ValidatorModel } from 'src/actions/model';

interface DropValidatorListProps extends ItemValue<ValidatorModel[]> {
}
type DropValidatorListText = {
    index: number;
    text: string;
    value: ValidatorModel | null;
};

export class DropValidatorList extends React.Component<DropValidatorListProps, {}> {
    constructor(props: DropValidatorListProps) {
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

        let list: ValidatorModel[] = value ? value as ValidatorModel[] : [];

        let items: DropValidatorListText[] = list.map((validator: ValidatorModel, index: number) => {
            let name: string = validator.name + (validator.description && validator.description.length > 0 ? ' ( ' + validator.description + ' )' : '');
            return {
                index: index + 1,
                text: name,
                value: validator
            } as DropValidatorListText;
        });

        let currValue: DropValidatorListText = {
            index: 0,
            text: 'none',
            value: null
        };

        items.unshift(currValue);

        return (
            <div className={clzz} style={style} >
                <DropValue
                    className={clzz}
                    name={'validatorList'}
                    selection
                    search
                    disabled={disabled}
                    items={items}
                    keyValue={'text'}
                    multiple={false}
                    value={currValue}
                    onChange={(name: string | number, newValue: DropValidatorListText) => this.listenerItemChange(name, newValue.value)}
                />
            </div>
        );
    }
}
