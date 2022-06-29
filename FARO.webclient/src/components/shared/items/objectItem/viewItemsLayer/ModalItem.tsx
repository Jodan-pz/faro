import * as React from 'react';

import { ItemValue, KeysIteratorModel, DecoratorModel, LodashItem } from '../../../../../actions/model';
import { getType, TYPECONST, TYPEEXPR, TYPEKEY, TYPEDEC, DECTAG, ICOCONST, ICOKEY, KEYTAG, ICOEXPR, ICODEC } from '../../../../../components/Utils';
import { SemanticICONS, Modal, ModalProps, Segment, Header, Menu, Icon, Button } from 'semantic-ui-react';
import { ViewConst } from './ViewConst';
import { ViewKey } from './ViewKey';
import { ViewDecorator } from './ViewDecorator';
import { ViewExpr } from './ViewExpr';

interface ModalItemProps extends ItemValue<LodashItem> {
    searchKeys?: Array<KeysIteratorModel>;
    searchDecorators?: Array<DecoratorModel>;
    fields?: Array<string>;
}
interface ModalItemState {
    modified: boolean;
    typeValue: string;
    decValue: any;
    keyValue: string;
    exprValue: string;
    constValue: string | boolean | number | null;
}

export class ModalItem extends React.Component<ModalItemProps, ModalItemState> {
    originalType: string;
    constructor(props: ModalItemProps) {
        super(props);
        let lodashItem: LodashItem = props.value as LodashItem;
        this.state = this.initialState(lodashItem);
    }

    initialState = (lodashItem: LodashItem) => {
        let decValue: any = null;
        let exprValue: string = '';
        let keyValue: string = '';
        let constValue: any = null;
        let typ: string = getType(lodashItem.value);

        let typeValue: string = typ;
        if (typ === TYPECONST) {
            constValue = lodashItem.value;
        } else if (typ === TYPEEXPR) {
            exprValue = lodashItem.value;
        } else if (typ === TYPEKEY) {
            keyValue = lodashItem.value;
        } else if (typ === TYPEDEC) {
            let isString: boolean = typeof (lodashItem.value) === 'string';
            if (isString) {
                decValue = {
                    decorator: lodashItem.value.split(DECTAG)[1],
                    args: {}
                };
            } else {
                decValue = { ...lodashItem.value };
            }
        }

        this.originalType = typeValue;
        return {
            modified: false,
            typeValue: typeValue,
            decValue: decValue,
            keyValue: keyValue,
            exprValue: exprValue,
            constValue: constValue
        };
    }

    closeModal = () => {
        if (this.props.onChange) {
            const { value } = this.props;
            const { typeValue, decValue, keyValue, constValue, exprValue, modified } = this.state;
            let cloneItem: LodashItem = { ...(value as LodashItem) };
            cloneItem.modified = modified;
            if (cloneItem.modified) {
                if (typeValue === TYPECONST) cloneItem.value = constValue;
                else if (typeValue === TYPEKEY) cloneItem.value = keyValue;
                else if (typeValue === TYPEDEC) cloneItem.value = decValue;
                else if (typeValue === TYPEEXPR) cloneItem.value = exprValue;
            }
            this.props.onChange(this.props.name || '', cloneItem);
        }
    }
    changeDecorator = (name: string | number, newValue: any) => {
        this.setState({ ...this.state, decValue: newValue, modified: true });
    }
    changeExpr = (name: string | number, newValue: any) => {
        this.setState({ ...this.state, exprValue: newValue, modified: true });
    }
    changeKey = (name: string | number, newValue: any) => {
        this.setState({ ...this.state, keyValue: newValue, modified: true });
    }
    changeConst = (name: string | number, newValue: any) => {
        this.setState({ ...this.state, constValue: newValue, modified: true });
    }

    setMode = (type: string) => {
        const { typeValue, modified } = this.state;
        if (typeValue !== type) {
            let mod: boolean = !modified ? this.originalType !== type : modified;
            this.setState({ ...this.state, typeValue: type, modified: mod });
        }
    }
    reset = () => {
        const { value } = this.props;
        let lodashItem: LodashItem = value as LodashItem;
        this.setState(this.initialState(lodashItem));
    }
    render() {
        const { searchKeys, searchDecorators, value, fields } = this.props;
        const { typeValue, decValue, keyValue, constValue, exprValue } = this.state;
        let lodashItem: LodashItem = value as LodashItem;
        let ico: SemanticICONS = typeValue === TYPECONST ? ICOCONST : (typeValue === TYPEKEY ? ICOKEY : (typeValue === TYPEEXPR ? ICOEXPR : ICODEC));
        let keysValue: Array<string> = [];
        if (fields) {
            fields.forEach(fl => {
                if (fl.indexOf(KEYTAG) >= 0) {
                    keysValue.push(fl.split(KEYTAG)[1]);
                }
            });
        }
        return (
            <Modal
                open
                closeOnEscape
                closeOnDimmerClick={false}
                onClose={(event: React.MouseEvent<HTMLElement>, data: ModalProps) => {
                    event.preventDefault();
                    this.closeModal();
                }}
            >
                <Modal.Content>
                    <Segment>
                        <Header size={'tiny'}>{lodashItem.key}</Header>
                        <Menu>
                            <Menu.Item content="Key" active={typeValue === TYPEKEY} icon={ICOKEY} onClick={() => this.setMode(TYPEKEY)} />
                            <Menu.Item content="Decorator" active={typeValue === TYPEDEC} icon={ICODEC} onClick={() => this.setMode(TYPEDEC)} />
                            <Menu.Item content="Constant" active={typeValue === TYPECONST} icon={ICOCONST} onClick={() => this.setMode(TYPECONST)} />
                            <Menu.Item content="Expression" active={typeValue === TYPEEXPR} icon={ICOEXPR} onClick={() => this.setMode(TYPEEXPR)} />
                        </Menu>
                        <Segment>
                            <div style={{ display: 'flex' }}>
                                <Icon style={{ marginRight: '5px', marginTop: 'auto', marginBottom: 'auto' }} name={ico} />
                                {typeValue === TYPECONST && <ViewConst name={TYPECONST} value={constValue} onChange={this.changeConst} />}
                                {typeValue === TYPEKEY && <ViewKey name={TYPEKEY} value={keyValue} onChange={this.changeKey} keysValue={keysValue} />}
                                {typeValue === TYPEDEC && <ViewDecorator name={TYPEDEC} value={decValue} searchKeys={searchKeys} searchDecorators={searchDecorators} onChange={this.changeDecorator} />}
                                {typeValue === TYPEEXPR && <ViewExpr name={TYPEEXPR} value={exprValue} onChange={this.changeExpr} fields={fields} />}
                            </div>
                        </Segment>
                    </Segment>
                </Modal.Content>
                <Modal.Actions>
                    <Button content="Reset" onClick={(ev: any) => this.reset()} />
                    <Button
                        content="Close"
                        onClick={(ev: any) => {
                            if (ev.preventDefault) ev.preventDefault();
                            this.closeModal();
                        }}
                    />
                </Modal.Actions>
            </Modal>);
    }
}