import * as React from 'react';
import { TableProp, BaseProps, CellRender, HeaderColumnRender, Separator, IcoSort, Column, ColumnProps, Size, PropSeparator, SortStatus, SortPosition, RowHeightRender, RetriveValue } from './TableDefinition';
import { SortableContainer, SortEnd, SortEvent, SortableElement, SortableHandle } from 'react-sortable-hoc';
import './ico.css';
import './mtable.css';
import { isArray } from 'util';

const ClazName = (def?: string, claz?: string) => {
    let tempclaz: string = claz === undefined ? '' : claz;
    return (def !== undefined ? def : '') + (tempclaz.length > 0 ? ' ' + tempclaz : '');
};
const StyleMerge = (defaultStyle?: React.CSSProperties, userStyle?: React.CSSProperties) => {
    let defaultStyleTemp: React.CSSProperties = defaultStyle === undefined ? {} : defaultStyle;
    let userStyleTemp: React.CSSProperties = userStyle === undefined ? {} : userStyle;
    return { ...defaultStyleTemp, ...userStyleTemp };
};
const TranslateStatus = (status: SortStatus): number => {
    if (status === 'default') return 0;
    if (status === 'down') return 1;
    return -1;
};
const IcoComp = (prop: any) => {
    const { ico } = prop;
    let clazzContValue: string = 'containerIcoValue';
    let value: any = prop.value;
    if (value === undefined) {
        value = 1;
        clazzContValue = clazzContValue + ' hideValue';
    }
    return (
        <div className={'icoComp'}>
            <div className={clazzContValue}>
                {value}
            </div>
            <div className={'containerIco'}>
                {ico}
            </div>

        </div>
    );
};

const icoStatus = (status: SortStatus, icoSort: IcoSort): React.ReactChild => {
    if (status === 'default') return icoSort.default!;
    if (status === 'down') return icoSort.down!;
    return icoSort.up!;
};
type IcoClaz = 'defaultIco' | 'downIco' | 'upIco';

type SortInfo = {
    index: number;
    ico: any;
};
const Ico = (className: IcoClaz) => {
    return (<div className={className} />);
};

const ICOSORT: IcoSort = {
    default: Ico('defaultIco'),
    down: Ico('downIco'),
    up: Ico('upIco')
};
////////////////////////////////////
interface ContainerProp extends BaseProps {
    id?: string;
    events?: any;
}
class Container extends React.PureComponent<ContainerProp> {
    render() {
        const { className, style, children, id, events } = this.props;
        return (
            <div
                {...(events !== undefined ? events : {})}
                id={id === undefined ? '' : id}
                className={className}
                style={style}
            >
                {children || ''}
            </div>
        );
    }
}
////////////////////////////////////
const DraggableContainer = SortableContainer((tableProp: ContainerProp) => {
    return (<Container {...tableProp} />);
});

interface TableContainerProp extends ContainerProp {
    draggable: boolean;
    onDragColumn?: (oldIndex: number, newIndex: number) => void;
}
class TableContainer extends React.PureComponent<TableContainerProp> {
    render() {
        const { draggable, children, id, events, className, style, onDragColumn } = this.props;
        if (draggable) {
            return (
                <DraggableContainer
                    pressDelay={300}
                    axis={'x'}
                    lockAxis={'x'}
                    helperClass={'indrag'}
                    useDragHandle={true}
                    lockToContainerEdges={true}
                    lockOffset={[0, '50%']}
                    onSortEnd={(sort: SortEnd, event: SortEvent) => {
                        if (onDragColumn) {
                            onDragColumn(sort.oldIndex, sort.newIndex);
                        }
                    }}
                    id={id}
                    events={events}
                    className={className}
                    style={style}
                >
                    {children}
                </DraggableContainer>
            );
        }
        return (
            <Container id={id} events={events} className={className} style={style}>
                {children}
            </Container>
        );
    }
}
////////////////////////////////////
interface HeaderColumnProp extends ContainerProp {
    content: any;
    ico?: any;
}

