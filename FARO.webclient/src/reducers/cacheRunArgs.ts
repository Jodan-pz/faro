import { setCacheRunArg } from '../actions';

const LOCALSTORAGE_KEY = 'cacheRunArgs';
export interface CacheRunArgsState {
  values: { [key: string]: any };
}

const defaultState: CacheRunArgsState = {
  values: localStorage && localStorage.getItem(LOCALSTORAGE_KEY) && JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY) || '{}') || {} as any
};

// Root Reducer
export default (state: CacheRunArgsState = defaultState, action: any): CacheRunArgsState => {
  if (setCacheRunArg.matchAction(action)) {
    const values = { ...state.values, [action.payload.argName]: action.payload.argValue };
    if (localStorage) {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(values));
    }
    return { ...state, values };
  }
  return state;
};
// Selectors
export const getCacheRunArgs = (s: CacheRunArgsState) => s.values;
