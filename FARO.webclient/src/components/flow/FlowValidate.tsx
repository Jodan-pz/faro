import * as React from 'react';
import * as reducers from '../../reducers';
import { appConnector, Link } from 'app-support';
import { flowGet, flowCheck, clearCurrentFlowCheck } from '../../actions';
import Table, { Column, ColumnRenderProps, ColumnProps } from 'mildev-react-table';
import { Segment, Header, Icon, Popup, Checkbox, CheckboxProps, Menu, Button } from 'semantic-ui-react';
import { CheckResultCollectionModel } from 'src/actions/model';
import { CheckResultItem, CheckArea, CheckResultLevel } from 'mglib-faro.webclient/MGLib_FARO.WEBAPI';
import * as moment from 'moment';
import { STYLECELL, STYLEHEAD, multiSorting } from '../Utils';
import { Copy } from '../shared/Copy';


const conn = appConnector<{ id: string }>()(
    (s, p) => ({
        current: reducers.getCurrentFlow(s),
        check: reducers.getCurrentCheck(s)
    }),
    {
        flowGet,
        clearCurrentFlowCheck,
        flowCheck
    }
);

class FlowValidate extends conn.StatefulCompo<{ pagination: boolean }> {
    divTogo: string;
    constructor(props: any) {
        super(props);
        this.state = { pagination: false };
    }
    componentDidMount() {
        this.props.flowGet(this.props.id);
        this.props.flowCheck(this.props.id);
    }
    componentWillUnmount(): void {
        this.props.clearCurrentFlowCheck();
        window.scrollTo(0, 0);
    }


