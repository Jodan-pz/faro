
import { ArgumentListDecorator, ArgumentListImage, ArgumentListKeysIterator, ArgumentListWriter, ArgumentListFlow, ArgumentFilter, UNIQUE_DECORATOR, UNIQUE_IMAGE, UNIQUE_KEYSITERATOR, UNIQUE_WRITER, UNIQUE_FLOW, DecoratorModel, ArgumentListValidator, UNIQUE_VALIDATOR, ArgumentListAggregator, UNIQUE_AGGREGATOR, OutputFieldModel } from 'src/actions/model';
import { StyleItem } from 'mildev-react-table';
import { SemanticICONS } from 'semantic-ui-react';
import { isNull } from 'util';



export const TYPECONST: string = 'const';
export const TYPEDEC: string = 'dec';
export const TYPEKEY: string = 'key';
export const TYPEEXPR: string = 'expr';

export const EXPRTAG: string = '#expr:';
export const KEYTAG: string = '#key:';
export const DECTAG: string = '#decorator:';

export const ICOEXPR: SemanticICONS = 'birthday cake';
export const ICOKEY: SemanticICONS = 'key';
export const ICODEC: SemanticICONS = 'gg';
export const ICOCONST: SemanticICONS = 'circle outline';

export const getType = (value: any) => {
    if (isNull(value)) return TYPECONST;
    let typeofRes: string = typeof (value);
    if (typeofRes === 'string') {
        if ((value as string).startsWith(KEYTAG)) return TYPEKEY;
        else if ((value as string).startsWith(DECTAG)) return TYPEDEC;
        else if ((value as string).startsWith(EXPRTAG)) return TYPEEXPR;
        return TYPECONST;
    } else if (typeofRes === 'object') {
        return TYPEDEC;
    } else if (typeofRes === 'number') {
        return TYPECONST;
    }
    return TYPECONST;
};

export const getNameIconFromType = (type: any) => {
    if (type === TYPEKEY) return ICOKEY;
    else if (type === TYPEDEC) return ICODEC;
    else if (type === TYPEEXPR) return ICOEXPR;
    return ICOCONST;
};
export const getNameIcon = (value: any) => {
    let type: string = getType(value);
    return getNameIconFromType(type);
};


export const getSplitDecorator = (decorator: string) => {
    let nameDec: string = decorator || '';
    let fieldOut: string = '';
    if (nameDec.indexOf('.') >= 0) {
        let split: string[] = nameDec.split('.');
        nameDec = split[0].trim();
        fieldOut = split[1].trim();
    }
    return {
        id: nameDec,
        field: fieldOut
    };
};

export const getFields = (nameDec: string, searchDecorators?: Array<DecoratorModel>) => {
    let dec: DecoratorModel | undefined = searchDecorators ? (searchDecorators as Array<DecoratorModel>).find(el => el.id === nameDec) : undefined;
    if (dec) {
        return (dec.fields || []).map((el: OutputFieldModel, index: number) => {
            return el.name!; // .split('=')[0];
        });
    }
    return [];
};

export const getArgsObjects = (nameDec: string, searchDecorators?: Array<DecoratorModel>) => {
    let dec: DecoratorModel | undefined = searchDecorators ? (searchDecorators as Array<DecoratorModel>).find(el => el.id === nameDec) : undefined;
    if (dec) {
        return dec.args || [];
    }
    return [];
};



export const STYLECELL: StyleItem = { style: { textAlign: 'center', color: '#545454' } };
export const STYLEHEAD: StyleItem = {
    style: {
        textAlign: 'center',
        borderBottomColor: '#d1d1d1',
        borderBottomStyle: 'solid',
        borderBottomWidth: '1px',
        backgroundImage: 'linear-gradient( rgb(240, 240, 240), rgb(211, 211, 211) )'
    }
};

export const cloneObject = (obj: any, name: string, value: any) => {
    let clone: any = { ...obj };
    delete clone[name];
    if (value !== undefined) {
        let type: string = typeof (value);
        if (type === 'string' && (value as string).length > 0) clone[name] = value;
        else if (type !== 'string') clone[name] = value;
    }
    return clone;
};

