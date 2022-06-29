import { UniqueStateParametric, UniqueState, manageUniqueState, selectorItems, selectorParms, isEmptyPayload, selectorUnique } from './utils';
import { AggregatorModel } from 'src/actions/model';
import { aggregatorSearch, aggregatorSearchClear, aggregatorGet, aggregatorUpdate, aggregatorClear, aggregatorUpdateRedux } from 'src/actions';

export interface AggregatorState {
    list?: UniqueStateParametric<AggregatorModel>;
    items?: UniqueState<AggregatorModel>;
}

const defaultState: AggregatorState = {};
 
 
export default (state: AggregatorState = defaultState, action: any): AggregatorState => {
    if (aggregatorSearch.matchOnSuccess(action)) {
        return { ...state, list: manageUniqueState(state.list, action.promiseActionParams, action.payload) };
    } else if (aggregatorSearchClear.matchAction(action)) {
        return { ...state, list: manageUniqueState(state.list, action.payload) };
    } else if (aggregatorUpdateRedux.matchAction(action)) {
        let res: { param: string, result: AggregatorModel } = action.payload;
        let items = manageUniqueState(state.items, res.param, res.result);
        return { ...state, items: items };
    } else if (aggregatorGet.matchOnSuccess(action)) {
        let items = manageUniqueState(state.items, action.promiseActionParams, action.payload);
        return { ...state, items: items };
    } else if (aggregatorClear.matchAction(action)) {
        return { ...state, items: manageUniqueState(state.items, action.payload) };
    } else if (aggregatorUpdate.matchOnSuccess(action)) {
        return { ...state, items: manageUniqueState(state.items, action.promiseActionParams!.id, action.payload) };
    }
    return state;
};

// Selectors
export const getSearch = (s: AggregatorState, uniqueId: string) => selectorItems(s.list, uniqueId);
export const getSearchParams = (s: AggregatorState, uniqueId: string) => selectorParms(s.list, uniqueId);
export const isSearchEmpty = (s: AggregatorState, uniqueId: string) => isEmptyPayload(s.list, uniqueId);
export const getItem = (s: AggregatorState, uniqueId: string) => uniqueId ? selectorUnique(s.items, uniqueId) : {};