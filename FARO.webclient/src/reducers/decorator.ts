import { decoratorSearch, decoratorSearchClear, decoratorGet, decoratorClear, decoratorUpdate, decoratorUsage, cleanDecoratorUsage } from '../actions';
import { DecoratorModel, DecoratorUsageCollectionModel } from '../actions/model';
import { UniqueState, manageUniqueState, selectorUnique, selectorParms, isEmptyPayload, UniqueStateParametric, selectorItems } from './utils';

export interface DecoratorState {
    list?: UniqueStateParametric<DecoratorModel>;
    items?: UniqueState<DecoratorModel>;
    decoratorUsage?: DecoratorUsageCollectionModel | undefined;
}

const defaultState: DecoratorState = {};

// Root Reducer
export default (state: DecoratorState = defaultState, action: any): DecoratorState => {
    if (decoratorSearch.matchOnSuccess(action)) {
        return { ...state, list: manageUniqueState(state.list, action.promiseActionParams, action.payload) };
    } else if (decoratorSearchClear.matchAction(action)) {
        return { ...state, list: manageUniqueState(state.list, action.payload) };
    }

    if (decoratorGet.matchOnSuccess(action)) {
        return { ...state, items: manageUniqueState(state.items, action.promiseActionParams, action.payload) };
    } else if (decoratorUpdate.matchOnSuccess(action)) {
        return { ...state, items: manageUniqueState(state.items, action.promiseActionParams!.id, action.payload) };
    } else if (decoratorClear.matchAction(action)) {
        return { ...state, items: manageUniqueState(state.items, action.payload) };
    } else if (decoratorUsage.matchOnSuccess(action)) {
        return { ...state, decoratorUsage: action.payload };
    } else if (cleanDecoratorUsage.matchAction(action)) {
        return { ...state, decoratorUsage: undefined };
    }

    return state;
};

// Selectors
export const getSearch = (s: DecoratorState, uniqueId: string) => selectorItems(s.list, uniqueId);
export const getSearchParams = (s: DecoratorState, uniqueId: string) => selectorParms(s.list, uniqueId);
export const isSearchEmpty = (s: DecoratorState, uniqueId: string) => isEmptyPayload(s.list, uniqueId);
export const getItem = (s: DecoratorState, uniqueId: string) => selectorUnique(s.items, uniqueId);
export const getDecoratorUsage = (s: DecoratorState) => s.decoratorUsage;