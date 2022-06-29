import * as React from 'react';
import * as reducers from '../../reducers';
import { ArgumentFilter, AggregatorModel, UNIQUE_IMAGE, ArgumentListImage, ImageModel, ArgumentListAggregator } from '../../actions/model';
import { aggregatorSearch, aggregatorSearchClear, aggregatorDelete, imageSearch, imageSearchClear } from '../../actions';
import { Button, Menu } from 'semantic-ui-react';
import { HeaderMenuWidget } from '../shared/MenuWidget';
import { Link, appConnector } from 'app-support';
import { ConfirmWidget } from '../shared/DialogWidget';
import { addMessage } from '../../actions/indexMsg';
import { TypeMessage } from '../../actions/modelMsg';
import { Filter } from '../shared/Filter';
import { tagsToString, searchArgumetListImage, SortedState, SortValue, multiSorting } from '../Utils';
import { InfinityTable, ITBCell, InfinityTableHeader } from '../lib/InfinityTable';


interface AggregatorListProps {
    uniqueId: string;
    root?: string;
    defaultParms?: any;
    historyAction?: string;
    onSelection?: (item: AggregatorModel) => void;
}
interface AggregatorListState extends SortedState {
    contextRef: any;
}
const conn = appConnector<AggregatorListProps>()(
    (s, p) => ({
        data: reducers.getAggregatorsSearch(s, p.uniqueId),
        currFilter: reducers.getFilter(s),

        imageList: reducers.getImageSearch(s, UNIQUE_IMAGE),
        isNewImages: reducers.isImagesEmpty(s, UNIQUE_IMAGE)
    }),
    {
        aggregatorSearch,
        aggregatorSearchClear,
        aggregatorDelete,
        addMessage,
        imageSearch,
        imageSearchClear,
    }
);

class AggregatorListCompo extends conn.StatefulCompo<AggregatorListState> {

    pages: { pageIndex: number, pageSize: number } = { pageIndex: 1, pageSize: 20 };
    oldFilter: any = undefined;
    state = {
        contextRef: undefined,
        sorted: {}
    };
    listClick: Array<string> = [];
    handleContextRef = (contextRef: any) => {
        this.setState({ ...this.state, contextRef });
    }

    componentWillUnmount(): void {
        this.props.aggregatorSearchClear(this.props.uniqueId);
    }
    componentDidMount() {

        if (window && window.scrollTo) window.scrollTo(0, 0);

        this.onSearch();

        if (this.props.historyAction === 'PUSH' || this.props.historyAction === 'REPLACE' || this.props.isNewImages) {
            const params: ArgumentListImage = searchArgumetListImage();
            this.props.imageSearch(params);
        }
    }

    onSearch = () => {
        const { currFilter, defaultParms } = this.props;

        if (this.oldFilter !== currFilter) {
            this.oldFilter = currFilter;
            this.pages.pageIndex = 1;
        }


        const params: ArgumentListAggregator = {
            uniqueId: this.props.uniqueId,
            ...(currFilter as ArgumentFilter),
            ...defaultParms,
            pageIndex: this.pages.pageIndex,
            pageSize: this.pages.pageSize
        };
        this.props.aggregatorSearch(params);
    }


    callBackResult = (res: any) => {
        if (res) {
            if (res.Errors && res.Errors.lenght > 0) {
                this.props.addMessage({
                    id: 'deleted-aggregator',
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

    onDelete = (v: AggregatorModel) => {
        if (this.props.aggregatorDelete) {
            this.props.aggregatorDelete({ aggregator: v, call: this.callBackResult });
        }
    }

    onChangePage = (pIndex: number, pSize: number) => {
        this.pages.pageIndex = pIndex;
        this.onSearch();
    }

    rowRender = (row: number, data: any) => {
        const { root } = this.props;
        let tagsObj: { title: string, value: string } = tagsToString(data && data.tags);
        let nameImage: string = '';
        if (this.props.imageList) {
            let image: ImageModel | undefined = this.props.imageList.find(img => img.id === (data as AggregatorModel).image);
            if (image && image.name) nameImage = image.name;
        }

        let kind: any = (data as AggregatorModel).kind;

        return (
            <>
                <ITBCell width="4">{data.name}</ITBCell>
                <ITBCell width="4">{nameImage}</ITBCell>
                <ITBCell width="2">{kind}</ITBCell>
                <ITBCell width="4">{data.description}</ITBCell>
                <ITBCell width="4">
                    <span title={tagsObj.title}>{tagsObj.value}</span>
                </ITBCell>
                <ITBCell width="4" textAlign="center">
                    <ConfirmWidget children={`Are you sure you want delete ${data.name} item?`} onConfirm={() => this.onDelete(data)} trigger={<Button content="Delete" icon="delete" basic color="red" />} />
                    <Button as={Link} content="Edit" to={`${root}/${data.id}/edit`} icon="edit" basic color="green" />
                    <Button as={Link} content="Usage" to={`${root}/Usage/${data.id}`} icon="linkify" basic color="violet" />
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
                else if (dataName === 'Image') {
                    let nameImage: string = '';
                    if (this.props.imageList) {
                        let image: ImageModel | undefined = this.props.imageList.find(img => img.id === (dt as AggregatorModel).image);
                        if (image && image.name) nameImage = image.name;
                    }
                    return nameImage;
                } else if (dataName === 'Kind') return (dt as AggregatorModel).kind;
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
        let tagsHeadar: Array<string> = ['Name', 'Image', 'Kind', 'Description'];
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
                <HeaderMenuWidget header={'Aggregators'} icon="list layout" >
                    <Filter onSearch={this.onSearch} />
                    <Menu.Item as={Link} to={`/Aggregators/new`} icon="plus" content="New" />
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

export const AggregatorList = conn.connect(AggregatorListCompo);