export const deepCopy = (obj: any) => {
    if (undefined === obj || null === obj || 'object' !== typeof obj) return obj;
    let copy: any;
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = deepCopy(obj[i]);
        }
        return copy;
    }
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = deepCopy(obj[attr]);
        }
        return copy;
    }
    return copy;
};

export const listValues = (listIndex: Array<number>, values: Array<any>) => {
    let listVal: Array<any> = [];
    if (values && values.length > 0) {
        for (let i: number = 0; i < listIndex.length; i++) {
            if (listIndex[i] < values.length) {
                listVal.push(values[listIndex[i]]);
            }
        }
    }
    return listVal;
};
export const numArray = (num: number) => {
    let ret: number[] = [];
    for (let i = 0; i < num; i++) {
        ret.push(i);
    }
    return ret;
};

export const isEmptyOrUndef = (value: any | undefined | null) => value === null || value === undefined || (value.trim && value.trim() === '') || value === '';
export const isNullOrEmpty = <T>(data?: T[]): boolean => (data && data.length !== 0) ? false : true;

export const eventPrevent = (callB?: ((evt: any) => void) | undefined) => (event: React.SyntheticEvent<any> | Event) => {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    if (callB) callB(event);
};

export const searchBase: ArgumentFilter = {
    filter: undefined,
    filterMatchMode: undefined,
    tags: null,
    tagsMatchMode: undefined,
    pageIndex: undefined,
    pageSize: undefined
};

export const searchArgumetListDecorator = () => {
    let argument: ArgumentListDecorator = { ...searchBase, uniqueId: UNIQUE_DECORATOR };
    return argument;
};
export const searchArgumetListImage = () => {
    let argument: ArgumentListImage = { ...searchBase, uniqueId: UNIQUE_IMAGE };
    return argument;
};
export const searchArgumetListValidator = () => {
    let argument: ArgumentListValidator = { ...searchBase, uniqueId: UNIQUE_VALIDATOR };
    return argument;
};
export const searchArgumetListAggregator = () => {
    let argument: ArgumentListAggregator = { ...searchBase, uniqueId: UNIQUE_AGGREGATOR };
    return argument;
};
export const searchArgumetListKeysIterator = () => {
    let argument: ArgumentListKeysIterator = { ...searchBase, uniqueId: UNIQUE_KEYSITERATOR };
    return argument;
};

export const searchArgumetListWriter = () => {
    let argument: ArgumentListWriter = { ...searchBase, uniqueId: UNIQUE_WRITER };
    return argument;
};
export const searchArgumetListFlow = () => {
    let argument: ArgumentListFlow = { ...searchBase, uniqueId: UNIQUE_FLOW };
    return argument;
};

export const tagsToString = (tags: Array<string> | undefined, max: number = 5) => {
    let tagslist: Array<string> = [...(tags || [])];
    let isMax: boolean = tagslist.length > max;
    let spanTit: string = isMax ? tagslist.join(', ') : '';
    if (isMax) tagslist = tagslist.slice(0, 5);
    let spanVal: string = tagslist.join(', ') + (isMax ? ' ...' : '');
    return {
        title: spanTit,
        value: spanVal
    };
};


export class CopyDoc {
    private static listenerAdded: boolean = false;
    private static callback: (json: any) => void;

