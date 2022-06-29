import * as React from 'react';
import * as reducers from '../../reducers';
import { Link, appConnector } from 'app-support';
import { WriterModel, ArgumentFilter } from '../../actions/model';
import { writerSearch, writerDelete, cloneItem } from '../../actions';
import { HeaderMenuWidget } from '../shared/MenuWidget';
import { Button, Menu } from 'semantic-ui-react';
import { ConfirmWidget } from '../shared/DialogWidget';
import { addMessage } from '../../actions/indexMsg';
import { TypeMessage } from '../../actions/modelMsg';
import { tagsToString, SortedState, SortValue, multiSorting } from '../Utils';
import { Filter } from '../shared/Filter';
import { ITBCell, InfinityTableHeader, InfinityTable } from '../lib/InfinityTable';



interface WriterListProps {
    uniqueId: string;
    onContinue?: (where: string) => void;
    root?: string;
    defaultParms?: any;
    historyAction?: string;
    onSelection?: (item: WriterModel) => void;
}
interface WriterListListState extends SortedState {
    contextRef: any;
}

const conn = appConnector<WriterListProps>()(
    (s, p) => ({
        data: reducers.getWriterSearch(s, p.uniqueId),
        currFilter: reducers.getFilter(s)
    }),
    {
        writerSearch,
        writerDelete,
        cloneItem,
        addMessage
    }
);

class WriterListCompo extends conn.StatefulCompo<WriterListListState> {
    state = {
        contextRef: undefined,
        sorted: {}
    };
    listClick: Array<string> = [];
    oldFilter: any = undefined;
    pages: { pageIndex: number, pageSize: number } = { pageIndex: 1, pageSize: 20 };

    handleContextRef = (contextRef: any) => {
        this.setState({ contextRef });
    }

    componentDidMount() {

        if (window && window.scrollTo) window.scrollTo(0, 0);

        this.onSearch();
    }
    onSearch = () => {
        const { currFilter, defaultParms } = this.props;

        if (this.oldFilter !== currFilter) {
            this.oldFilter = currFilter;
            this.pages.pageIndex = 1;
        }

        const params: any = {
            uniqueId: this.props.uniqueId,
            ...(currFilter as ArgumentFilter),
            ...defaultParms,
            pageIndex: this.pages.pageIndex,
            pageSize: this.pages.pageSize
        };
        this.props.writerSearch(params);
    }
    onChangePage = (pIndex: number, pSize: number) => {
        this.pages.pageIndex = pIndex;
        this.onSearch();
    }
    callBackResult = (res: any) => {
        if (res) {
            if (res.Errors && res.Errors.lenght > 0) {
                this.props.addMessage({
                    id: 'deleted-keysIterator',
                    modal: true,
                    stackable: true,
                    timed: false,
                    typeMessage: TypeMessage.Error,
                    title: 'Error',
                    message: res.Errors[0]
                });
            } else {
                this.pages.pageIndex = 1;
                this.onSearch();
            }
        }
    }

