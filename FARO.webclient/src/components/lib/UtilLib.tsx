import * as React from 'react';
import { Column } from './mtable/TableDefinition';


export const KEYWORD: string = '#key:';
export const EXPR: string = '#expr:';

export const getColsRows = (rowsHead: Array<string>) => {
    return rowsHead.map((val: string, index: number): Column => {
        let name: string = val;
        let indxofKey: number = name.indexOf(KEYWORD);
        if (indxofKey >= 0) name = name.substring(indxofKey + KEYWORD.length);
        name = name.split('=')[0];
        name = val.substring(0, indxofKey) + name.trim();
        return {
            name: name,
            dataName: val
        };
    });

    /*
    return rowsHead.map((val: string, index: number) => {
        let idColumn: string = val;
        let indxofKey: number = val.indexOf(KEYWORD);
        if (indxofKey >= 0) {
            idColumn = val.substring(indxofKey + KEYWORD.length);
        }
        idColumn = idColumn.split('=')[0];
        idColumn = idColumn.trim();
        return {
            dataName: val,
            idColumn: idColumn,
            contexts: ['table'],
            cellRender: (indexRow: number, column: ColumnRenderProps, dataRow: any) => {
                let val: any = dataRow[column.dataName!];
                if (val === null) {
                    return (<div style={{ color: '#bcbcbc' }}>null</div>);
                }
                return null;
            },
            renderValueCell: (indexRow: number, column: ColumnRenderProps, dataRow: any) => {
                let val: any = dataRow[column.dataName!];
                if (val !== undefined) {
                    return '' + val;
                }
                return '';
            }
        } as Column;
    }) as Array<Column>;*/
};
export const infoPopup = (key: string, value: any, col1: string, col2: string) => {
    if (key && value) {
        return (
            <div key={key} style={{ width: '100%' }}>
                <span style={{ color: col1 }}>{key}</span>
                <span style={{ color: 'black', fontWeight: 'bold' }}>{` = `}</span>
                <span style={{ color: col2 }}>{`${value};`}</span>
            </div>
        );
    } else if (key && value === undefined) {
        return (
            <div key={key} style={{ width: '100%' }}>
                <span style={{ color: col1 }}>{key}</span>
            </div>
        );
    }
    return (
        <div key={key} style={{ width: '100%' }}>
            <span style={{ color: col2 }}>{`${value};`}</span>
        </div>
    );
};

export const createHideProp = (val: any, exclude: Array<string>, colors?: Array<string>) => {
    let messages: Array<any> = [];
    if (val !== undefined) {
        let col1: string = 'black';
        let col2: string = 'grey';
        if (colors !== undefined && colors.length > 0) {
            col1 = colors[0];
            if (colors.length > 1) col2 = colors[1];
        }
        for (const key in val) {
            if (val.hasOwnProperty(key)) {
                if (exclude.find(e => e === key) === undefined) {
                    const element = val[key];
                    if (element && element.length > 0) messages.push(infoPopup(key, element, col1, col2));
                }
            }
        }
    }
    return messages;
};

export const alternateStyle2 = (): Array<React.CSSProperties> => {
    return [
        { background: 'linear-gradient(to bottom, rgba(242, 247, 203,1) 0%, rgba(255, 255, 255,1) 35%, rgba(255, 255, 255,1) 65%, rgba(242, 247, 203,1) 100%)' },
        { background: 'linear-gradient(to bottom, rgba(197, 211, 232,1) 0%, rgba(255, 255, 255,1) 35%, rgba(255, 255, 255,1) 65%, rgba(197, 211, 232, 1) 100%)' }
    ];
};
export const alternateStyle = (): Array<React.CSSProperties> => {
    return [{ backgroundColor: 'rgba(0, 44, 110, 0.5)' }, { backgroundColor: 'rgba(0, 133, 31, 0.5)' }];
};