class HeaderContainer extends React.PureComponent<HeaderColumnProp> {
    render() {
        const { className, events, id, style, ico, content } = this.props;
        let icon: any = ico || '';
        let cellContent: any = (
            <div className={'cell-content'}>
                {content}
            </div>
        );

        let cellIco: any = (
            <div className={'cell-content-ico'}>
                {icon}
            </div>
        );
        return (
            <Container className={className} events={events} id={id} style={style}>
                {cellContent}
                {cellIco}
            </Container>
        );
    }
}
////////////////////////////////////
const DragHandle = SortableHandle((props: { children: any }) => {
    const { children } = props;
    return children;
});

const DraggableColumn = SortableElement((props: ContainerProp) => {
    return (<Container {...props} />);
});
interface ColumnContainerProp extends ContainerProp {
    draggable: boolean;
    index: number;
}
class ColumnContainer extends React.PureComponent<ColumnContainerProp> {
    render() {
        const { draggable, index, children, id, events, className, style } = this.props;
        if (draggable) {
            return (
                <DraggableColumn key={id + '-' + index} index={index} className={className} id={id} style={style} events={events}>
                    {children}
                </DraggableColumn>
            );
        }
        return (
            <Container id={id} events={events} className={className} style={style}>
                {children}
            </Container>
        );
    }
}
////////////////////////////////////
interface CellProp extends ContainerProp {
    content: any;
}
class CellComp extends React.PureComponent<CellProp> {
    render() {
        const { className, style, id, events, content } = this.props;
        return (
            <Container className={className} id={id} style={{ ...style, display: 'flex' }} events={events}>
                <div className={'cell-content'}>{content}</div>
            </Container>
        );
    }
}
////////////////////////////////////
interface MColumn {
    className: string;
    style: React.CSSProperties;
    name: string;
    dataName: string;
    sortable: boolean;
    draggable: boolean;
    resizable: boolean;
    cellRender: CellRender;
    headerRender: HeaderColumnRender;
    columnSeparator: Separator;
    ico: any;

}
////////////////////////////////////
type PropStyle = { className: string, style: React.CSSProperties };

const isSize = (size: any): boolean => {
    if (size === undefined) return false;
    let type: string = typeof (size);
    return type === 'string' || type === 'number';
};
const getSize = (size: Size) => {
    let type: string = typeof (size);
    if (type === 'string') return size as string;
    if (type === 'number') return (size as number) + 'px';
    return '1px';
};
////////////////////////////////////
const getRowSeparator = (rowSeparator: Separator, clazzName: string): PropStyle => {
    let style: React.CSSProperties = {};
    let clazz: string = '';
    if (rowSeparator !== undefined) {
        if (isSize(rowSeparator)) {
            clazz = clazzName;
            style = {
                borderBottomWidth: getSize(rowSeparator as Size) || '1px'
            };
        } else {
            let type: string = typeof (rowSeparator);
            if (type === 'boolean' && rowSeparator as boolean) clazz = clazzName;
            else if (type === 'object') {
                clazz = clazzName;
                style = {
                    borderBottomWidth: getSize((rowSeparator as PropSeparator).width) || '1px',
                    borderBottomColor: (rowSeparator as PropSeparator).color,
                    borderBottomStyle: (rowSeparator as PropSeparator).style
                };
            }
        }
    }

    return {
        className: clazz,
        style: style
    };
};
const getColumnSeparator = (separator: Separator, clazzName: string): PropStyle => {
    let style: React.CSSProperties = {};
    let clazz: string = '';
    if (separator !== undefined) {
        if (isSize(separator)) {
            clazz = clazzName;
            style = {
                borderRightWidth: getSize(separator as Size) || '1px'
            };
        } else {
            let type: string = typeof (separator);
            if (type === 'boolean' && separator as boolean) clazz = clazzName;
            else if (type === 'object') {

                clazz = clazzName;
                style = {
                    borderRightWidth: getSize((separator as PropSeparator).width) || '1px',
                    borderRightColor: (separator as PropSeparator).color,
                    borderRightStyle: (separator as PropSeparator).style
                };
            }
        }
    }
    return {
        className: clazz,
        style: style
    };
};

