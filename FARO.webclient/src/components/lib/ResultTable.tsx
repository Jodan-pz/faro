import * as React from 'react';
import { SortUtil } from './mtable/MTable';
import { Column, SortPosition , ColumnProps } from './mtable/TableDefinition';
import { DefaultTable } from './DefaultTable';
  
interface ResulTableProps {
    name: string;
    columns: Array<Column>;
    data: Array<any>;
    icoSort: any;
    onDragColumn?: (oldIndex: number, newIndex: number) => void;
}

interface ResulTableState {
    columns: Array<Column>;
    listData: Array<any>;
}

export class ResultTable extends React.Component<ResulTableProps, ResulTableState> {
   
    constructor(props: ResulTableProps) {
        super(props);
        this.state = {columns: [...props.columns], listData: [...props.data]};
    }
    render() {
        const { name, icoSort, onDragColumn} = this.props;
        const {columns, listData} = this.state;
        return (
            <DefaultTable 
                name={name}
                columns={columns}
                data={listData}
                icoSort={icoSort}
                pageSize={20}
                onTableSort={(multiSort: boolean, sortingList: Array<SortPosition>) => {
                    this.setState({ ...this.state, listData: SortUtil(multiSort, sortingList, listData.slice()) });
                }}
                onResizeColumn={(nameColumn: string, newWidth: number) => {
                    let colIndex: number = columns.findIndex(c => {
                        let isString: boolean = typeof (c) === 'string';
                        return isString ? (c as string) === nameColumn : (c as ColumnProps).name === nameColumn;
                    });
                    if (colIndex >= 0) {
                        let curCol: Column = columns[colIndex];
                        let isString: boolean = typeof (curCol) === 'string';
                        columns[colIndex] = isString ? { name: nameColumn, width: newWidth } : { ...curCol as ColumnProps, width: newWidth };
                        this.setState({ ...this.state, columns: [ ...columns ] });
                    }
                }}
                onDragColumn={(oldIndex: number, newIndex: number) => {
                    if (onDragColumn !== undefined) {
                        onDragColumn(oldIndex, newIndex);
                    } else {
                        let item1: any = columns[oldIndex];
                        let item2: any = columns[newIndex];
                        columns[newIndex] = item1;
                        columns[oldIndex] = item2;
                        this.setState({ ...this.state, columns: [...columns] });
                    }
                }}
            />
        );
    }
}