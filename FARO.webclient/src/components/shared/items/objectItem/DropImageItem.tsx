import * as React from 'react';
import { ItemValue, ImageModel } from '../../../../actions/model';
import '../../../../styles/items/items.css';
import { DropValue } from '../DropValue';
import { Label, Button, Table } from 'semantic-ui-react';
import { Link } from 'app-support';
import { ConfirmWidget } from '../../DialogWidget';



interface DropImageItemProps extends ItemValue<string | null> {
    listImage: ImageModel[] | undefined;
    modified?: boolean;
    onEdit?: (where: string, id: string) => void;
}

type ImageItemText = {
    text: string;
    value: { description: string, id: string | null };
};

export class DropImageItem extends React.Component<DropImageItemProps, {}> {
    constructor(props: DropImageItemProps) {
        super(props);
    }

    listenerItemChange = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            this.props.onChange(this.props.name !== undefined ? this.props.name : '', newValue);
        }
    }
    getCurrentType = (list: ImageItemText[], value: string | null | undefined) => {
        return list.find((element: ImageItemText) => {
            return element.value.id === value;
        });
    }

    onConfirm = (where: string, id: string) => {
        if (this.props.onEdit) {
            this.props.onEdit(where, id);
        }
    }

    render() {
        const { value, disabled, modified, listImage } = this.props;
        let clzz: string = (this.props.className ? 'labeledContainerBox ' + this.props.className : 'labeledContainerBox');
        let style: React.CSSProperties = this.props.style ? this.props.style : {};
        let items: ImageItemText[] = [];
        if (listImage && listImage.length > 0) {
            items.push({
                text: '',
                value: { description: '', id: null }
            });
            listImage.forEach((val: ImageModel) => {
                if (val.name && val.name.length > 0) {
                    items.push({
                        text: val.name,
                        value: { description: val.description || '', id: val.id! }
                    });
                }
            });
        }

        let currValue: ImageItemText | undefined = this.getCurrentType(items, value);
        let name: string = currValue ? currValue.text : '';
        let description: string = currValue && currValue.value && currValue.value.description && currValue.value.description.length > 0 ? currValue.value.description : '';
        let linkId: string = currValue && currValue.value && currValue.value.id && currValue.value.id.length > 0 ? currValue.value.id : '';
        let whereGo: string = '/Images';
        let enableBTN: boolean = linkId.length > 0;
        let link: string = whereGo + '/' + linkId + '/edit';

        return (
            <div className={clzz} style={style} >

                <Table style={{ width: '100%' }}>
                    <Table.Body>
                        <Table.Row>

                            <Table.Cell width="2" textAlign="center">
                                {description}
                            </Table.Cell>

                            <Table.Cell>
                                <DropValue
                                    style={{ width: '100%' }}
                                    name={this.props.name}
                                    selection
                                    search
                                    disabled={disabled}
                                    items={items}
                                    keyValue={'text'}
                                    multiple={false}
                                    value={currValue}
                                    onChange={(name: string | number, newValue: ImageItemText) => this.listenerItemChange(name, newValue.value.id)}
                                />
                            </Table.Cell>

                            <Table.Cell width="2">

                                {!modified && <Button disabled={!enableBTN} style={{ width: '90%' }} as={Link} to={link} icon="arrow alternate circle right" />}

                                {modified &&
                                    <ConfirmWidget
                                        children={`The item has not been saved, continue?`}
                                        onConfirm={() => this.onConfirm(whereGo, linkId)}
                                        trigger={
                                            <Button
                                                disabled={!enableBTN}
                                                style={{ width: '90%' }}
                                                icon="arrow alternate circle right"
                                            />
                                        }
                                    />}
                            </Table.Cell>

                        </Table.Row>
                    </Table.Body>
                </Table>

            </div>
        );
    }
}
