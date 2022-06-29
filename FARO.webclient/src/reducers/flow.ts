import { FlowModel, FlowItemRunModel, CheckResultCollectionModel } from '../actions/model';
import { UniqueStateParametric, UniqueState, selectorUnique, selectorParms, isEmptyPayload, manageUniqueState, selectorItems } from './utils';
import { flowSearch, flowSearchClear, flowGet, flowUpdate, flowClear, flowRunnableGet, flowCheck, clearCurrentFlowCheck } from '../actions';


export interface FlowState {
    list?: UniqueStateParametric<FlowModel>;
    items?: { [key: string]: FlowItemRunModel };
    currentFlow?: FlowModel;
    check?: CheckResultCollectionModel | null;
    
}
 
const defaultState: FlowState = {};

export default (state: FlowState = defaultState, action: any): FlowState => {
    // ok
    if (flowSearch.matchOnSuccess(action)) {
        return { ...state, list: manageUniqueState(state.list, action.promiseActionParams, action.payload) };
    } else if (clearCurrentFlowCheck.matchAction(action)) {
        return { ...state, check: null };
    } else if (flowCheck.matchOnSuccess(action)) {
        return { ...state, check: action.payload };
    } else if (flowGet.matchOnSuccess(action)) {
        return { ...state, currentFlow: action.payload };
    } else if (flowSearchClear.matchAction(action)) {
        return { ...state, list: manageUniqueState(state.list, action.payload) };
    } else if (flowRunnableGet.matchOnSuccess(action)) {
        let items: { [key: string]: FlowItemRunModel } = state.items ? state.items : {};
        let flow: FlowModel | undefined = action.payload && action.payload.flow ? action.payload.flow : undefined;
        if (action.payload && flow && flow.id) {
            items[flow.id] = action.payload as FlowItemRunModel;
        }
        return { ...state, items: { ...items } };
    } else if (flowClear.matchAction(action)) {
        return { ...state, items: manageUniqueState(state.items, action.payload) };
    } else if (flowUpdate.matchOnSuccess(action)) {
        let flow: FlowModel | undefined = action.payload;
        if (flow) {
            let items: { [key: string]: FlowItemRunModel } = state.items ? state.items : {};
            let item = {...items[flow.id!]};
            item.flow = flow; 
            items[flow.id!] = item;
            return { ...state, items: { ...items } };
        }
    }
    return state;
};

// Selectors

export const getCurrentFlow = (s: FlowState) => s.currentFlow;
export const getCurrentCheck = (s: FlowState) => s.check;
export const getSearch = (s: FlowState, uniqueId: string) => selectorItems(s.list, uniqueId);
export const getItem = (s: FlowState, uniqueId: string) => selectorUnique(s.items, uniqueId);
export const getSearchParams = (s: FlowState, uniqueId: string) => selectorParms(s.list, uniqueId);
export const isSearchEmpty = (s: FlowState, uniqueId: string) => isEmptyPayload(s.list, uniqueId);
export const getImageArgs = (s: FlowState, uniqueId: string) => {
    let item: FlowItemRunModel | undefined = getItem(s, uniqueId);
    if (item && item.imageargs) return item.imageargs;
    return undefined;
};
export const getWriterArgs = (s: FlowState, uniqueId: string) => {
    let item: FlowItemRunModel | undefined = getItem(s, uniqueId);
    if (item && item.writerargs) return item.writerargs;
    return undefined;
};