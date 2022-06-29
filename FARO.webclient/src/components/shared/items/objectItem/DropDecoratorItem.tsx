import * as React from 'react';
import { ItemValue, ImageModel, DecoratorModel } from '../../../../actions/model';
import '../../../../styles/items/items.css';
import { DropValue } from '../DropValue';
 



interface DropDecoratortemProps extends ItemValue<string> {
    listDecorators: DecoratorModel[] | undefined;
}

type DecoratorItemText = {
    text: string;
    value: { description: string, id: string };
};

export class DropDecoratorItem extends React.Component<DropDecoratortemProps, {}> {
    constructor(props: DropDecoratortemProps) {
        super(props);
    }

    listenerItemChange = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            this.props.onChange(this.props.name !== undefined ? this.props.name : '', newValue);
        }
    }
    getCurrentType = (list: DecoratorItemText[], value: string) => {
        return list.find((element: DecoratorItemText) => {
            return element.value.id === value;
        });
    }
    render() {
        const { value, disabled, listDecorators } = this.props;
        let clzz: string = (this.props.className ? 'labeledContainerBox ' + this.props.className : 'labeledContainerBox');
        let style: React.CSSProperties = this.props.style ? this.props.style : {};
        let items: DecoratorItemText[] = [];
        if (listDecorators && listDecorators.length > 0) {
            listDecorators.forEach((val: DecoratorModel) => {
                if (val.name && val.name.length > 0) {
                    items.push({
                        text: val.name,
                        value: { description: val.description || '', id: val.id! }
                    });
                }
            });
        }

        let currValue: DecoratorItemText | undefined = this.getCurrentType(items, value || '');
        return (
            <div className={clzz} style={style} >
                <DropValue name={this.props.name} selection search disabled={disabled} items={items} keyValue={'text'} multiple={false} value={currValue} onChange={(name: string | number, newValue: DecoratorItemText) => this.listenerItemChange(name, newValue.value.id)} />
                {currValue && currValue.value.description.length > 0 && <div style={{ marginTop: 'auto', marginBottom: 'auto', marginLeft: '5px' }}>{currValue.value.description}</div>}

            </div>
        );
    }
}
