import { KeysIteratorModel, KeysIteratorUsageCollectionModel } from '../actions/model';
import { UniqueStateParametric, manageUniqueState, isEmptyPayload, selectorItems, selectorParms, UniqueState, selectorUnique } from './utils';
import { keysIteratorSearch, keysIteratorSearchClear, keysIteratorGet, keysIteratorClear, keysIteratorUpdate, keysIteratorUsage, cleankeysIteratorUsage } from '../actions';

export interface KeysIteratorState {
    list?: UniqueStateParametric<KeysIteratorModel>;
    items?: UniqueState<KeysIteratorModel>;
    keysUsage?: KeysIteratorUsageCollectionModel | undefined;
}

const defaultState: KeysIteratorState = {};

export default (state: KeysIteratorState = defaultState, action: any): KeysIteratorState => {

    if (keysIteratorSearch.matchOnSuccess(action)) {
        return { ...state, list: manageUniqueState(state.list, action.promiseActionParams, action.payload) };
    } else if (keysIteratorSearchClear.matchAction(action)) {
        return { ...state, list: manageUniqueState(state.list, action.payload) };
    } else if (keysIteratorGet.matchOnSuccess(action)) {
        return { ...state, items: manageUniqueState(state.items, action.promiseActionParams, action.payload) };
    } else if (keysIteratorClear.matchAction(action)) {
        return { ...state, items: manageUniqueState(state.items, action.payload) };
    } else if (keysIteratorUpdate.matchOnSuccess(action)) {
        return { ...state, items: manageUniqueState(state.items, action.promiseActionParams!.id, action.payload) };
    } else if (keysIteratorUsage.matchOnSuccess(action)) {
        return { ...state, keysUsage: action.payload };
    } else if (cleankeysIteratorUsage.matchAction(action)) {
        return { ...state, keysUsage: undefined };
    }

    return state;
};

export const getSearch = (s: KeysIteratorState, uniqueId: string) => selectorItems(s.list, uniqueId);
export const isSearchEmpty = (s: KeysIteratorState, uniqueId: string) => isEmptyPayload(s.list, uniqueId);
export const getSearchParams = (s: KeysIteratorState, uniqueId: string) => selectorParms(s.list, uniqueId);
export const getItem = (s: KeysIteratorState, uniqueId: string) => selectorUnique(s.items, uniqueId);
export const getKeysUsage = (s: KeysIteratorState) => s.keysUsage;