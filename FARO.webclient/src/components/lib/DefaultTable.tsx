import * as React from 'react';
import { MTable } from './mtable/MTable';
import { Column, SortPosition  } from './mtable/TableDefinition';
import { Icon } from 'semantic-ui-react';
 

interface DefaultTableProps {
    name: string;
    columns: Array<Column>;
    data: Array<any>;
    pageSize: number;
    icoSort: any;
    onTableSort: (multiSort: boolean, sortingList: Array<SortPosition>) => void;
    onResizeColumn: (nameColumn: string, newWidth: number) => void;
    onDragColumn: (oldIndex: number, newIndex: number) => void;
}
 
const KEYWORD: string = '#key:';
 
export class DefaultTable extends React.PureComponent<DefaultTableProps> {
    constructor(props: DefaultTableProps) {
        super(props);
    }
    render () {
        const {name, data, columns, pageSize, icoSort, onTableSort, onResizeColumn, onDragColumn} = this.props;
        return (
            <MTable 
                style={{ width: '100%' }}
                session={name}
                name={name}
                columns={columns}
                data={data}
                multiSort
                alternateRows
                rowSeparator
                columnSeparator
                draggable
                resizable
                maxRows={pageSize}
                minRows={5}
                icoSort={{ ...icoSort }}
                headerRender={(name: string, dataname: string) => {
                    let existKey: boolean = dataname.indexOf(KEYWORD) >= 0;
                    return (<div style={{ width: '100%', display: 'flex' }}>
                        {existKey && <Icon name="key" color={'black'} />}
                        <div style={{ marginLeft: existKey ? '4px' : '0px' }}>{name}</div>
                    </div>);
                }}
                cellRender={(dataname: string, data: any, row: number) => {
                    if (data !== undefined) {
                        let val: any = data[dataname];
                        if (val === null) {
                            return (<div style={{ width: '100%', color: '#bcbcbc' }}>null</div>);
                        }
                        return val;
                    }
                    return '';
                }}
                sort={(multiSort: boolean, sortingList: Array<SortPosition>) => {
                    onTableSort(multiSort, sortingList);
                }}
                onResizeColumn={(nameColumn: string, newWidth: number) => {
                    onResizeColumn(nameColumn, newWidth);
                }}
                onDragColumn={(oldIndex: number, newIndex: number) => {
                    onDragColumn(oldIndex, newIndex);
                }}
            />
        );
    }
}