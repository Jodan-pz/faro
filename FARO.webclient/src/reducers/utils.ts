type UniqueParms = { uniqueId: string } & Partial<any>;
type ParametricPayload<T> = { items?: T[], parms: UniqueParms };

export type UniqueState<T> = { [id: string]: T; };
export type UniqueStateParametric<T> = { [id: string]: ParametricPayload<T>; };

function isUniqueParms(arg: any): arg is UniqueParms {
    return (<UniqueParms>arg).uniqueId !== undefined;
}
function isParametricPayload<T>(arg: any): arg is ParametricPayload<T> {
    return (<any>arg).items !== undefined || (<any>arg).parms !== undefined;
}

export function manageUniqueState<T, K extends keyof T>(state?: UniqueState<T>, unique?: string | number | UniqueParms): UniqueState<T>;
export function manageUniqueState<T, K extends keyof T>(state?: UniqueState<T>, unique?: string | number | UniqueParms, payload?: T | T[K]): UniqueState<T>;
export function manageUniqueState<T, K extends keyof T>(state?: UniqueState<T>, unique?: string | number | UniqueParms, payload?: T | T[K], key?: K): UniqueState<T>;
export function manageUniqueState<T, K extends keyof T>(state?: UniqueStateParametric<T>, unique?: string | number | UniqueParms): UniqueStateParametric<T>;
export function manageUniqueState<T, K extends keyof T>(state?: UniqueStateParametric<T>, unique?: string | number | UniqueParms, payload?: T[]): UniqueStateParametric<T>;
export function manageUniqueState<T, K extends keyof T>(state?: UniqueState<T> | UniqueStateParametric<T>, unique?: string | number | UniqueParms, payload?: T | T[] | T[K] | null, key?: K): UniqueState<T> | UniqueStateParametric<T> | undefined {
    const parms = unique ? (isUniqueParms(unique) ? unique : { uniqueId: unique.toString() } as UniqueParms) : undefined;

    if (parms) {
        let unqSt = state ? { ...state } : {};
        let unqId = parms && parms.uniqueId;
        let unqPayload = unqSt[unqId] || (isUniqueParms(unique) ? { parms: {} } : {});

        if (isParametricPayload<T>(unqPayload)) {
            if (parms.pageSize === undefined || parms.pageIndex === undefined || parms.pageIndex === 1) {
                if (payload) unqPayload = { items: <T[]>payload, parms };
                else delete unqPayload.items;
            } else {
                let stateData = (unqPayload.items) || [];
                unqPayload = { items: [...stateData.concat(<T[]>payload || [])], parms };
            }
        } else {
            if (key) {
                if (payload) unqPayload = { ...<any>unqPayload, [key]: <T[K]>payload };
                else delete unqPayload[key.toString()];
            } else {
                unqPayload = <T>payload;
            }
        }

        unqSt = { ...unqSt, [unqId]: <any>unqPayload };

        if (!unqPayload || Object.keys(unqPayload).length === 0) {
            unqSt = (({ [unqId]: del, ...unqSt }) => unqSt)(unqSt);
        }

        return Object.keys(unqSt).length === 0 ? undefined : unqSt;
    }

    return state;
}
export function selectorUnique<T, K extends keyof T>(state: UniqueState<T> | undefined, unique: string | number): T | undefined;
export function selectorUnique<T, K extends keyof T>(state: UniqueState<T> | undefined, unique: string | number, key: K): T[K] | undefined;
export function selectorUnique<T, K extends keyof T>(state: UniqueState<T> | undefined, unique: string | number, key?: K): T | T[K] | undefined {
    if (state !== undefined && unique !== undefined) {
        const unqPayload = state[unique.toString()];
        if (unqPayload !== undefined) {
            if (key) return (<any>unqPayload)[key];
            return unqPayload;
        }
    }
    return undefined;
}
export const selectorItems = <T>(state: UniqueStateParametric<T> | undefined, unique: string | number): T[] | undefined => selectorUnique(state, unique, 'items');
export const selectorParms = <T>(state: UniqueStateParametric<T> | undefined, unique: string | number): any => selectorUnique(state, unique, 'parms');
export function isEmptyPayload<T>(value: T | undefined, unique?: string | number): boolean {
    const test = value && (unique ? value[unique] : value);
    return (!test || Object.keys(test).length === 0);
}

export function UID(): string {
    if ((typeof (window.crypto) !== 'undefined' && typeof (window.crypto.getRandomValues) !== 'undefined')) {
        // If we have a cryptographically secure PRNG, use that
        // https://stackoverflow.com/questions/6906916/collisions-when-generating-uuids-in-javascript
        let buf: Uint16Array = new Uint16Array(8);
        window.crypto.getRandomValues(buf);
        const S4 = (num: number) => {
            let ret: string = num.toString(16);
            while (ret.length < 4) ret = '0' + ret;
            return ret;
        };
        return (S4(buf[0]) + S4(buf[1]) + '-' + S4(buf[2]) + '-' + S4(buf[3]) + '-' + S4(buf[4]) + '-' + S4(buf[5]) + S4(buf[6]) + S4(buf[7]));
    }
    // Otherwise, just use Math.random
    // https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#2117523
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c: any) {
        var r = Math.random() * 16 | 0;
        var v = c === 'x' ? r : (r & 0x3 | 0x8);  
        return v.toString(16);
    });
}