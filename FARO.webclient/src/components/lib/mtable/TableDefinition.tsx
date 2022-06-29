import * as React from 'react';
import { BorderBottomStyleProperty } from 'csstype';

export type RetriveValue = (name: string, dataName: string, data: any) => any;

export interface BaseProps {
    [key: string]: any;  
    className?: string;
    style?: React.CSSProperties;
}
export type IcoSort = {
    default?: React.ReactChild;
    down?: React.ReactChild;
    up?: React.ReactChild;
};

export type Size = string | number;
export type PropSeparator = {
    width: Size;
    color: string;
    style: BorderBottomStyleProperty;
};
export type Separator = boolean | Size | PropSeparator;

export type HeaderColumnRender = (name: string, dataname: string) => any | null;
export type CellRender = (dataname: string, data: any, row: number) => any | null;
interface CommonProps extends BaseProps {
    draggable?: boolean;
    resizable?: boolean;
    cellRender?: CellRender;
    headerRender?: HeaderColumnRender;
    columnSeparator?: Separator;
    icoSort?: IcoSort;
}
export interface ColumnProps extends CommonProps {
    name: string;
    dataName?: string;
    sortable?: boolean;
    width?: Size;
}
export type SortStatus = 'default' | 'down' | 'up';
export type SortPosition = {
    name: string;
    dataName: string;
    status: SortStatus;
};
export type Column = string | ColumnProps;
export type Sort = (multiSort: boolean, sortingList: Array<SortPosition>) => void;
export type RowHeightRender = (data: any, row: number) => Size | null;
export type RowHeight = Size | RowHeightRender;

/*
    Da implementare
type KeyDefinition = {
    keyName:KeyName;
    keyCode:string;
};
type CharCode = string;
type CellSelect = (dataname: string, data: any, row: number)=> void;

type KeyName = 'left' | 'right' | 'up' | 'down' | 'enter';


type KeyProp = boolean | CharCode;

type KeyControlProp = {
    left?: KeyProp;
    right?: KeyProp;
    up?: KeyProp;
    down?: KeyProp;
    keySelect?: KeyProp;
    Separator?:Separator;
    onCellSelect?:CellSelect;
}
type KeyControl = boolean | Separator | KeySelect | KeyControlProp;
*/

export interface TableProp extends CommonProps {
    session: string;
    name: string;
    data?: Array<any>;
    columns?: Array<Column>;
    maxRows?: number;
    minRows?: number;
    rowHeight?: RowHeight;
    headColumnHeight?: Size;
    alternateRows?: boolean | Array<string> | Array<React.CSSProperties>;
    rowSeparator?: Separator;
    multiSort?: boolean;
    sort?: Sort;
    onDragColumn?: (oldIndex: number, newIndex: number) => void;
    onResizeColumn?: (nameColumn: string, newWidth: number) => void;
}
///////////////////////////////////////////////////////////
