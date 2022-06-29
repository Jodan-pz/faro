import { Redux } from 'app-support';
import * as fromContext from './context';
import * as fromMessage from './messages';
import * as fromDecorator from './decorator';
import * as fromImage from './image';
import * as fromAggregator from './aggregator';
import * as fromValidator from './validator';
import * as fromIterator from './keysiterator';
import * as fromWriter from './writer';
import * as fromFlow from './flow';
import * as fromFilter from './filter';
import * as fromSource from './sourceDefinition';
import * as fromClone from './clone';
import * as fromCacheRunArgs from './cacheRunArgs';
import * as fromEngine from './engine';
// import * as fromTrash from './trash';

// Store Model
export interface AppState {
    context: fromContext.ContextState;
    message: fromMessage.MessagesState;
    decorators: fromDecorator.DecoratorState;
    aggregators: fromAggregator.AggregatorState;
    validators: fromValidator.ValidatorState;
    images: fromImage.ImageState;
    keysIterator: fromIterator.KeysIteratorState;
    writer: fromWriter.WriterState;
    flow: fromFlow.FlowState;
    cacheRunArgs: fromCacheRunArgs.CacheRunArgsState;
    filter: fromFilter.FilterState;
    source: fromSource.SourceDefinitionState;
    clone: fromClone.CloneState;
    engine: fromEngine.EngineState;
   // trash: fromTrash.TrashState;
}
// Root Reducer
export default Redux.combineReducers<AppState>({
    context: fromContext.default,
    message: fromMessage.default,
    decorators: fromDecorator.default,
    images: fromImage.default,
    aggregators: fromAggregator.default,
    validators: fromValidator.default,
    keysIterator: fromIterator.default,
    writer: fromWriter.default,
    flow: fromFlow.default,
    cacheRunArgs: fromCacheRunArgs.default,
    filter: fromFilter.default,
    source: fromSource.default,
    clone: fromClone.default,
    engine: fromEngine.default
   //  trash: fromTrash.default
});


// Application State
export const getClientConfiguration = (s: AppState) => fromContext.getClientConfiguration(s.context);
export const getLoading = (s: AppState) => fromContext.getLoading(s.context);


// CLONE ITEM
export const getCloneItem = (s: AppState) => fromClone.getCloneItem(s.clone);

// FILTER
export const getFilter = (s: AppState) => fromFilter.getFilter(s.filter);


// SOURCE DEFINITION
export const selectDecoratorsArgs = (s: AppState) => fromSource.selectDecoratorsArgs(s.source);
export const selectKeysIteratorArgs = (s: AppState) => fromSource.selectKeysIteratorArgs(s.source);
export const getLastDecoratorsType = (s: AppState) => fromSource.getLastDecoratorsType(s.source);
export const getLastKeysIteratorType = (s: AppState) => fromSource.getLastKeysIteratorType(s.source);

// message
export const selectFlyingMessage = (s: AppState, id: string) => fromMessage.selectFlyingMessage(s.message, id);
export const selectModalMessage = (s: AppState, id: string) => fromMessage.selectModalMessage(s.message, id);
export const getShownList = (s: AppState) => fromMessage.getShownList(s.message);
export const getModalList = (s: AppState) => fromMessage.getModalList(s.message);
export const getFlyingList = (s: AppState) => fromMessage.getFlyingList(s.message);
export const getStateViewers = (s: AppState) => fromMessage.getStateViewers(s.message);
export const getWaitingViewers = (s: AppState) => fromMessage.getWaitingViewers(s.message);
// cache run
export const getCacheRunArgs = (s: AppState) => fromCacheRunArgs.getCacheRunArgs(s.cacheRunArgs);

// Decorators
export const getDecorator = (s: AppState, id: string) => fromDecorator.getItem(s.decorators, id);
export const getDecorators = (s: AppState, uniqueId: string) => fromDecorator.getSearch(s.decorators, uniqueId);
export const getDecoratorsParms = (s: AppState, uniqueId: string) => fromDecorator.getSearchParams(s.decorators, uniqueId);
export const isDecoratorsEmpty = (s: AppState, uniqueId: string) => fromDecorator.isSearchEmpty(s.decorators, uniqueId);
export const getDecoratorUsage = (s: AppState) => fromDecorator.getDecoratorUsage(s.decorators);
// Flows
export const getCurrentCheck = (s: AppState) => fromFlow.getCurrentCheck(s.flow);
export const getCurrentFlow = (s: AppState) => fromFlow.getCurrentFlow(s.flow);
export const getFlow = (s: AppState, id: string) => fromFlow.getItem(s.flow, id);
export const getFlowSearch = (s: AppState, id: string) => fromFlow.getSearch(s.flow, id);
export const getFlowParms = (s: AppState, uniqueId: string) => fromFlow.getSearchParams(s.flow, uniqueId);
export const isFlowsEmpty = (s: AppState, uniqueId: string) => fromFlow.isSearchEmpty(s.flow, uniqueId);
export const getImageArgs = (s: AppState, id: string) => fromFlow.getImageArgs(s.flow, id);
export const getWriterArgs = (s: AppState, id: string) => fromFlow.getWriterArgs(s.flow, id);

