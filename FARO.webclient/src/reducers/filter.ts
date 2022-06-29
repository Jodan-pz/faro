import { ArgumentFilter } from 'src/actions/model';
import { FilterMatchMode, TagsMatchMode } from 'mglib-faro.webclient/MGLib_FARO.WEBAPI';
import { updateFilter } from 'src/actions';

export interface FilterState {

    currentFilter?: ArgumentFilter;
}
const defaultState: FilterState = {

    currentFilter: {
        filter: '',
        filterMatchMode: FilterMatchMode.Contains,
        tags: [],
        tagsMatchMode: TagsMatchMode.Any,
        pageIndex: undefined,
        pageSize: undefined
    }
};

export default (state: FilterState = defaultState, action: any): FilterState => {
    if (updateFilter.matchAction(action)) {

        return { currentFilter: action.payload };
    }
    return state;
};




export const getFilter = (s: FilterState) => s.currentFilter; 