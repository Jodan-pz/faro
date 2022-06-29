import * as React from 'react';
import { ItemValue, SourceDefinitionModel } from '../../../../actions/model';
import { DropValue } from '../DropValue';
import '../../../../styles/items/items.css';
import SourceItemArgs from './SourceItemArgs';



interface SourceItemProps extends ItemValue<SourceDefinitionModel> {
    sourceTypeList?: Array<string>;
    decorator?: boolean;
    keysIterator?: boolean;
    
}

export class SourceItem extends React.Component<SourceItemProps, {}> {

    constructor(props: SourceItemProps) {
        super(props);
    }

    listenerItemChange = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            let item: SourceDefinitionModel = { ...this.props.value } as SourceDefinitionModel;
            this.props.onChange(this.props.name !== undefined ? this.props.name : '', { ...item, [name]: newValue });
        }
    }


    render() {
        const { value, disabled, decorator, sourceTypeList } = this.props;
        let clzz: string = 'labeledContainerBox ' + (this.props.className ? this.props.className : '');
        let style: React.CSSProperties = this.props.style ? this.props.style : {};

        let source: SourceDefinitionModel = value as SourceDefinitionModel;
        let isDecorator: boolean = decorator !== undefined;
        let currValue: string  = source !== undefined && source !== null ? (source as any).type : undefined;
        return (
            <div className={clzz} style={style} >
                <div style={{ marginRight: '5px' }}>
                    <DropValue
                        name={'type'}
                        selection
                        search
                        disabled={disabled}
                        items={sourceTypeList || []}
                        multiple={false}
                        value={currValue}
                        onChange={(name: string | number, newValue: string) => this.listenerItemChange(name, newValue)}
                    />
                </div>

                <SourceItemArgs
                    name={'args'}
                    isDecorator={isDecorator}
                    type={currValue}
                    value={source && source.args ? source.args : {}}
                    onChange={(name: string | number, newValue: any) => this.listenerItemChange(name, newValue)}
                />


            </div>
        );
    }
}