// Image  
export const imageIsChanged = (s: AppState) => fromImage.imageIsChanged(s.images);
export const getCurrentImageCheck = (s: AppState) => fromImage.getCurrentCheck(s.images);
export const getCurrentImage = (s: AppState) => fromImage.getCurrentImage(s.images);

export const getItem = (s: AppState, id: string) => fromImage.getItem(s.images, id);
export const getImage = (s: AppState, id: string) => fromImage.getImage(s.images, id);

export const getCurrentAggregators = (s: AppState) => fromImage.getCurrentAggregators(s.images);
export const getCurrentValidators = (s: AppState) => fromImage.getCurrentValidators(s.images);
export const getCurrentImagefields = (s: AppState) => fromImage.getCurrentImagefields(s.images);

export const getArgs = (s: AppState, id: string) => fromImage.getArgs(s.images, id);
export const getImageSearch = (s: AppState, uniqueId: string) => fromImage.getSearch(s.images, uniqueId);
export const getImageParms = (s: AppState, uniqueId: string) => fromImage.getSearchParams(s.images, uniqueId);
export const isImagesEmpty = (s: AppState, uniqueId: string) => fromImage.isSearchEmpty(s.images, uniqueId);
export const getImageUsage = (s: AppState) => fromImage.getImageUsage(s.images);
export const getSelectImageField = (s: AppState) => fromImage.getSelectImageField(s.images);

// Aggregators
export const getAggregator = (s: AppState, id: string) => fromAggregator.getItem(s.aggregators, id);
export const getAggregatorsSearch = (s: AppState, uniqueId: string) => fromAggregator.getSearch(s.aggregators, uniqueId);
export const getAggregatorsParms = (s: AppState, uniqueId: string) => fromAggregator.getSearchParams(s.aggregators, uniqueId);
export const isAggregatorsEmpty = (s: AppState, uniqueId: string) => fromAggregator.isSearchEmpty(s.aggregators, uniqueId);

// Validator

export const getValidator = (s: AppState, id: string) => fromValidator.getItem(s.validators, id);
export const getValidatorSearch = (s: AppState, uniqueId: string) => fromValidator.getSearch(s.validators, uniqueId);
export const getValidatorParms = (s: AppState, uniqueId: string) => fromValidator.getSearchParams(s.validators, uniqueId);
export const isValidatorEmpty = (s: AppState, uniqueId: string) => fromValidator.isSearchEmpty(s.validators, uniqueId);

// Keys Iterator  
export const getKeysIteratorSearch = (s: AppState, uniqueId: string) => fromIterator.getSearch(s.keysIterator, uniqueId);
export const isKeysIteratorEmpty = (s: AppState, uniqueId: string) => fromIterator.isSearchEmpty(s.keysIterator, uniqueId);
export const getKeysIteratorParms = (s: AppState, uniqueId: string) => fromIterator.getSearchParams(s.keysIterator, uniqueId);
export const getKeysIterator = (s: AppState, uniqueId: string) => fromIterator.getItem(s.keysIterator, uniqueId);
export const getKeysUsage = (s: AppState) => fromIterator.getKeysUsage(s.keysIterator);

// writer  
export const getWriterSearch = (s: AppState, uniqueId: string) => fromWriter.getSearch(s.writer, uniqueId);
export const isWriterEmpty = (s: AppState, uniqueId: string) => fromWriter.isSearchEmpty(s.writer, uniqueId);
export const getWriterParms = (s: AppState, uniqueId: string) => fromWriter.getSearchParams(s.writer, uniqueId);
export const getWriter = (s: AppState, uniqueId: string) => fromWriter.getItem(s.writer, uniqueId);
export const getWriterUsage = (s: AppState) => fromWriter.getWriterUsage(s.writer);

// engine 
export const getDecoratorEngines = (s: AppState)  => fromEngine.getDecoratorEngines(s.engine);
export const getKeysIteratorEngines = (s: AppState)  => fromEngine.getKeysIteratorEngines(s.engine);
export const getAggregatorEngines = (s: AppState)  => fromEngine.getAggregatorEngines(s.engine);
export const getValidatorEngines = (s: AppState)  => fromEngine.getValidatorEngines(s.engine);
export const getWriterEngines = (s: AppState)  => fromEngine.getWriterEngines(s.engine);


// trash 
// export const getTrashSearch = (s: AppState, uniqueId: string) => fromTrash.getTrashSearch(s.trash, uniqueId);
// export const isTrashSearchEmpty = (s: AppState, uniqueId: string) => fromTrash.isTrashSearchEmpty(s.trash, uniqueId);
 
