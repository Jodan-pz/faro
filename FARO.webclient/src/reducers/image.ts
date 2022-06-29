import { ImageModel, ImageBuildModel, AggregatorModel, CheckResultCollectionModel, ValidatorModel, ImageUsageCollectionModel } from '../actions/model';
import { UniqueStateParametric, manageUniqueState, selectorItems, selectorParms, isEmptyPayload, selectorUnique } from './utils';
import { imageSearch, imageSearchClear, imageRunnableGet, imageClear, imageUpdate, imageCreate, imageGetAggregators, imageCheck, imageGet, clearCurrentImageCheck, imageResetChanged, imageGetValidators, imageUsage, cleanImageUsage, setSelectField } from '../actions';

export interface ImageState {
    list?: UniqueStateParametric<ImageModel>;
    items?: { [key: string]: ImageBuildModel };
    currAggregators?: AggregatorModel[];
    currValidators?: ValidatorModel[];
    imagefields?: string[] | undefined;
    currImage?: ImageModel;
    check?: CheckResultCollectionModel | null;
    imageChanged?: boolean;
    imageUsage?: ImageUsageCollectionModel | undefined;
    selectField?: string | undefined;
}

const defaultState: ImageState = {
};
 
 
 
export default (state: ImageState = defaultState, action: any): ImageState => {
    // ok
    if (imageSearch.matchOnSuccess(action)) {
        return { ...state, list: manageUniqueState(state.list, action.promiseActionParams, action.payload) };
    } else if (imageGet.matchOnSuccess(action)) {
        return { ...state, currImage: action.payload };
    } else if (clearCurrentImageCheck.matchAction(action)) {
        return { ...state, check: null };
    } else if (imageCheck.matchOnSuccess(action)) {
        return { ...state, check: action.payload };
    } else if (imageSearchClear.matchAction(action)) {
        return { ...state, list: manageUniqueState(state.list, action.payload) };
    } else if (imageRunnableGet.matchOnSuccess(action)) {
        let items: { [key: string]: ImageBuildModel } = state.items ? state.items : {};
        if (action.payload && action.payload.image) {
            items[action.payload.image.id!] = action.payload;
        }
        return { ...state, items: { ...items } };
    } else if (imageClear.matchAction(action)) {
        // items: manageUniqueState(state.items, action.payload)
        return { ...state, currImage : undefined  };
    } else if (imageResetChanged.matchAction(action)) {
        return { ...state, imageChanged: false };
    } else if (imageUpdate.matchOnSuccess(action)) {
        let image: ImageModel | undefined = action.payload;
        let items: { [key: string]: ImageBuildModel } | undefined = state.items;
        if (image && items) {
            let id: string | undefined = image.id;
            if (id) {
                if (items[id] === undefined) items[id] = {};
                items[id].image = image;
            }
        }
        return { ...state, items: items ? { ...items } : items, currImage: { ...image }, imageChanged: true };
    } else if (imageGetValidators.matchOnSuccess(action)) {
        let validators = action.payload!.validators;
        let imagefields = action.payload!.imagefields;
        return { ...state, currValidators: validators, imagefields: imagefields };
    } else if (imageGetAggregators.matchOnSuccess(action)) {
        let aggregators = action.payload!.aggregators;
        let imagefields = action.payload!.imagefields;
        return { ...state, currAggregators: aggregators, imagefields: imagefields };
    } else if (imageUsage.matchOnSuccess(action)) {
        return { ...state, imageUsage: action.payload };
    } else if (setSelectField.matchAction(action)) {
        return { ...state, selectField: action.payload };
    } else if (cleanImageUsage.matchAction(action)) {
        return { ...state, imageUsage: undefined };
    }
    return state;
};

// ImageUsageCollection cleanImageUsage

// Selectors
export const imageIsChanged = (s: ImageState) => s.imageChanged;
export const getCurrentCheck = (s: ImageState) => s.check;

export const getCurrentImage = (s: ImageState) => s.currImage;

export const getSearch = (s: ImageState, uniqueId: string) => selectorItems(s.list, uniqueId);
export const getSearchParams = (s: ImageState, uniqueId: string) => selectorParms(s.list, uniqueId);
export const isSearchEmpty = (s: ImageState, uniqueId: string) => isEmptyPayload(s.list, uniqueId);
export const getItem = (s: ImageState, uniqueId: string) => selectorUnique(s.items, uniqueId);

export const getCurrentAggregators = (s: ImageState) => s.currAggregators;
export const getCurrentValidators = (s: ImageState) => s.currValidators;
export const getCurrentImagefields = (s: ImageState) => s.imagefields;
export const getImageUsage = (s: ImageState) => s.imageUsage;
export const getSelectImageField = (s: ImageState) => s.selectField;

export const getArgs = (s: ImageState, uniqueId: string) => {
    let item: ImageBuildModel | undefined = getItem(s, uniqueId);
    if (item && item.args) return item.args;
    return undefined;
};
export const getImage = (s: ImageState, uniqueId: string) => {
    let item: ImageBuildModel | undefined = getItem(s, uniqueId);
    if (item && item.image) return item.image;
    return undefined;
};