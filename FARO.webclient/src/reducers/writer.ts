import { UniqueStateParametric, UniqueState, manageUniqueState, selectorItems, isEmptyPayload, selectorParms, selectorUnique } from './utils';
import { WriterModel, WriterUsageCollectionModel } from '../actions/model';
import { writerSearch, writerSearchClear, writerGet, writerClear, writerUpdate, writerUsage, cleanWriterUsage } from '../actions';


export interface WriterState {
    list?: UniqueStateParametric<WriterModel>;
    items?: UniqueState<WriterModel>;
    writerUsage?: WriterUsageCollectionModel | undefined;
}

const defaultState: WriterState = {};

// writerGet
export default (state: WriterState = defaultState, action: any): WriterState => {
    if (writerSearch.matchOnSuccess(action)) {
        return { ...state, list: manageUniqueState(state.list, action.promiseActionParams, action.payload) };
    } else if (writerSearchClear.matchAction(action)) {
        return { ...state, list: manageUniqueState(state.list, action.payload) };
    } else if (writerGet.matchOnSuccess(action)) {
        return { ...state, items: manageUniqueState(state.items, action.promiseActionParams, action.payload) };
    } else if (writerClear.matchAction(action)) {
        return { ...state, items: manageUniqueState(state.items, action.payload) };
    } else if (writerUpdate.matchOnSuccess(action)) {
        return { ...state, items: manageUniqueState(state.items, action.promiseActionParams!.id, action.payload) };
    } else if (writerUsage.matchOnSuccess(action)) {
        return { ...state, writerUsage: action.payload };
    } else if (cleanWriterUsage.matchAction(action)) {
        return { ...state, writerUsage: undefined };
    }
    return state;
};

export const getSearch = (s: WriterState, uniqueId: string) => selectorItems(s.list, uniqueId);
export const isSearchEmpty = (s: WriterState, uniqueId: string) => isEmptyPayload(s.list, uniqueId);
export const getSearchParams = (s: WriterState, uniqueId: string) => selectorParms(s.list, uniqueId);
export const getItem = (s: WriterState, uniqueId: string) => selectorUnique(s.items, uniqueId);
export const getWriterUsage = (s: WriterState) => s.writerUsage;