    getColumns = () => {
        return [
            {
                idColumn: 'Time Stamp',
                dataName: 'ts',
                contexts: ['table'],
                width: 130,
                renderValueCell: (indexRow: number, column: ColumnRenderProps, dataRow: any) => {
                    let ts: string = (dataRow as CheckResultItem).ts;
                    if (ts && ts.length > 0) return moment((dataRow as CheckResultItem).ts).format('HH:mm:ss.SSS');
                    return '';
                }
            },
            {
                idColumn: 'Area',
                dataName: 'area',
                contexts: ['table'],
                width: 130,
                renderValueCell: (indexRow: number, column: ColumnRenderProps, dataRow: any) => {
                    let area: CheckArea = (dataRow as CheckResultItem).area;
                    return CheckArea[area];
                }
            },
            {
                idColumn: 'Level',
                dataName: 'level',
                contexts: ['table'],
                width: 100,
                renderValueCell: (indexRow: number, column: ColumnRenderProps, dataRow: any) => {
                    let level: CheckResultLevel = (dataRow as CheckResultItem).level;
                    return CheckResultLevel[level];
                }
            },
            {
                idColumn: 'Message',
                dataName: 'message',
                contexts: ['table'],
                resizable: true,
                cellRender: (indexRow: number, column: ColumnRenderProps, dataRow: any) => {
                    return (
                        <Popup
                            key={dataRow.message}
                            trigger={<span>{dataRow.message}</span>}
                            content={dataRow.message}
                        />);
                }
            },
            {
                idColumn: 'ID',
                dataName: 'id',
                contexts: ['table'],
                cellRender: (indexRow: number, column: ColumnRenderProps, dataRow: any) => {
                    return (
                        <Popup
                            key={dataRow.id}
                            trigger={<span>{dataRow.id}</span>}
                            content={dataRow.id}
                        />);
                }
            }
        ] as Array<Column>;
    }
    textProvider = () => {
        const { check } = this.props;
        let checkResult: CheckResultCollectionModel | null = check as CheckResultCollectionModel;
        let resItem: CheckResultItem[] = checkResult && checkResult.items ? checkResult.items : [];
        if (resItem && resItem.length > 0) {
            const rowsHead = Object.keys(resItem[0] || {});
            let lines: Array<string> = resItem.map((r: any, indx: number) => {
                let lineRor: string = '';
                let c: number = 0;
                rowsHead.forEach(element => {
                    c++;
                    let val: string = '' + r[element];
                    lineRor += val.trim() + (c < rowsHead.length ? '\t' : '');
                });
                return lineRor;
            });
            let lineHead: string = '';
            rowsHead.forEach(element => lineHead += element + '\t');
            lines.unshift(lineHead);
            return lines.join('\n');
        }
        return '';
    }
    render() {
        const { pagination } = this.state;
        const { current, check } = this.props;
        if (current) {
            let checkResult: CheckResultCollectionModel | null = check as CheckResultCollectionModel;
            let hasErrors: boolean = checkResult ? checkResult.hasErrors : false;
            let resItem: CheckResultItem[] = checkResult && checkResult.items ? checkResult.items : [];
            let style: React.CSSProperties = { color: 'green' };
            if (hasErrors) style = { color: 'red' };
            let goto: any = !pagination && hasErrors ? (
                <div style={{ marginLeft: '5px', marginBottom: 'auto', marginTop: 'auto' }}>
                    <Button
                        color="red"
                        size="massive"
                        circular
                        icon={'arrow right'}
                        onClick={() => {
                            if (this.divTogo) {
                                let elmnt = document.getElementById(this.divTogo);
                                if (elmnt && elmnt.scrollIntoView) elmnt.scrollIntoView({ inline: 'center' });
                            }
                        }}
                    />
                </div>) : '';

            let columnsTable: Array<Column> = this.getColumns();

            let ids: Array<any> = [];
            ids.push({ name: 'Image', pre: '/Images/', id: current && current.image && current.image.length > 0 ? current.image : '' });
            ids.push({ name: 'Validator', pre: '/Validators/', id: current && current.validator && current.validator.length > 0 ? current.validator : '' });
            ids.push({ name: 'Aggregator', pre: '/Aggregators/', id: current && current.aggregator && current.aggregator.length > 0 ? current.aggregator : '' });
            ids.push({ name: 'Writer', pre: '/Writers/', id: current && current.writer && current.writer.length > 0 ? current.writer : '' });
            ids.push({ name: 'Flow', pre: '/Flows/', id: current && current.id && current.id.length > 0 ? current.id : '' });


            return (
                <Segment>
                    <Header style={{ ...style, display: 'flex' }}>
                        <Icon name="certificate" />
                        <div style={{ display: 'flex' }}>
                            <div style={{ marginRight: '20px' }}>{current && current.name || ''}</div>
                            {hasErrors && goto}
                            {!hasErrors && <Icon name={'check'} />}
                        </div>

                    </Header>

                    <Menu>
                        <Menu.Item>
                            <Checkbox
                                label={'PAGINATION'}
                                disabled={resItem.length < 20}
                                style={{ margin: '5px' }}
                                checked={pagination}
                                onChange={(event: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => this.setState({ pagination: !pagination })}
                            />
                        </Menu.Item>

                        <Menu.Menu position="right">
                            {ids.map((val: any, index: number) => {
                                let name: string = val.name;
                                let id: string = val.id;
                                let disabled: boolean = id.length === 0;
                                let link: string = val.pre + id + '/edit';
                                return (<Menu.Item disabled={disabled} key={index} as={Link} to={link} icon="edit" content={name} />);
                            })}

                            <Menu.Item>
                                <Copy button={{ color: 'blue' }} textProvider={this.textProvider} />
                            </Menu.Item>

                        </Menu.Menu>

                    </Menu>

                    {resItem.length > 0 &&
                        <Segment> <Table
                            id={'validateTable'}
                            columns={columnsTable}
                            data={resItem}
                            styleCell={STYLECELL}
                            styleHeadColumn={STYLEHEAD}
                            styleCellRender={(row: number, column: ColumnRenderProps, dataRow: any) => {

                                let level: CheckResultLevel = (dataRow as CheckResultItem).level;
                                if (level === CheckResultLevel.Info) return null;
                                let color: string = level === CheckResultLevel.Warning ? 'orange' : 'red';
                                let colText: string = level === CheckResultLevel.Error ? 'white' : 'black';
                                if (level === CheckResultLevel.Error && this.divTogo === undefined) {
                                    let name = 'validateTable-col-' + column.idColumn + '-row-' + row;
                                    this.divTogo = name.replace(' ', '-');
                                }

                                return {
                                    style: {
                                        backgroundColor: color,
                                        color: colText
                                    }
                                };
                            }}
                            alternateRow
                            separator
                            sortable
                            multiSort
                            sort={(listSortableStatus: Array<{ idColumn: string; status: number; }>, listData: Array<any>): Array<any> => {

                                let mustSort: boolean = false;
                                let sortable: Array<any> = listSortableStatus.map((val: any, index: number) => {
                                    let col: Column | undefined = columnsTable.find(c => (c as ColumnProps).idColumn === val.idColumn);
                                    if (!mustSort && val.status !== 0) mustSort = true;
                                    return { dataName: (col as ColumnProps).dataName, status: val.status };
                                });


                                return mustSort ? multiSorting(sortable, [...resItem]) : [...resItem];
                            }}
                            pageSize={pagination ? 20 : undefined}
                        /></Segment>
                    }
                </Segment>);
        }
        return null;
    }
}

export default conn.connect(FlowValidate);