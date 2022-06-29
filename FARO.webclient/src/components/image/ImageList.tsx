import * as React from 'react';
import * as reducers from '../../reducers';
import { ImageModel, ArgumentFilter } from '../../actions/model';
import { imageSearch, imageSearchClear, imageDelete, cloneItem } from '../../actions';
import { Link, appConnector } from 'app-support';
import { HeaderMenuWidget } from '../shared/MenuWidget';
import { Button, Menu } from 'semantic-ui-react';
import { ConfirmWidget } from '../shared/DialogWidget';
import { addMessage } from '../../actions/indexMsg';
import { TypeMessage } from '../../actions/modelMsg';
import { tagsToString, SortedState, SortValue, multiSorting } from '../Utils';
import { Filter } from '../shared/Filter';
import { ITBCell, InfinityTableHeader, InfinityTable } from '../lib/InfinityTable';


interface ImageListProps {
    uniqueId: string;
    onContinue?: (where: string) => void;
    root?: string;
    defaultParms?: any;
    historyAction?: string;
    onSelection?: (item: ImageModel) => void;
}
interface ImageListState extends SortedState {
    contextRef: any;
}
const conn = appConnector<ImageListProps>()(
    (s, p) => ({
        data: reducers.getImageSearch(s, p.uniqueId),
        currFilter: reducers.getFilter(s)
    }),
    {
        imageSearch,
        imageSearchClear,
        imageDelete,
        addMessage,
        cloneItem
    }
);

class ImageListCompo extends conn.StatefulCompo<ImageListState> {
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
    componentWillUnmount(): void {
        this.props.imageSearchClear(this.props.uniqueId);
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

        this.props.imageSearch(params);
    }
    onChangePage = (pIndex: number, pSize: number) => {
        this.pages.pageIndex = pIndex;
        this.onSearch();
    }

    callBackResult = (res: any) => {
        if (res) {
            if (res.Errors && res.Errors.lenght > 0) {
                this.props.addMessage({
                    id: 'deleted-image',
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

    onDelete = (v: ImageModel) => {
        if (this.props.imageDelete) {
            this.props.imageDelete({ image: v, call: this.callBackResult });
        }
    }
    cloneItem = (item: ImageModel) => {
        const { root } = this.props;
        if (this.props.cloneItem && this.props.onContinue && root) {
            let clItem: ImageModel = {
                name: 'Clone of ' + item.name,
                description: item.description,
                keys: [...(item.keys || [])],
                layers: [...(item.layers || [])],
                tags: [...(item.tags || [])]
            };
            this.props.cloneItem(clItem);
            this.props.onContinue(root);
        }
    }
    rowRender = (row: number, data: any) => {
        const { root } = this.props;
        let tagsObj: { title: string, value: string } = tagsToString(data && data.tags);
        return (
            < >
                <ITBCell width="4">{data.name} </ITBCell>
                <ITBCell width="4">{data.description}</ITBCell>
                <ITBCell width="4">
                    <span title={tagsObj.title}>{tagsObj.value}</span>
                </ITBCell>
                <ITBCell width="4" textAlign="center">
                    <ConfirmWidget children={`Are you sure you want delete ${data.name} item?`} onConfirm={() => this.onDelete(data)} trigger={<Button content="Delete" icon="delete" basic color="red" />} />
                    <Button as={Link} content="Edit" to={`${root}/${data.id}/edit`} icon="edit" basic color="green" />
                    <Button as={Link} content="Build" to={`${root}/${data.id}/run`} icon="cogs" basic color="black" />
                    <Button as={Link} content="Check" to={`${root}/${data.id}/validate`} icon="certificate" basic color="orange" />
                    <Button as={Link} content="Usage" to={`${root}/Usage/${data.id}`} icon="linkify" basic color="violet" />
                    <ConfirmWidget
                        children={`Are you sure you want to clone ${data.name} item?`}
                        onConfirm={() => this.cloneItem(data)}
                        trigger={<Button content="Clone" icon="clone outline" basic color="blue" />}
                    />
                </ITBCell>
            </ >
        );
    }
    getSortValue = (status: number, dataName: string) => {
        return {
            status: status,
            dataName: dataName,
            getValue: (dataName: string, dt: any) => {
                if (dataName === 'Name') return dt.name;
                else if (dataName === 'Description') return dt.description || '';
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
        let tagsHeadar: Array<string> = ['Name', 'Description'];
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
                <HeaderMenuWidget header={'Images'} icon="list layout" >
                    <Filter onSearch={this.onSearch} />
                    <Menu.Item as={Link} to={`/Images/new`} icon="plus" content="New" />
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

export const ImageList = conn.connect(ImageListCompo);