    private static listenerEnterOver = (event: any) => {
        event.stopPropagation();
        event.preventDefault();
    }
    private static listenerPaste = (event: any) => {
        event.stopPropagation();
        event.preventDefault();
        if (event.clipboardData && event.clipboardData.getData) {
            try {
                let txt: string = event.clipboardData.getData('text');
                let json: any = JSON.parse(txt);
                if (CopyDoc.callback) {
                    CopyDoc.callback(json);
                }
            } catch (error) {
                /* */
            }
        }
    }
    private static listenerDrop = (event: any) => {
        event.stopPropagation();
        event.preventDefault();
        let dt = event.dataTransfer;
        if (dt && dt.files) {
            let files: Array<any> = dt.files;
            if (files && files.length > 0) {
                let file: any = files[0];
                let reader: FileReader = new FileReader();
                reader.onload = () => {
                    try {
                        let json: any = JSON.parse(reader.result as string);
                        if (CopyDoc.callback) {
                            CopyDoc.callback(json);
                        }
                    } catch (error) {
                        /* */
                    }
                };
                reader.readAsText(file);
            }
        }
    }
    static addListener(callbackResult: (json: any) => void): void {
        if (!CopyDoc.listenerAdded) {
            CopyDoc.listenerAdded = true;
            CopyDoc.callback = callbackResult;
            document.addEventListener('dragenter', this.listenerEnterOver);
            document.addEventListener('dragover', this.listenerEnterOver);
            document.addEventListener('drop', this.listenerDrop);
            document.addEventListener('paste', this.listenerPaste);
        }
    }
    static removeListener(): void {
        if (CopyDoc.listenerAdded) {
            CopyDoc.listenerAdded = false;
            document.addEventListener('dragenter', this.listenerEnterOver);
            document.addEventListener('dragover', this.listenerEnterOver);
            document.addEventListener('drop', this.listenerDrop);
            document.addEventListener('paste', this.listenerPaste);
        }
    }
}
export type Sorting = -1 | 0 | 1;
export type SortedHash = {
    [key: string]: Sorting;
};
export type RetriveSortValue = (dataName: string, dt: any) => void;
export type SortValue = {
    dataName: string;
    status: number;
    getValue?: RetriveSortValue
};
export interface SortedState {
    sorted: SortedHash;
}
export const andMultiSorting = (listSortableStatus: Array<SortValue>, listData: Array<any>): Array<any> => {
    // questo è un multi sort in and
    let newList: Array<any> = listData.sort((a: any, b: any) => {
        if (a === null && b === null) return 0;
        else if (a === null && b !== null) return -1;
        else if (a !== null && b === null) return 1;


        let sum: number = 0;

        for (let i: number = 0; i < listSortableStatus.length; i++) {
            let dataName: string = listSortableStatus[i].dataName;
            let getValue: RetriveSortValue | undefined = listSortableStatus[i].getValue;
            let status: number = listSortableStatus[i].status;

            if (status !== 0) {
                let descending: boolean = status === 1;
                let v1: any = getValue ? getValue(dataName, a) : a[dataName];
                let v2: any = getValue ? getValue(dataName, b) : b[dataName];

                if (v1 === null && v2 !== null) sum += -1;
                else if (v1 !== null && v2 === null) sum += 1;

                if (v1 !== null && v2 !== null) {
                    if (v1 < v2) sum += descending ? -1 : 1;
                    if (v1 > v2) sum += descending ? 1 : -1;
                }
            }
        }

        return sum;

    });

    return newList;
};



export const multiSorting = (listSortableStatus: Array<SortValue>, listData: Array<any>): Array<any> => {

    let newList: Array<any> = listData.sort((a: any, b: any) => {
        if ((a === null || a === undefined) && (b === null || b === undefined)) return 0;
        else if ((a === null || a === undefined) && !(b === null || b === undefined)) return -1;
        else if (!(a === null || a === undefined) && (b === null || b === undefined)) return 1;

        for (let i: number = 0; i < listSortableStatus.length; i++) {

            let status: number = listSortableStatus[i].status;
           
            if (status === 0) continue;

            let dataName: string = listSortableStatus[i].dataName;
            let getValue: RetriveSortValue | undefined = listSortableStatus[i].getValue;

            let v1: any = getValue ? getValue(dataName, a) : a[dataName];
            let v2: any = getValue ? getValue(dataName, b) : b[dataName];

            if (v1 === v2 || ((v1 === null || v1 === undefined) && (v2 === null || v2 === undefined))) continue;
            else if ((v1 === null || v1 === undefined) && !(v2 === null || v2 === undefined)) return -1;
            else if (!(v1 === null || v1 === undefined) && (v2 === null || v2 === undefined)) return 1;
 
            let descending: boolean = status === 1;
 
            if (v1 < v2) return descending ? -1 : 1;
            else if (v1 > v2) return descending ? 1 : -1;
 
        }
        
        return 0;

    });

    return newList;


};