import { ItemValue } from 'src/actions/model';
import * as React from 'react';
import { Checkbox, CheckboxProps } from 'semantic-ui-react';

interface CheckBoxValueProps extends ItemValue<any> {
    toggle?: boolean;
    label?: string;
}

export class CheckBoxValue extends React.Component<CheckBoxValueProps, {}> {
    constructor(props: CheckBoxValueProps) {
        super(props);
    }
    onChangeCheckbox = (val: any) => {
        if (this.props.onChange) {
            this.props.onChange(this.props.name || '', val);
        }
    }
    render() {
        const { value, toggle, label } = this.props;
        let clzz: string = this.props.className ? this.props.className : '';
        let style: React.CSSProperties = this.props.style ? this.props.style : {};

        let lab: string = label || '';
        let tog: boolean = toggle === undefined ? true : toggle;
        return (<Checkbox style={style} className={clzz} toggle={tog} label={lab} onChange={(event: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => this.onChangeCheckbox(data.checked)} checked={value} />);
    }
}
