import * as React from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import { ImageResultModel, ImageWatcherItemLogModel } from 'src/actions/model';
import { Copy } from '../shared/Copy';
import * as lodash from 'lodash';
import { getColsRows, KEYWORD } from './UtilLib';
import { Column, SortPosition, ColumnProps } from './mtable/TableDefinition';
import { MTable, SortUtil } from './mtable/MTable';
import { TablePagination } from './TablePagination';
import '../../styles/items/items.css';
import { SelectDropDown } from './SelectDropdown';
import { ResultTable } from './ResultTable';

type TypeTable = 'Logs' | 'Rows';


interface ResultTableImageProps {
    data?: any;
    enablewatch?: boolean;
    adderMessage?: any;
}
interface ResultTableImageState {
    activeTab: string;

    logCurrentPage: number; 
    rowCurrentPage: number;
    rowActiveColumns: Array<string>;
    logData: Array<any>;
    rowData: Array<any>;

    logColumns: Array<Column>;
    rowColumns: Array<Column>;
    origRowColumns: Array<Column>;
    origDataRows: Array<any>;
    origDataLogs: Array<any>;
}



const logsList = (watcheritemlogs: ImageWatcherItemLogModel[]) => {
    const union: string = '__@__';
    let group: any = lodash.groupBy(watcheritemlogs, (item: ImageWatcherItemLogModel) => item.field! + union + item.decorator!);
    group = lodash.mapValues(group, (val: Array<ImageWatcherItemLogModel>, key: string) => {
        let count: number = val.length;
        let avg: number = 0;
        let max: number = 0;
        let min: number = Number.MAX_VALUE;
        for (let i: number = 0; i < val.length; i++) {
            let dif: number = val[i].elapsed;
            if (dif > max) max = dif;
            if (dif < min) min = dif;
            avg += dif;
        }
        let split: Array<string> = key.split(union);
        return {
            field: split[0],
            decorator: split[1],
            count: count,
            avg: avg > 0 ? avg / count : avg,
            max: String(max),
            min: String(min)
        };
    });

    return lodash.values(group);
};

const getColumnsLog = () => {
    return [{
        dataName: 'field',
        name: 'Field'
    },
    {
        dataName: 'decorator',
        name: 'Decorator'
    },
    {
        dataName: 'count',
        name: 'Count'
    },
    {
        dataName: 'min',
        name: 'Min (msec)'
    },
    {
        dataName: 'max',
        name: 'Max (msec)'
    },
    {
        dataName: 'avg',
        name: 'AVG (msec)'
    }];
};


export class ResultTableImage extends React.Component<ResultTableImageProps, ResultTableImageState> {
    icoSort = {
        up: <Icon name="angle up" color={'green'} />,
        default: <Icon name="square outline" color={'green'} size="small" />,
        down: <Icon name="angle down" color={'green'} />,
    };
    
    constructor(props: ResultTableImageProps) {
        super(props);
        this.state = this.setDefaultState(props);
    }
     
    setDefaultState = (props: ResultTableImageProps): ResultTableImageState => {
        const { data, enablewatch } = props;
        let logCurrentPage: number = 1;
        let rowCurrentPage: number = 1;
        let logData: Array<any> = [];
        let rowData: Array<any> = [];
        let logColumns: Array<Column> = [];
        let rowColumns: Array<Column> = [];
        let origDataRows: Array<any> = [];
        let origDataLogs: Array<any> = [];
        let rowActiveColumns: Array<string> = [];
        
        if (data.Status && data.Result) {
            let res: ImageResultModel = data.Result;
            const { rows, watcheritemlogs } = res;
            if (rows && rows.length > 0) {
                origDataRows = rows.slice();
                rowData = origDataRows.slice();
                let rowsHead: Array<string> = Object.keys(origDataRows && origDataRows[0] || {}).sort();
                rowColumns =  getColsRows(rowsHead) as Array<Column>;
                rowActiveColumns = rowColumns.map( (c: Column) => {
                    if (typeof (c) === 'string') return c;
                    return (c as ColumnProps).name;
                });
            }
            if (watcheritemlogs && watcheritemlogs.length > 0) {
                origDataLogs = watcheritemlogs.slice();
                logData = logsList(origDataLogs.slice());
                logColumns = getColumnsLog();
            }
        }
        return {
            rowActiveColumns: rowActiveColumns,
            activeTab: 'Rows',
            logColumns: logColumns,
            logCurrentPage: logCurrentPage,
            logData: logData,
            origDataLogs: origDataLogs,
            origDataRows: origDataRows,
            rowColumns: rowColumns.slice(),
            origRowColumns: rowColumns.slice(),
            rowCurrentPage: rowCurrentPage,
            rowData: rowData
        };
    }