const getHeaderProp = (c: MColumn, prefix: string, events: any, headColumnHeight?: Size): HeaderColumnProp => {
    let style: React.CSSProperties = {};
    if (isSize(headColumnHeight)) style = { height: getSize(headColumnHeight as Size) };
    if (c.sortable) style = { ...style, cursor: 'pointer' };
    return {
        key: prefix + '-' + c.name + (Math.random() * 100000),
        content: c.headerRender(c.name, c.dataName),
        id: prefix + '-' + c.name + '-header',
        style: { ...style },
        className: 'header',
        events: events,
        ico: c.ico
    };
};
const getCellProps = (c: MColumn, key: string, extraStyle: PropStyle, dt: any, i: number): CellProp => {
    return {
        key: key + (Math.random() * 1000000),
        content: c.cellRender(c.dataName, dt, i),
        className: 'cell ' + extraStyle.className,
        events: {},
        style: extraStyle.style,
        id: key
    };
};
const getColumnContainerProp = (c: MColumn, key: string, index: number, isLast: boolean): ColumnContainerProp => {
    let propstyle: PropStyle = { className: '', style: { display: 'flex' } };
    if (c.columnSeparator && !isLast) propstyle = getColumnSeparator(c.columnSeparator, 'colSeparator');
    let clzColumn: string = ClazName(ClazName(c.className, 'colContainer'), propstyle.className);
    let clumnStyle: React.CSSProperties = StyleMerge(c.style, propstyle.style);
    clumnStyle = { ...clumnStyle, display: 'flex' };
    return {
        key: key + (Math.random() * 100000),
        className: clzColumn,
        style: clumnStyle,
        draggable: c.draggable,
        events: {},
        index: index,
        id: key
    };
};

const nextStatus = (status: SortStatus, multisort: boolean): SortStatus => {
    if (multisort) {
        if (status === 'default') return 'down';
        else if (status === 'down') return 'up';
        else if (status === 'up') return 'default';
    }
    if (status === 'down') return 'up';
    return 'down';
};
////////////////////////////////////
const NormalSort = (sortingList: Array<SortPosition>, listData: Array<any>, retriveValue?: RetriveValue) => {
    let position: SortPosition = sortingList[0];
    return listData.sort((a: any, b: any) => {
        if ((a === null || a === undefined) && (b === null || b === undefined)) return 0;
        else if ((a === null || a === undefined) && !(b === null || b === undefined)) return -1;
        else if (!(a === null || a === undefined) && (b === null || b === undefined)) return 1;
        let status: number = TranslateStatus(position.status);
        let name: string = position.name;
        let dataName: string = position.dataName;
        let v1: any = retriveValue !== undefined ? retriveValue(name, dataName, a) : a[dataName];
        let v2: any = retriveValue !== undefined ? retriveValue(name, dataName, b) : b[dataName];

        let descending: boolean = status === 1;
        if (v1 < v2) return descending ? -1 : 1;
        else if (v1 > v2) return descending ? 1 : -1;
        return 0;
    });
};
const MultiSort = (sortingList: Array<SortPosition>, listData: Array<any>, retriveValue?: RetriveValue) => {
    return listData.sort((a: any, b: any) => {
        if ((a === null || a === undefined) && (b === null || b === undefined)) return 0;
        else if ((a === null || a === undefined) && !(b === null || b === undefined)) return -1;
        else if (!(a === null || a === undefined) && (b === null || b === undefined)) return 1;

        for (let i: number = 0; i < sortingList.length; i++) {
            let status: number = TranslateStatus(sortingList[i].status);
            if (status === 0) continue;
            let name: string = sortingList[i].name;
            let dataName: string = sortingList[i].dataName;
            let v1: any = retriveValue !== undefined ? retriveValue(name, dataName, a) : a[dataName];
            let v2: any = retriveValue !== undefined ? retriveValue(name, dataName, b) : b[dataName];

            if (v1 === v2 || ((v1 === null || v1 === undefined) && (v2 === null || v2 === undefined))) continue;
            else if ((v1 === null || v1 === undefined) && !(v2 === null || v2 === undefined)) return -1;
            else if (!(v1 === null || v1 === undefined) && (v2 === null || v2 === undefined)) return 1;

            let descending: boolean = status === 1;

            if (v1 < v2) return descending ? -1 : 1;
            else if (v1 > v2) return descending ? 1 : -1;
        }

        return 0;
    });
};

