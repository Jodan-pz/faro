import { clientConfiguratioGet } from '../actions';
import { ClientConfigurationModel } from '../actions/model';
import { onError, onEnd, onStart } from 'app-support';

export interface ContextState {
    clientConfiguration?: ClientConfigurationModel;
    loading: boolean;
}

const defaultState: ContextState = {
    loading: false
   
};

// Root Reducer
export default (state: ContextState = defaultState, action: any): ContextState => {
    if (onStart.matchAction(action)) {
        return { ...state, loading: true };
    } else if (onEnd.matchAction(action)) {
        return { ...state, loading: false };
    } else if (onError.matchAction(action)) {
        return { ...state, loading: false };
    } else if (clientConfiguratioGet.matchOnSuccess(action)) {
        return { ...state, clientConfiguration: action.payload || undefined };
    }  
    return state;
};
// Selectors
export const getClientConfiguration = (s: ContextState) => s.clientConfiguration;
export const getLoading = (s: ContextState) => s.loading;
 