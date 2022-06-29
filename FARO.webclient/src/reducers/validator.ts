import { UniqueStateParametric, UniqueState, manageUniqueState, selectorItems, selectorParms, isEmptyPayload, selectorUnique } from './utils';
import { ValidatorModel } from 'src/actions/model';
import { validatorSearch, validatorGet, validatorUpdate, validatorDelete, validatorSearchClear, validatorClear, validatorUpdateRedux } from 'src/actions';

export interface ValidatorState {
    list?: UniqueStateParametric<ValidatorModel>;
    items?: UniqueState<ValidatorModel>;
}

const defaultState: ValidatorState = {};

export default (state: ValidatorState = defaultState, action: any): ValidatorState => {
    if (validatorSearch.matchOnSuccess(action)) {
        return { ...state, list: manageUniqueState(state.list, action.promiseActionParams, action.payload) };
    } else if (validatorSearchClear.matchAction(action)) {
        return { ...state, list: manageUniqueState(state.list, action.payload) };
    } else if (validatorUpdateRedux.matchAction(action)) {

        let res: { param: string, result: ValidatorModel } = action.payload;
        let items = manageUniqueState(state.items, res.param, res.result);
        return { ...state, items: items };

    } else if (validatorGet.matchOnSuccess(action)) {
        let items = manageUniqueState(state.items, action.promiseActionParams, action.payload);
        return { ...state, items: items };
    } else if (validatorClear.matchAction(action)) {
        return { ...state, items: manageUniqueState(state.items, action.payload) };
    } else if (validatorUpdate.matchOnSuccess(action)) {
        return { ...state, items: manageUniqueState(state.items, action.promiseActionParams!.id, action.payload) };
    }
    return state;
};

// Selectors
export const getSearch = (s: ValidatorState, uniqueId: string) => selectorItems(s.list, uniqueId);
export const getSearchParams = (s: ValidatorState, uniqueId: string) => selectorParms(s.list, uniqueId);
export const isSearchEmpty = (s: ValidatorState, uniqueId: string) => isEmptyPayload(s.list, uniqueId);
export const getItem = (s: ValidatorState, uniqueId: string) => uniqueId ? selectorUnique(s.items, uniqueId) : {};