export const SortUtil = (multiSort: boolean, sortingList: Array<SortPosition>, listData: Array<any>, retriveValue?: RetriveValue): Array<any> => {
    if (listData === undefined || listData.length === 0) return listData;
    if (sortingList === undefined || sortingList.length === 0) return listData;
    if (!multiSort) return NormalSort(sortingList, listData.slice(), retriveValue);
    return MultiSort(sortingList, listData.slice(), retriveValue);
};
////////////////////////////////////
interface TableState {
    position: Array<SortPosition>;
    session: string;
}

export class MTable extends React.Component<TableProp, TableState> {

    state = { position: [], session: '' };

    static getDerivedStateFromProps(props: TableProp, state: TableState): TableState {
        let position: Array<SortPosition> = state.position;
        let session: string = state.session;
        if (props.session !== session) {
            position = [];
            session = props.session;
        }
        return {
            position: position,
            session: session
        };
    }

    onHeadClick = (nameColumn: string, dataName: string, multiSort: boolean) => {
        let position: Array<SortPosition> = this.state.position.slice();
        let index: number = position.findIndex(p => p.name === nameColumn);

        if (index >= 0) {
            position[index].status = nextStatus(position[index].status, multiSort);
            if (multiSort && position[index].status === 'default') position.splice(index, 1);
        } else {
            let srtPos: SortPosition = {
                name: nameColumn,
                dataName: dataName,
                status: multiSort ? 'down' : 'up'
            };
            if (!multiSort) position = [];
            position.push(srtPos);
        }
        this.setState({ ...this.state, position: position }, () => {
            if (this.props.sort) {
                this.props.sort(multiSort, this.state.position.slice());
            }
        });
    }
    handleStyle = (n: number): React.CSSProperties => {
        // left: 'CALC(100% - ' + ( n + 2) + 'px)',
        return {
            position: 'relative',
            zIndex: 10,
            right: 'CALC(100% - ' +  n  + 'px)',
            top: '0px',
            width: n + 'px',
            backgroundColor: 'rgba(0,0,0,0.5)',
            cursor: 'w-resize'
        };
    }
    render() {
        const { name, columns, data, className, style, onDragColumn, minRows, maxRows, alternateRows, rowHeight, rowSeparator } = this.props;

        let prefix: string = name;

        let position: Array<SortPosition> = this.state.position;
        let draggableTable: boolean = this.props.draggable === undefined ? false : this.props.draggable!;
        let sortableTable: boolean = this.props.sort !== undefined;
        let multiSort: boolean = this.props.multiSort !== undefined ? this.props.multiSort! : false;
        let resizableTab: boolean = this.props.resizable !== undefined ? this.props.resizable! : false;
        let icoSortTable: IcoSort = this.props.icoSort || ICOSORT;
        let columnSeparatorTable: Separator = this.props.columnSeparator || false;
        let cellRenderTable: CellRender = this.props.cellRender !== undefined ? this.props.cellRender : (dataname: string, data: any, row: number): any | null => { return null; };
        let headerColumnTable: HeaderColumnRender = this.props.headerRender !== undefined ? this.props.headerRender : (name: string, dataname: string): any | null => { return null; };

        let realcolumnsProps: Array<MColumn> = (columns || []).map((col: Column, index: number): MColumn => {
            let isString: boolean = typeof (col) === 'string';
            let name: string = isString ? col as string : (col as ColumnProps).name;
            let dataName: string = isString ? name : (col as ColumnProps).dataName || name;
            let draggable: boolean = isString ? draggableTable : ((col as ColumnProps).draggable === undefined ? draggableTable : (col as ColumnProps).draggable!);

            let sortable: boolean = isString ? sortableTable : ((col as ColumnProps).sortable === undefined ? sortableTable : (col as ColumnProps).sortable!);
            let resizable: boolean = isString ? resizableTab : ((col as ColumnProps).resizable === undefined ? resizableTab : (col as ColumnProps).resizable!);

            let ico: any = '';
            if (sortable) {
                let icoSort: IcoSort = isString ? icoSortTable : (col as ColumnProps).icoSort || icoSortTable;
                let status: SortStatus = multiSort ? 'default' : 'down';
                let indexPos: number = position.findIndex(p => p.name === name);
                if (indexPos >= 0) status = position[indexPos].status;
                ico = icoStatus(status, icoSort);
                if (multiSort && status !== 'default') {
                    ico = IcoComp({ ico: ico, value: indexPos + 1 });
                } else {
                    ico = IcoComp({ ico: ico });
                }
            }

            let className: string = isString ? '' : (col as ColumnProps).className || '';
            let style: React.CSSProperties = isString ? {} : (col as ColumnProps).style || {};
            let columnSeparator: Separator = isString ? columnSeparatorTable : (col as ColumnProps).columnSeparator || columnSeparatorTable;
            let cellRenderColumn: CellRender = isString ? cellRenderTable : (col as ColumnProps).cellRender || cellRenderTable;
            let headerRenderColumn: HeaderColumnRender = isString ? headerColumnTable : (col as ColumnProps).headerRender || headerColumnTable;
            if (!isString && isSize((col as ColumnProps).width)) {
                style.width = getSize((col as ColumnProps).width as Size);
            }


            return {

                name: name,
                dataName: dataName,
                draggable: draggable,
                sortable: sortable,
                resizable: resizable,
                ico: ico,
                className: className,
                style: style,
                columnSeparator: columnSeparator,

                cellRender: (dataname: string, data: any, row: number) => {
                    let val: any = cellRenderColumn(dataname, data, row);
                    if (val === null) val = cellRenderTable(dataname, data, row);
                    if (val === null) val = data && data[dataname];
                    return val === null || val === undefined ? '' : val;
                },
                headerRender: (name: string, dataname: string) => {
                    let val: any = headerRenderColumn(name, dataname);
                    if (val === null) val = headerColumnTable(name, dataname);
                    if (val === null) val = name;
                    return val === null || val === undefined ? '' : val;
                }
            };
        });


        let n: number = 0;
        realcolumnsProps.forEach((col: MColumn) => { if (col.draggable) n++; });
        let isTableDraggable: boolean = n > 1;
        if (n === 1) {
            let col: MColumn | undefined = realcolumnsProps.find(c => c.draggable === true);
            if (col) col.draggable = false;
        }

        let clzTable: string = ClazName(ClazName('mtable', className), 'sealedTable');
        let tableStyle: React.CSSProperties = StyleMerge({}, style);

        let tableProp: TableContainerProp = {
            key: 'name' + (Math.random() * 100000),
            className: clzTable,
            draggable: isTableDraggable,
            events: {},
            id: name,
            style: tableStyle,
            onDragColumn: onDragColumn
        };

        let dataRows: Array<any> = data || [];
        let lenData: number = dataRows.length;
        if (minRows !== undefined && lenData < minRows) lenData = minRows;
        if (maxRows !== undefined && lenData > maxRows) lenData = maxRows;

        let len: number = realcolumnsProps.length;

        let rHeight: RowHeightRender = (data: any, row: number) => { return null; };
        if (rowHeight !== undefined) {
            rHeight = (data: any, row: number) => {
                if (isSize(rowHeight)) return getSize(rowHeight as Size);
                let res: Size | null = (rowHeight as RowHeightRender)(data, row);
                if (isSize(rowHeight)) return getSize(res as Size);
                return null;
            };
        }
        let alternateRowsFunc = (row: number): PropStyle => { return { style: {}, className: '' }; };

        if (alternateRows !== undefined) {
            let type: string = typeof (alternateRows);
            let isBool: boolean = type === 'boolean';
            alternateRowsFunc = (row: number): PropStyle => {
                let prop: PropStyle = { style: {}, className: 'cellColor' };
                if (isBool && (alternateRows as boolean)) {
                    if (row % 2) prop.className = 'alternateRows';
                } else if (!isBool) {
                    if (isArray(alternateRows)) {
                        let altRows: Array<string> = alternateRows as Array<string>;
                        let color: string = altRows[row % altRows.length];
                        prop.style.backgroundColor = color;
                    } else {
                        prop.style = alternateRows as React.CSSProperties;
                    }
                }
                return prop;
            };
        }

        let pRowSeparator: PropStyle = { style: {}, className: '' };
        if (rowSeparator !== undefined) {
            pRowSeparator = getRowSeparator(rowSeparator, 'rowSeparator');
        }

        let styles: Array<PropStyle> = [];
        for (let i: number = 0; i < lenData; i++) {
            let dt: any = dataRows[i];
            let st: React.CSSProperties = { ...pRowSeparator.style };
            let rH: any = rHeight(dt, i);
            if (rH !== null) st = { height: rH };
            let alternate: PropStyle = alternateRowsFunc(i);
            let clazz: string = pRowSeparator.className + ' ' + alternate.className;
            st = { ...st, ...alternate.style };
            styles.push({
                className: clazz,
                style: st
            });
        }


        let columnComp: Array<any> = realcolumnsProps.map((c: MColumn, index: number) => {

            let isLast: boolean = index === (len - 1);
            let colkey: string = prefix + '-' + c.name;
            let columnProp: ColumnContainerProp = getColumnContainerProp(c, colkey, index, isLast);
            let evHeader: any = c.sortable ? { onClick: (ev: any) => { this.onHeadClick(c.name, c.dataName, multiSort); } } : {};
            let headerProp: HeaderColumnProp = getHeaderProp(c, prefix, evHeader, this.props.headColumnHeight);

            let columnCells: Array<any> = [];

            for (let i: number = 0; i < lenData; i++) {
                let dt: any = dataRows[i];
                let key: string = prefix + '-' + c.name + '-' + i;
                let cellProps: CellProp = getCellProps(c, key, styles[i], dt, i);
                columnCells.push(<CellComp key={key} {...cellProps} />);
            }
            let handle: any = '';
            if (c.resizable) {
                handle = (
                    <div
                        key={colkey + '-handle' + (Math.random() * 100000)}
                        id={colkey + '-handle'}
                        style={this.handleStyle(2)}
                        onMouseDown={(ev: React.SyntheticEvent) => {
                            if (!ev.isDefaultPrevented()) ev.preventDefault();
                            if (!ev.isPropagationStopped()) ev.stopPropagation();
                            this.addListenerHandleDown(c);
                        }}
                    />
                );
            }

            return (
                <ColumnContainer key={columnProp.key} {...columnProp}>
 
                    <Container id={columnProp.id! + '-inner'} className="innerContainer">
                        {isTableDraggable && <div style={{ width: '100%', height: '2px', backgroundColor: c.draggable ? 'black' : 'white' }} />}
                        {c.draggable && <DragHandle children={<HeaderContainer {...headerProp} />} />}
                        {!c.draggable && <HeaderContainer {...headerProp} />}
                        {columnCells}
                    </Container>

                    {handle}

                </ColumnContainer>
            );
        });

        return (
            <TableContainer {...tableProp}>
                {columnComp}
            </TableContainer>
        );
    }

