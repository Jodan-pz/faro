import { registeredEngines } from '../actions';

export interface EngineState {
    Decorators?: Array<string>;
    KeysIterator?: Array<string>;
    Aggregator?: Array<string>;
    Validator?: Array<string>;
    Writer?: Array<string>;
}

const defaultState: EngineState = {};

export default (state: EngineState = defaultState, action: any): EngineState => {
    if (registeredEngines.matchOnSuccess(action)) {
        if (action.payload) {
            let payload: { [key: string]: string[] } = action.payload;
            return {
                ...state,
                Decorators: [...(payload.Decorators || [])],
                KeysIterator: [...(payload.KeysIterators || [])],
                Aggregator: [...(payload.Aggregators || [])],
                Validator: [...(payload.Validators || [])],
                Writer: [...(payload.Writers || [])]
            };

            /*
            return {
                ...state,
                Decorators: [...(payload['Decorators'] || [])],
                KeysIterator: [...(payload['KeysIterator'] || [])],
                Aggregator: [...(payload['Aggregator'] || [])],
                Validator: [...(payload['Validator'] || [])],
                Writer: [...(payload['Writer'] || [])]
            };
            */
        }
    }
    return state;
};

// Selectors
export const getDecoratorEngines = (s: EngineState): Array<string> => s.Decorators ? s.Decorators : [];
export const getKeysIteratorEngines = (s: EngineState): Array<string> => s.KeysIterator ? s.KeysIterator : [];
export const getAggregatorEngines = (s: EngineState): Array<string> => s.Aggregator ? s.Aggregator : [];
export const getValidatorEngines = (s: EngineState): Array<string> => s.Validator ? s.Validator : [];
export const getWriterEngines = (s: EngineState): Array<string> => s.Writer ? s.Writer : [];