import * as React from 'react';
import { isArray } from 'util';
import { getColsRows, KEYWORD } from './UtilLib';
import { Icon, Segment, Menu } from 'semantic-ui-react';
import { Copy } from '../shared/Copy';
import { MTable, SortUtil } from './mtable/MTable';
import { Column, SortPosition, ColumnProps } from './mtable/TableDefinition';
import { TablePagination } from './TablePagination';
import { SelectDropDown } from './SelectDropdown';
import { ResultTable } from './ResultTable';

export interface ResultTableViewProps {
    data?: any;
    adderMessage?: any;
}
interface ResultTableViewState {
    currentPage: number;
    listData?: any;
    columns: Array<any>;
    origcolumns: Array<any>;
    activeColumns: Array<string>;
}

export class ResultTableView extends React.Component<ResultTableViewProps, ResultTableViewState> {
    icoSort = {
        up: <Icon name="angle up" color={'green'} />,
        default: <Icon name="square outline" color={'green'} size="small" />,
        down: <Icon name="angle down" color={'green'} />,
    };
    constructor(props: ResultTableViewProps) {
        super(props);
        this.state = this.setDefaultState(props);
    }


    setDefaultState = (props: ResultTableViewProps): ResultTableViewState => {
        let listData = isArray(props.data.Result) ? props.data.Result : [props.data.Result];
        const keys = Object.keys(listData[0] || {});
        let cols: Array<Column> = getColsRows(keys);
        return {
            currentPage: 1,
            listData: listData,
            columns: cols.slice(),
            origcolumns: cols.slice(),
            activeColumns: keys.slice()
        };
    }

    textProvider = () => {
        const { listData, columns, activeColumns } = this.state;

        if (listData && listData.length > 0) {

            let activeCols =  activeColumns.map( (act: string ) => {
                let index: number = columns.findIndex( (r: ColumnProps) => r.name === act);
                return columns[index];
            });

            let lines: Array<string> = listData.map((r: any, indx: number) => {
                let lineRor: string = '';
                let c: number = 0;
                activeCols.forEach(element => {
                    c++;
                    let dataName: string = typeof (element) === 'string' ? element : (element as ColumnProps).dataName!;
                    let val: string = '' + r[dataName];
                    lineRor += val.trim() + (c < columns.length ? '\t' : '');
                });
                return lineRor;
            });
            let lineHead: string = '';
            columns.forEach(element => lineHead += typeof (element) === 'string' ? element : (element as ColumnProps).dataName! + '\t');
            lines.unshift(lineHead);
            return lines.join('\n');
        }
        return '';
    }

    onChangeSelectColumns = (list: Array<string>) => {
        this.setState({ ...this.state, activeColumns: [...list] });
    }


    render() {
        const { listData, columns, currentPage, activeColumns, origcolumns } = this.state;
        let totalData: number = listData.length;
        let pageSize: number = 20;
        let footerActive: boolean = totalData > pageSize;
        let startIndex: number = (currentPage - 1) * pageSize;
        let silceOfData: Array<any> = (listData as Array<any>).slice(startIndex, startIndex + pageSize);

        let cols: Array<ColumnProps> = [];
        let key: string = 'key';
         
        columns.forEach( (c: ColumnProps) => {
            if (activeColumns.find((item: string) => c.name === item) !== undefined ) {
                key += c.name;
                cols.push(c);
            }
        });

        let selectColumns: Array<string> = origcolumns.map( (c: Column) => {
            if (typeof (c) === 'string')return c;
            return (c as ColumnProps).name;
        });

        return (
            <Segment style={{ overflowY: 'auto', marginTop: '10px' }}>
                <Menu>
                    <div style={{ margin: 'auto', marginRight: '0px', display: 'flex' }}> 
                        <SelectDropDown list={selectColumns} onChange={(list: Array<string>) => this.onChangeSelectColumns(list)} />
                        <Copy button={{ color: 'blue' }} textProvider={this.textProvider} />
                    </div>
                </Menu>

                <ResultTable
                    key={key + currentPage}
                    name={'rows'}
                    columns={cols}
                    data={silceOfData}
                    icoSort={this.icoSort}
                    onDragColumn={(oldIndex: number, newIndex: number) => {
                        // le colonne attualmente visibili
                        let item1: any = cols[oldIndex];
                        let item2: any = cols[newIndex];
                        let oldNameCol: string = (item1 as ColumnProps).name;
                        let newNameCol: string = (item2 as ColumnProps).name;
                        let oldIndexRow: number = columns.findIndex((c: ColumnProps) => c.name === oldNameCol);
                        let newIndexRow: number = columns.findIndex((c: ColumnProps) => c.name === newNameCol);
                        columns[newIndexRow] = item1;
                        columns[oldIndexRow] = item2;
                        this.setState({ ...this.state, columns: [...columns] });
                    }}
                />

                {footerActive &&
                    <TablePagination
                        activePage={currentPage}
                        totalSize={totalData}
                        pageSize={pageSize}
                        onChangePage={(page: number) => {
                            this.setState({ ...this.state, currentPage: page });
                        }}
                    />}

            </Segment>);
    }
}