    //////////////////

    currentColumn: MColumn | null = null;
    separatorElement: HTMLElement | null;
    currentRect: ClientRect | DOMRect | null;
    dilayTab: number = 0;

    removeAllListener = () => {
        document.removeEventListener('mousemove', this.mousemove);
        document.removeEventListener('mouseup', this.mouseup);
        this.currentColumn = null;
        this.separatorElement = null;
        this.currentRect = null;
        this.dilayTab = 0;
    }

    mouseup = (ev: any) => {

        if (this.currentColumn !== null
            && this.separatorElement !== null
            && this.currentRect !== null
        ) {
            let newW: number = this.currentRect.width;
            let refTable: HTMLElement | null = document.getElementById(this.props.name);
            if (refTable !== null) {
                let nameColumn: string = this.currentColumn.name;
                refTable.removeChild(this.separatorElement);
                newW = ev.screenX - this.dilayTab - this.currentRect.left;
                if (this.props.onResizeColumn && nameColumn.length > 0) {
                    console.log(nameColumn, 'width', this.currentRect.width, 'newW', newW);
                    this.props.onResizeColumn(nameColumn, newW);
                }
            }
        }
        this.removeAllListener();
    }

    mousemove = (ev: MouseEvent) => {
        if (this.separatorElement !== null) {
            this.separatorElement.style.left = (ev.screenX - this.dilayTab) + 'px';
        }
    }
    createSeparator = () => {
        let refTable: HTMLElement | null = document.getElementById(this.props.name);
        if (refTable && this.currentRect) {
            this.separatorElement = document.createElement('div');
            let rectTable: ClientRect | DOMRect = refTable.getBoundingClientRect();
            this.dilayTab = rectTable.left;

            this.separatorElement.id = 'handle-resize';
            this.separatorElement.style.backgroundColor = 'rgba(0,0,0,0.4)';
            this.separatorElement.style.position = 'absolute';
            let xpos: number = this.currentRect.left + this.currentRect.width - this.dilayTab;
            this.separatorElement.style.left = xpos + 'px';
            console.log('xpos', xpos);
            this.separatorElement.style.top = '0px';
            this.separatorElement.style.width = '3px';
            this.separatorElement.style.height = rectTable.height + 'px';
            this.separatorElement.style.zIndex = '11';
            this.separatorElement.style.cursor = 'w-resize';
            refTable.appendChild(this.separatorElement);
        }
    }