    onDelete = (v: WriterModel) => {
        if (this.props.writerDelete) {
            this.props.writerDelete({ writer: v, call: this.callBackResult });
        }
    }
    cloneItem = (item: WriterModel) => {
        const { root } = this.props;
        if (this.props.cloneItem && this.props.onContinue && root) {
            let clItem: WriterModel = {
                name: 'Clone of ' + item.name,
                description: item.description,
                args: item.args,
                kind: item.kind,
                config: item.config,
                tags: [...(item.tags || [])]
            };
            this.props.cloneItem(clItem);
            this.props.onContinue(root);
        }
    }
    rowRender = (row: number, data: any) => {
        const { root } = this.props;
        let tagsObj: { title: string, value: string } = tagsToString(data && data.tags);
        let kind: string = (data as WriterModel).kind || '';
        return (
            < >
                <ITBCell width="4">{data.name}</ITBCell>
                <ITBCell width="4">{data.description}</ITBCell>
                <ITBCell width="4">{kind}</ITBCell>
                <ITBCell width="4">
                    <span title={tagsObj.title}>{tagsObj.value}</span>
                </ITBCell>
                <ITBCell width="4" textAlign="center">
                    <ConfirmWidget children={`Are you sure you want delete "${data.name}" item?`} onConfirm={() => this.onDelete(data)} trigger={<Button content="Delete" icon="delete" basic color="red" />} />
                    <Button as={Link} content="Edit" to={`${root}/${data.id}/edit`} icon="edit" basic color="green" />
                    <Button as={Link} content="Usage" to={`${root}/Usage/${data.id}`} icon="linkify" basic color="violet" />
                    <ConfirmWidget
                        children={`Are you sure you want to clone ${data.name} item?`}
                        onConfirm={() => this.cloneItem(data)}
                        trigger={<Button content="Clone" icon="clone outline" basic color="blue" />}
                    />
                </ITBCell>
            </>
        );
    }
    getSortValue = (status: number, dataName: string) => {
        return {
            status: status,
            dataName: dataName,
            getValue: (dataName: string, dt: any) => {
                if (dataName === 'Name') return dt.name;
                else if (dataName === 'Description') return dt.description || '';
                else if (dataName === 'Kind') {
                    return (dt as WriterModel).kind || '';
                }
                return undefined;
            }
        };
    }
    handleSort = (name: string) => {

        const { sorted } = this.state;
        let sorting: number = sorted[name] === undefined ? 0 : sorted[name];
        sorting--;
        if (sorting < -1) sorting = 1;
        let exist: boolean = this.listClick.find(nm => nm === name) !== undefined;
        if (sorting !== 0) {
            if (!exist) this.listClick.push(name);
        } else if (sorting === 0) {
            if (exist) {
                let indx: number = this.listClick.findIndex(nm => nm === name);
                this.listClick.splice(indx, 1);
            }
        }

        sorted[name] = sorting;
        this.setState({ ...this.state, sorted: sorted });
    }

    render() {
        const { data } = this.props;
        const { sorted } = this.state;
        let listSortableStatus: Array<SortValue> = [];
        let tagsHeadar: Array<string> = ['Name', 'Description', 'Kind'];

        listSortableStatus = this.listClick.map(lc => {
            let status: number = sorted && (sorted[lc] !== undefined ? sorted[lc] : 0);
            return this.getSortValue(status, lc);
        });

        let headerColumn: Array<InfinityTableHeader> = tagsHeadar.map(nm => {
            let status: number = sorted && (sorted[nm] !== undefined ? sorted[nm] : 0);
            let sort = status === -1 ? 'descending' : (status === 0) ? null : 'ascending';
            if (status === 0) {
                listSortableStatus.push(this.getSortValue(status, nm));
            }

            let indx: number = this.listClick.findIndex(fi => fi === nm) + 1;
            let opacity: number = indx === 0 ? 0 : 1 / indx;

            return {
                name: nm,
                sorted: sort,
                style: opacity === 0 ? {} : { backgroundColor: `rgba(33, 186, 69, ${opacity})` },
                onChangeDirection: (name: string) => this.handleSort(name)
            } as InfinityTableHeader;
        });

        headerColumn.push({ name: 'Tags' });
        headerColumn.push({ name: 'Options' });

        let listData: any[] = multiSorting(listSortableStatus, [...(data as Array<any> || [])]);

        return (

            <React.Fragment>
                <HeaderMenuWidget header={'Writers'} icon="list layout" >
                    <Filter onSearch={this.onSearch} />
                    <Menu.Item as={Link} to={`/Writers/new`} icon="plus" content="New" />
                </HeaderMenuWidget>
                <br />
                <InfinityTable
                    pageIndex={this.pages.pageIndex}
                    pageSize={this.pages.pageSize}
                    onChangePage={this.onChangePage}

                    headerColumn={headerColumn}
                    tableProp={{
                        sortable: true,
                        celled: true,
                        striped: true,
                        verticalAlign: 'middle'
                    }}
                    listData={listData}
                    rowrender={this.rowRender}
                />
            </React.Fragment >
        );
    }
}

export const WriterList = conn.connect(WriterListCompo);