import { ItemValue, KeysIteratorModel, DecoratorModel, LodashItem } from '../../../../../actions/model';
import { getType, TYPECONST, TYPEEXPR, TYPEKEY, TYPEDEC, DECTAG, ICOCONST, ICOKEY, KEYTAG, ICOEXPR, ICODEC } from '../../../../../components/Utils';
import { SemanticICONS, Modal, ModalProps, Segment, Header, Menu, Icon, Button } from 'semantic-ui-react';
import * as React from 'react';
import { InputValue } from '../../InputValue';

interface ViewKeyProps extends ItemValue<string> {
    keysValue?: Array<string>;
}

export class ViewKey extends React.Component<ViewKeyProps, {}> {

    changeValue = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            this.props.onChange(this.props.name || '', KEYTAG + newValue);
        }
    }
    render() {
        const { value, keysValue } = this.props;
        let val: string = (value as string).split(KEYTAG)[1];
        // return (<InputValue type="text" value={val} name="viewKey" onChange={this.changeValue} />);

        // TODO METTERE UN SELETTORE DELLE keysValue POSSIBILI

        return (<InputValue type="text" value={val} name="viewKey" onChange={this.changeValue} />);
    }
}