    addListenerHandleDown = (c: MColumn) => {
        if (c) {
            this.currentColumn = c;
            let columnId: string = this.props.name + '-' + c.name;
            let tmp: HTMLElement | null = document.getElementById(columnId);
            if (tmp !== null) {
                this.currentRect = tmp.getBoundingClientRect();
                this.createSeparator();
                document.addEventListener('mousemove', this.mousemove);
                document.addEventListener('mouseup', this.mouseup);
            }
        }
    }

    /*    
    addListenerHandleDown = (c: MColumn, rect: ClientRect | DOMRect) => {
        if (rect !== null) {
            if (this.refTable === null) this.refTable = document.getElementById(this.props.name);
            if (this.refTable !== null) {
                this.currentColumn = c;
                let columnId: string = this.props.name + '-' + c.name;
                let tmp: HTMLElement | null = document.getElementById(columnId);
                if (tmp) {
                    let leftTable: number = this.refTable.getBoundingClientRect().left;
                    this.currentLeft = rect.left - leftTable;
                    this.currentRect = tmp.getBoundingClientRect();
                    this.currentElement = document.createElement('div');
                    this.currentElement.id = 'handle-resize';
                    this.currentElement.style.backgroundColor = 'rgba(0,0,0,0.4)';
                    this.currentElement.style.position = 'absolute';
                    this.currentElement.style.left = this.currentLeft + 'px';
                    this.currentElement.style.top = '0px';
                    this.currentElement.style.width = '3px';
                    this.currentElement.style.height = rect.height + 'px';
                    this.currentElement.style.zIndex = '111';
                    this.currentElement.style.cursor = 'w-resize';
                    this.refTable.appendChild(this.currentElement);
                    document.addEventListener('mousemove', this.mousemove);
                    document.addEventListener('mouseup', this.mouseup);
                }
            }
        }
    }*/
}