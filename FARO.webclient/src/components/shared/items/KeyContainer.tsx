import * as React from 'react';
import { ItemValue } from '../../../actions/model';
import { InputValue } from './InputValue';

import '../../../styles/items/items.css';

type KeyValue = {
    key: string;
    value: any;
};

interface KeyContainerProps extends ItemValue<KeyValue> {
    placeholderKey?: string;
}
export class KeyContainerItem extends React.Component<KeyContainerProps, {}> {
    listenerItemChange = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            let item: KeyValue = { ...this.props.value } as KeyValue;
            this.props.onChange(name, { ...item, [name]: newValue });
        }
    }
    render() {
        const { children, value, placeholderKey, disabled } = this.props;
        if (value === undefined || value === null) return null;
        
        let element: any = null;
        let itemChildren: any[] = React.Children.toArray(children);
        if (React.isValidElement(itemChildren[0])) {
            element = itemChildren[0];
        }
        if (element === null) return null;

        let props: ItemValue<any> = {
            name: 'value',
            disabled: disabled,
            onChange: this.listenerItemChange,
            value: value.value
        };
        let cloneElement: any = React.cloneElement(element, props);
        let clzz: string = 'keyContainerBox ' + (this.props.className ? this.props.className : '');
        let style: React.CSSProperties = this.props.style ? this.props.style : {}; 
        return (
            <div className={clzz} style={style}>
                <InputValue disabled={disabled} placeholder={placeholderKey} type={'text'} name={'key'} value={value.key} onChange={(value: any) => this.listenerItemChange('key', value)} />
                {cloneElement}
            </div>
        );
    }
}