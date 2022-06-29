import { cloneItem, deleteCloneItem } from 'src/actions';

export interface CloneState {
    item: any;
}

const defaultState: CloneState = {
    item: null
};

export default (state: CloneState = defaultState, action: any): CloneState => {
    if (cloneItem.matchAction(action)) {
        return { item: action.payload };
    } else if (deleteCloneItem.matchAction(action)) {
        return { item: null };
    }
    return state;
};

export const getCloneItem = (s: CloneState) => s.item;
