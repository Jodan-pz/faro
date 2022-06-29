import { getDecoratorsArgs, getKeysIteratorArgs } from '../actions';
import { ArgumentModel } from '../actions/model';

 

export interface SourceDefinitionState {
    decoratorsArgs: ArgumentModel[] | undefined;
    lastDecoratorType: string | undefined;
    keysIteratorArgs: ArgumentModel[] | undefined;
    lastKeysIteratorType: string | undefined;
}

const defaultState: SourceDefinitionState = {
    decoratorsArgs: undefined,
    lastDecoratorType: undefined,
    lastKeysIteratorType: undefined,
    keysIteratorArgs: undefined,
};

export default (state: SourceDefinitionState = defaultState, action: any): SourceDefinitionState => {
    if (getDecoratorsArgs.matchOnSuccess(action)) {
        return { ...state, decoratorsArgs: action.payload, lastDecoratorType: action.promiseActionParams };
    } else if (getKeysIteratorArgs.matchOnSuccess(action)) {
        return { ...state, keysIteratorArgs: action.payload, lastKeysIteratorType: action.promiseActionParams };
    }
    return state;
};

export const getLastDecoratorsType = (s: SourceDefinitionState) => s.lastDecoratorType;
export const getLastKeysIteratorType = (s: SourceDefinitionState) => s.lastKeysIteratorType;
export const selectDecoratorsArgs = (s: SourceDefinitionState) => s.decoratorsArgs;
export const selectKeysIteratorArgs = (s: SourceDefinitionState) => s.keysIteratorArgs;