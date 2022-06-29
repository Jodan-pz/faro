import * as React from 'react';
import { appConnector } from 'app-support';
import *  as reducers from '../../../../../reducers';
import { ItemValue, KeysIteratorModel, DecoratorModel, LodashItem } from '../../../../../actions/model';
import { setSelectField } from '../../../../../actions';
import { isNull } from 'util';
import { getSplitDecorator, getNameIcon } from '../../../../Utils';
import { Button, SemanticICONS, Popup } from 'semantic-ui-react';
import { ButtonDrop } from '../ButtonDrop';
import { InputValue } from '../../InputValue';
import { ModalItem } from './ModalItem';

 


interface ViewItemProps extends ItemValue<any> {
    fields?: Array<string>;
    searchKeys?: Array<KeysIteratorModel>;
    searchDecorators?: Array<DecoratorModel>;
    presentLayers?: Array<{ label: string, value: any, key: any }>;
    onMoveItemTo?: (itemIndx: number, layer: number) => void;
}

const conn = appConnector<ViewItemProps>()(
    (s, p) => ({
        selectField: reducers.getSelectImageField(s),
    }),
    {
        setSelectField
    }
);

class ViewItemCompo extends conn.StatefulCompo<{ openValue: boolean }> {
    refLabel: any;
    constructor(props: any) {
        super(props);
        this.state = { openValue: false };
    }
    updateChange = (newValue: any) => {
        const { onChange } = this.props;
        if (onChange) {
            if (newValue.modified) {
                let index: number = newValue.index !== undefined ? newValue.index : 0;
                onChange(index, newValue);
            }
        }
    }
    changeModal = (name: string | number, newValue: any) => {
        // chiudo il popup modale e notifico l'avvenuto cambiamento del valore LodashItem  
        const { openValue } = this.state;
        this.props.setSelectField(undefined);
        if (openValue === false) {
            this.forceUpdate(() => {
                this.updateChange(newValue);
            });
        } else {
            this.updateChange(newValue);
            this.setState({ openValue: false });
        }
    }
    shouldComponentUpdate(nextProps: ViewItemProps, nextState: any): boolean {
        const { value } = this.props;
        const { openValue } = this.state;
        let nextValue: any = nextProps.value;
        let should: boolean = true;
        if (value && nextValue) {
            should = nextValue.index !== value.index
                || nextValue.key !== value.key;
        }
        return should || openValue !== nextState.openValue;
    }
    listenerKeyChange = (name: string | number, newName: any) => {
        const { value } = this.props;
        // cambio il nome del campo e notifico l'avvenuto cambiamento della key del LodashItem  
        if (this.props.onChange) {
            let lodashItem: LodashItem = { ...(value as LodashItem) };
            lodashItem.key = newName;
            // lodashItem.value = lodashItem.value || null;
            let index: number = lodashItem.index !== undefined ? lodashItem.index : 0;
            this.props.onChange(index, lodashItem);
        }
    }

    moveItemTo = (layer: number) => {
        if (this.props.onMoveItemTo) {
            const { value } = this.props;
            let lodashItem: LodashItem = value as LodashItem;
            this.props.onMoveItemTo(lodashItem.index !== undefined ? lodashItem.index : -1, layer);
        }
    }

    toPopMessage = (value: any) => {
        let list: Array<any> = [];
        if (value) {
            for (const key in value) {
                if (value.hasOwnProperty(key)) {
                    const element = value[key];
                    let k: string = key;
                    if (key !== 'key' && key !== 'index') {
                        let isNUll: boolean = isNull(element);
                        let isObject: boolean = !isNUll && typeof (element) === 'object';
                        let child: any = isNUll ? 'null' : String(element);
                        if (isObject) child = this.toPopMessage(element);
                        if (key === 'decorator') {
                            k = '';
                            let obj: { id: string, field: string } = getSplitDecorator(child as string);
                            let name: string = obj.id;
                            if (this.props.searchDecorators && this.props.searchDecorators.length > 0) {
                                let dec: DecoratorModel | undefined = this.props.searchDecorators.find((e: DecoratorModel) => e.id === name);
                                if (dec && dec.name && dec.name.length > 0) {
                                    name = dec.name;
                                }
                            }
                            child = [
                                (<div key={'uno'}><span style={{ marginRight: '5px' }}>Decorator:</span>{name}</div>),
                                (<div key={'due'}><span style={{ marginRight: '5px' }}>Output:</span>{obj.field}</div>)
                            ];
                        }
                        if (child && child.length > 0) {
                            let pre: any = k !== 'value' && k.length > 0 ? <span style={{ marginRight: '5px' }}>{k + ': '}</span> : '';
                            list.push((<div key={list.length}>{pre}{child}</div>));
                        }
                    }
                }
            }
        }
        return list;
    }
    
    render() {
        const { disabled, value, searchKeys, searchDecorators, presentLayers, selectField, fields } = this.props;
        const { openValue } = this.state;

        let openModal: boolean = openValue || value.key === selectField;

        let clzz: string = this.props.className ? this.props.className : '';

        let style: React.CSSProperties = { ...(this.props.style ? this.props.style : {}), display: 'flex', width: '100%', backgroundColor: value.key === selectField ? 'yellow' : 'white' };

        let lodashItem: LodashItem = value as LodashItem;
        let lodashValue: any = lodashItem.value;
        let iconName: string = getNameIcon(lodashValue);
 
        let message: Array<any> = this.toPopMessage(value);

        let btn: any = (
            <Button
                disabled={disabled}
                style={{ margin: 'auto', width: '50%' }}
                active={message.length > 0}
                content="Open"
                icon={iconName as SemanticICONS}
                onClick={(ev: any) => this.setState({ ...this.state, openValue: true })}
            />);

        let btnDropToLayer: any = (
            <ButtonDrop
                disabled={disabled}
                style={{ margin: 'auto', marginLeft: '5px', width: '50%' }}
                value={presentLayers}
                name={'buttonDrop'}
                onChange={(name: string | number, newValue: any) => this.moveItemTo(newValue)}
            />);

        return (
            <div className={clzz} style={style}> 
                
                {/* visualizzo il nome del campo e do la possibilità di modificarlo*/}
                <InputValue
                    style={{ width: '100%' }}
                    value={lodashItem.key || ''}
                    name={lodashItem.key || ''}
                    disabled={disabled}
                    onChange={this.listenerKeyChange}
                />
                {/* Apro il popup di modifica del valore*/}
                <div style={{ margin: 'auto', paddingLeft: '5px', width: '20%', display: 'flex' }}>

                    {message.length > 0 && <Popup
                        trigger={btn}
                        content={<div style={{ minWidth: '250px' }}>{message}</div>}
                    />}

                    {message === undefined || message.length === 0 && btn}

                    {btnDropToLayer}

                </div>

                {openModal && <ModalItem
                    disabled={disabled}
                    fields={fields}
                    searchKeys={searchKeys}
                    searchDecorators={searchDecorators}
                    value={lodashItem}
                    name={'modal'}
                    onChange={this.changeModal}
                />
                }
            </div>
        );
    }
}

export const ViewItem = conn.connect(ViewItemCompo);