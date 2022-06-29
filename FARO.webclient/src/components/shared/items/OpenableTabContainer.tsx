import * as React from 'react';
import { Table, TableRow } from 'semantic-ui-react';

interface OpenableTabContainerProps {
    open: boolean;
    className?: string;
    style?: React.CSSProperties;
    alternateCellStyle?: Array<React.CSSProperties>;
    columns: number;
}
export class OpenableTabContainer extends React.Component<OpenableTabContainerProps, {}> {

    render() {
        const { columns, open, className, style, children , alternateCellStyle} = this.props;
        let clz: string = className || '';
        let stle: any = style || {};
        let cols: number = columns !== undefined || columns !== null ? columns : 1;
        let itemChildren: any[] = React.Children.toArray(children);
        if (itemChildren.length === 0) return null;
        let rows: number = Math.ceil(itemChildren.length / cols);
        if (rows === 0) rows = 1;
        let rowsItem: Array<any> = [];
        let index: number = 0;
        for (let i: number = 0; i < rows; i++) {
            let colItem: Array<any> = [];
            for (let j: number = 0; j < cols; j++) {
                if (index < itemChildren.length) {
                    let styleCell = alternateCellStyle ? alternateCellStyle[ index % alternateCellStyle.length] : {};
                    colItem.push(
                        <Table.Cell key={j} style={{ borderWidth: '0px', padding: '3px' , ...styleCell}}>
                            {itemChildren[index]}
                        </Table.Cell>
                    );
                    index++;
                }
            }
            rowsItem.push(
                <Table.Row key={i}  style={{ borderWidth: '0px'}}>
                    {colItem}
                </Table.Row>
            );

           
            if (!open) break;
        }
        return (
            <Table basic="very" className={clz} {...stle}>
                <Table.Body  >
                    {rowsItem}
                </Table.Body>
            </Table>
        );
    }
}