    getTableRows = () => {
        const { rowColumns, rowCurrentPage, rowData, rowActiveColumns } = this.state;
         
        let totalData: number = rowData.length;
        let pageSize: number = 20;
        let footerActive: boolean = totalData > pageSize;
        
        let startIndex: number = (rowCurrentPage - 1) * pageSize;
        let sliceOfData: Array<any> = (rowData as Array<any>).slice(startIndex, startIndex + pageSize);

        let cols: Array<ColumnProps> = [];
        let key: string = 'key';
         
        rowColumns.forEach( (c: ColumnProps) => {
            if (rowActiveColumns.find((item: string) => c.name === item) !== undefined ) {
                key += c.name;
                cols.push(c);
            }
        });
        // console.log('key: ' + key);
        // console.log({ sliceOfData });
        return (
            <div  style={{ overflow: 'hidden' , minHeight: '500px'}}>
                <ResultTable
                    key={key + rowCurrentPage}
                    name={'rows'}
                    columns={cols}
                    data={sliceOfData}
                    icoSort={this.icoSort}                    
                    onDragColumn={ (oldIndex: number, newIndex: number) => {
                        // le colonne attualmente visibili
                        let item1: any = cols[oldIndex];
                        let item2: any = cols[newIndex];
                        let oldNameCol: string = (item1 as ColumnProps).name;
                        let newNameCol: string = (item2 as ColumnProps).name;
                        let oldIndexRow: number  = rowColumns.findIndex( (c: ColumnProps) => c.name === oldNameCol );
                        let newIndexRow: number  = rowColumns.findIndex( (c: ColumnProps) => c.name === newNameCol );
                        rowColumns[newIndexRow] = item1;
                        rowColumns[oldIndexRow] = item2;
                        this.setState({ ...this.state, rowColumns: [...rowColumns] });
                    }}
                />

                {footerActive &&
                    <TablePagination
                       
                        activePage={rowCurrentPage}
                        totalSize={totalData}
                        pageSize={pageSize}
                        onChangePage={(page: number) => {
                            this.setState({ ...this.state, rowCurrentPage: page });
                        }}
                    />}
            </div>);
    }

    getTableLogs = () => {
        const {  logColumns, logCurrentPage, logData } = this.state;
 
        let totalData: number = logData.length;
        let pageSize: number = 20;
        let footerActive: boolean = totalData > pageSize;
        let startIndex: number = (logCurrentPage - 1) * pageSize;
        let silceOfData: Array<any> = (logData as Array<any>).slice(startIndex, startIndex + pageSize);
      
        return (
            <div style={{ overflowY: 'auto'  , minHeight: '500px'}}>
                <ResultTable
                    name={'logs'}
                    columns={logColumns}
                    data={silceOfData}
                    icoSort={this.icoSort}
                />
                {footerActive &&
                    <TablePagination
                        activePage={logCurrentPage}
                        totalSize={totalData}
                        pageSize={pageSize}
                        onChangePage={(page: number) => {
                            this.setState({ ...this.state, logCurrentPage: page });
                        }}
                    />}
            </div>);
    }
    // ==============================================

    onChangeSelectColumns = (list: Array<string>) => {
        this.setState({ ...this.state, rowActiveColumns: [...list] });
    }

    // ==============================================
    getMenu = () => {
        const { enablewatch } = this.props;
        const { activeTab, origRowColumns } = this.state;
        
        let selectColumns: Array<string> = origRowColumns.map( (c: Column) => {
            if (typeof (c) === 'string')return c;
            return (c as ColumnProps).name;
        });
        return (
            <Menu >
                <Menu.Item active={activeTab === 'Rows'} onClick={() => this.setState({ activeTab: 'Rows' })}>Rows</Menu.Item>
                {enablewatch && <Menu.Item active={activeTab === 'Logs'} onClick={() => this.setState({ activeTab: 'Logs' })}>Logs</Menu.Item>}
                {activeTab !== 'Logs' && <div style={{ margin: 'auto', marginRight: '0px', display: 'flex' }}>
                    <SelectDropDown  list={selectColumns} onChange={(list: Array<string>) => this.onChangeSelectColumns(list)} />
                    <Copy button={{ color: 'blue' }} textProvider={this.textProvider} />
                </div>}
            </Menu>);
    }
    getVisibleColumns = (isRow: boolean) => {
        const { rowColumns, logColumns, rowActiveColumns } = this.state;
        if (!isRow) return logColumns;
        return rowActiveColumns.map( (act: string ) => {
            let index: number = rowColumns.findIndex( (r: ColumnProps) => r.name === act);
            return rowColumns[index];
        });
    }
    textProvider = () => {
        const { activeTab, origDataLogs, origDataRows } = this.state;
        let isRow: boolean =  activeTab === 'Rows';
        let data: Array<any> = isRow ? origDataRows : origDataLogs;
        let visibleCol: Array<Column> = this.getVisibleColumns(isRow);
        let lines: Array<string> = data.map((r: any, indx: number) => {
            let lineRor: string = '';
            visibleCol.forEach((c: ColumnProps) => {
                lineRor += ('' + r[c.dataName || c.name]).trim() + ';';
            });
            return lineRor;
        }); 
        let lineHead = visibleCol.map((c: Column) => (c as ColumnProps).name).join(';');
        lines.unshift(lineHead);
        return lines.join('\n');
 
    }

    render() {
        const { enablewatch } = this.props;
        const { activeTab } = this.state;
        return (
            <  >
                {this.getMenu()}
                {activeTab === 'Rows' && this.getTableRows()}
                {enablewatch && activeTab === 'Logs' && this.getTableLogs()}
            </   >
        );
    }
}
