import { ItemValue, AggregatorModel } from 'src/actions/model';
import * as React from 'react';
import { LabeledContainerItem } from '../LabeledContainer';
import { InputValue } from '../InputValue';
import { DropValue } from '../DropValue';
// import { AggregatorFunction } from 'mglib-faro.webclient/MGLib_FARO.WEBAPI'

type AggregatorText = {
    label?: string;
    icon?: string;
    text: string;
    value: number;
};

interface AggregatorFieldItemProps extends ItemValue<AggregatorModel> {
    imagefields?: string[];
}

export class AggregatorFieldItem extends React.Component<AggregatorFieldItemProps, {}> {

    listenerItemChange = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            let item: AggregatorModel = { ...this.props.value } as AggregatorModel;
            this.props.onChange(this.props.name !== undefined ? this.props.name : '', { ...item, [name]: newValue });
        }
    }
    /*
    getCurrentType = (list: AggregatorText[], value: AggregatorModel) => {
        return list.find((element: AggregatorText) => {
            return element.value === value;
        });
    }
    */
    getCurrentItemFields = (list: AggregatorText[], value: string) => {
        return list.find((element: AggregatorText) => {
            return element.label === value;
        });
    }
    render() {
        const { value, disabled, imagefields } = this.props;
        let clzz: string = this.props.className ? this.props.className : 'labeledContainerBox';
        /*
        let style: React.CSSProperties = this.props.style ? this.props.style : {};
        let args: AggregatorFieldModel = value as AggregatorFieldModel;

        let items: AggregatorText[] = [];
        for (const kind in AggregatorFunction) {
            if (isNaN(parseFloat(kind))) continue;
            items.push({ text: AggregatorFunction[kind], value: parseFloat(kind) });
        }
        let currValue: AggregatorText | undefined = this.getCurrentType(items, (value as AggregatorFieldModel).function);
        // ==============
        let itemsFields: AggregatorText[] = [];
        if (imagefields) {
            itemsFields = imagefields.map((el: string, index: number) => {
                let iskey: boolean =  el.indexOf(':') >= 0;
                return {
                    text: iskey ?  el.split(':')[1] : el,
                    icon: iskey ? 'key' : '',
                    label: el, 
                    value: index
                } as AggregatorText;
            });
        }
        let currItemField = this.getCurrentItemFields(itemsFields, args.name ? args.name : '');
        return (
            <div className={clzz} style={style} >
                <LabeledContainerItem className={clzz} value={currItemField} name={'name'} label={'Name: '} defaultValue={''} disabled={disabled} onChange={(name: string | number, newValue: AggregatorText) => this.listenerItemChange(name, newValue.label!)} >
                    <DropValue
                        className={clzz}
                        items={itemsFields}
                        selection
                        search
                        keyValue={'text'}
                        multiple={false}
                    />
                </LabeledContainerItem>

                <LabeledContainerItem className={clzz} value={currValue} name={'function'} label={'Function: '} defaultValue={''} disabled={disabled} onChange={(name: string | number, newValue: AggregatorText) => this.listenerItemChange(name, newValue.value)}  >
                    <DropValue
                        className={clzz}
                        selection
                        search
                        items={items}
                        keyValue={'text'}
                        multiple={false}
                    />
                </LabeledContainerItem>
            </div>
        );
        */
        return '';
    }

}