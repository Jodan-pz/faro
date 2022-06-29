import * as React from 'react';
import { Visibility, TableProps, TableHeaderCellProps, TableCellProps, Table } from 'semantic-ui-react';


export const ITBCell = (props: TableCellProps & { miniPadding?: boolean }) => {
    const { children, content, miniPadding, ...cellProps } = props;
    const child = content || children;
    cellProps.title = cellProps.singleLine && !cellProps.title && !React.isValidElement(child) ? child : cellProps.title;
    if (miniPadding) cellProps.className = `${cellProps.className || ''} minipadding`;
    return <Table.Cell singleLine verticalAlign="middle" {...cellProps}>{child}</Table.Cell>;
};

// 'descending' | 'ascending'
class Header extends React.PureComponent<InfinityTableHeader> {
    render() {
        const { name, onChangeDirection, icon, style } = this.props;
        let headerProps: TableHeaderCellProps = {};
        for (const key in this.props) {
            if (this.props.hasOwnProperty(key)) {
                if (key !== 'name' && key !== 'onChangeDirection' && key !== 'icon') {
                    const element = this.props[key];
                    headerProps[key] = element;
                }
            }
        }

        if (onChangeDirection) {
            headerProps.onClick = (ev: any) => {
                onChangeDirection(name || '');
            };
        }

        return (
            <Table.HeaderCell style={style} {...headerProps} collapsing singleLine >
                {icon && icon} {name}
            </Table.HeaderCell >
        );
    }
}

/*
const Header = (props: TableHeaderCellProps & { orderByCol?: string, orderByVal?: string, onOrderBy?: (col: string, direction: string) => void }) => {
    const { orderByCol, orderByVal = '', onOrderBy, ...cellProps } = props;

    if (orderByCol && onOrderBy) {
        const sorted = (orderByVal.indexOf(orderByCol) !== -1);
        const direction = sorted ? (orderByVal.indexOf('desc') !== -1 ? 'descending' : 'ascending') : undefined;
        cellProps.sorted = direction;
        cellProps.onClick = onOrderBy(orderByCol, (direction !== 'descending' ? 'desc' : 'asc'));
    }

    return <Table.HeaderCell collapsing singleLine {...cellProps} />;
};
*/
//  & { orderByCol?: string, orderByVal?: string, onOrderBy?: (col: string, direction: string) => void }





export interface InfinityTableHeader extends TableHeaderCellProps {
    name?: string;
    style?: React.CSSProperties;
    onChangeDirection?: (name: string) => void;
}
// dividerrender?: (page: number) => any;
export interface InfinityTableProps {
    headerColumn?: Array<InfinityTableHeader>;
    tableProp?: TableProps;
    rowrender: (row: number, data: any) => any;
    onChangePage?: (pageIndex?: number, pageSize?: number) => any;
    pageIndex?: number;
    pageSize?: number;
    listData?: Array<any>;
}

interface InfinityTableState {

}

export class InfinityTable extends React.Component<InfinityTableProps, InfinityTableState> {

    constructor(props: any) {
        super(props);
    }

    private onChangepage(pageIndex: number) {
        if (this.props.onChangePage) {
            this.props.onChangePage(pageIndex, this.props.pageSize);
        }
    }
    render() {
        const { tableProp, headerColumn, listData, children, pageSize = 0, pageIndex = 1 } = this.props;
        // ={column === 'name' ? direction : null}
        if (listData === undefined || listData.length === 0) return null;
        // ==================================
        const expdLength = pageSize * pageIndex;
        const dataLength = listData.length;
        let visibilityIndex: number | undefined = undefined;
        if (dataLength === expdLength) {
            visibilityIndex = expdLength - Math.floor(pageSize * 40 / 100);
        }
        // ================================== 


        let listElemnts: Array<any> = listData.map((obj: any, index: number) => {
            let element: any = this.props.rowrender(index, obj);
            return (
                <Table.Row key={'row-' + index}>
                    {element}
                    {visibilityIndex === index &&
                        <Table.Cell style={{ width: '0px', height: '0px', border: '0px', padding: '0px' }}>
                            <Visibility offset={0} onOnScreen={() => this.onChangepage(pageIndex + 1)} />
                        </Table.Cell>
                    }
                </Table.Row>);
        });

        let listHeaders: Array<any> = (headerColumn || []).map((col: InfinityTableHeader, indexColumn: number) => {
            return (<Header key={indexColumn} {...col} />);
        });

        return (
            <Table {...tableProp} >
                {listHeaders && listHeaders.length > 0 &&
                    <Table.Header >
                        <Table.Row >
                            {listHeaders}
                        </Table.Row>
                    </Table.Header>}
                <Table.Body>
                    {listElemnts}
                </Table.Body>
            </Table>
        );
    }
}




/*




<Table {...tableProp} >
                {headerColumn && headerColumn.length > 0 &&
                    <Table.Header >
                        <Table.Row >
                            {headerColumn.map((col: InfinityTableHeader, index: number) => {
                                let props: TableHeaderCellProps = col as TableHeaderCellProps;
                                return (<Header key={index} {...props} >{props.icon && props.icon}{col.name}</Header>);
                            })}
                        </Table.Row>
                    </Table.Header>}

                <Table.Body>
                    {listElemnts}
                </Table.Body>
            </Table>





 <Visibility onUpdate={this.handleUpdate}>

 <div style={{ width: '500px', height: '2000px', backgroundColor: 'yellow' }} />
 <div style={{ width: '500px', height: '1000px', backgroundColor: 'red' }} />

 {visibilityIndex === index
                        ? <Visibility offset={0} onOnScreen={() => this.onChangepage(pageIndex + 1)}><div /></Visibility>
                        : undefined}

*/
