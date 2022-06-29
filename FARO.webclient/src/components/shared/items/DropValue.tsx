import * as React from 'react';
import { Input, Button, DropdownItemProps, Dropdown, DropdownProps } from 'semantic-ui-react';
import { ItemValue } from '../../../actions/model';
import '../../../styles/items/items.css';

interface DropValueProps extends ItemValue<any | any[]> {
    keyValue?: any;
    items: any[];
    multiple?: boolean;
    search?: boolean;
    selection?: boolean;
}

type Drop = {
    icon?: string;
    text: string;
};
const isSelected = (list: string[], value: string) => {
    return list.find((el: string) => el === value) !== undefined;
};

const getOption = (listTarget: Drop[], defaultItms: Array<number>, multiple: boolean) => {
    return listTarget.map((value: Drop, index: number) => {
        let selected: boolean = multiple ? defaultItms.find((el: number) => el === index) !== undefined : (defaultItms.length > 0 ? defaultItms[0] === index : false);
        let opt: DropdownItemProps = {

            key: 'op-' + index,
            value: index,
            text: value.text,
            selected: selected
        };
        if (value.icon) opt.icon = value.icon;
        return opt;
    }) as Array<DropdownItemProps>;
};

export class DropValue extends React.Component<DropValueProps, {}> {
    constructor(props: DropValueProps) {
        super(props);
    }

    onChangeDrop = (val: any) => {
        const { multiple, items, value } = this.props;
        let nwValue: any = null;
        let dropitemsTemp: Array<any> = Array.isArray(items) ? [...items] : (items !== undefined ? [items] : []);
        if (Array.isArray(val)) {
            nwValue = (val as Array<number>).map((i) => {
                return dropitemsTemp[i];
            });
        } else {
            nwValue = dropitemsTemp[val];
        }
        if (nwValue) {
            if (this.props.onChange) {
                this.props.onChange(this.props.name !== undefined ? this.props.name : '', nwValue);
            }
        }
    }

    render() {
        const { keyValue, value, items, disabled, multiple, search, selection } = this.props;
      
        let clzz: string = this.props.className ? 'dropValue ' + this.props.className : 'dropValue';
        let style: React.CSSProperties = this.props.style ? this.props.style : {};

        let dropitemsTemp: Array<any> = Array.isArray(items) ? items : (items !== undefined ? [items] : []);
        let defaultItmsTemp: Array<any> = Array.isArray(value) ? value : (value !== undefined ? [value] : []);

        let dropitems: Array<Drop> = dropitemsTemp.map((val: any, index: number) => {
            return {
                text: keyValue ? val[keyValue] : val,
                icon: val.icon ? val.icon : ''
            };
        });

        let defaultValues: Array<number> = defaultItmsTemp.map((el: any, index: number) => {
            for (let i: number = 0; i < dropitems.length; i++) {
                if (dropitems[i].text === (keyValue ? el[keyValue] : el)) {
                    return i;
                }
            }
            return -1;
        });

        let options: Array<DropdownItemProps> = getOption(dropitems, defaultValues, multiple!);
        let defVal: any = multiple! ? defaultValues : defaultValues[0];
        let key: string =  'k-' + (multiple! ? defaultValues.join('') : defaultValues[0]);
        return (
            <Dropdown
                key={key}
                className={clzz}
                style={style}
                disabled={disabled}
                multiple={multiple!}
                search={search}
                selection={selection}
                defaultValue={defVal}
                onChange={(event: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => this.onChangeDrop(data.value)}
                options={options}
            />);
    }
}
