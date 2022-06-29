import * as React from 'react';
import { JsonEditorWidget } from '../../JsonEditorWidget';
import { LayerDefinitionModel, ItemValue } from '../../../../actions/model';
import { LabeledContainerItem } from '../LabeledContainer';
import '../../../../styles/items/items.css';
import { InputValue } from '../InputValue';

interface LayerItemProps extends ItemValue<LayerDefinitionModel> {
}

export class LayerItem extends React.Component<LayerItemProps, {}> {
    constructor(props: LayerItemProps) {
        super(props);
    }
    listenerItemChange = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            let item: any = { ...this.props.value };
            this.props.onChange(this.props.name !== undefined ? this.props.name : '', { ...item, [name]: newValue });
        }
    }
    render() {
        const { value, disabled } = this.props;
        let clzz: string = this.props.className ? this.props.className : 'layerContainerBox';
        let style: React.CSSProperties = this.props.style ? this.props.style : { display: 'flex'};
        return (
            <div className={clzz} style={style} >
                <LabeledContainerItem style={{ display: 'inline' , width: '30%'}} value={value ? value.name : ''} name={'name'} label={'Name: '} defaultValue={''} disabled={disabled} onChange={this.listenerItemChange} >
                    <InputValue />
                </LabeledContainerItem>
                <JsonEditorWidget key={name} name={'items'} item={value ? value.items : []} disabled={disabled} onChange={this.listenerItemChange} />
            </div>
        );
    }
}
