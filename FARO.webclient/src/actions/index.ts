import { createAction, createPromiseAction, createPromiseWithThunkAction } from 'app-support';
import { promiseClientConfiguratioGet, withResult, decorator, image, keysIterator, writer, flow, aggregator, source, Proxy, redis, validator, engine } from './proxy';
import { ImageModel, DecoratorModel, KeysIteratorModel, WriterModel, FlowModel, FlowItemRunModel, ArgumentListDecorator, ArgumentListImage, ArgumentListKeysIterator, ArgumentListWriter, ArgumentListFlow, ArgumentListAggregator, AggregatorModel, ArgumentFilter, ArgumentListValidator, ValidatorModel, TrashModel, ArgumentListTrash } from './model';



export const clientConfiguratioGet = createPromiseAction('GET_CLI_CONFIG', promiseClientConfiguratioGet, 'AutoResult');
export const alertAdd = createAction<{ key: string, header: string, content?: string, type?: 'info' | 'warning' }>('ALERT_ADD');
export const alertDel = createAction<string>('ALERT_CLEAR');

// ======================================================= DECORATOR
export const decoratorSearch = createPromiseAction('DECORATOR_SEARCH', (args: ArgumentListDecorator) => {
    return withResult(decorator.list(args.filter, args.filterMatchMode, args.tags, args.tagsMatchMode, args.pageIndex, args.pageSize));
}, 'AutoResult');

export const decoratorSearchClear = createAction<string>('DECORATOR_SEARCH_CLEAR');
export const decoratorGet = createPromiseAction('DECORATOR_GET', (p: string) => withResult(decorator.getById(p)), 'AutoResult');
export const decoratorClear = createAction<string>('DECORATOR_GET_CLEAR');
export const decoratorUpdate = createPromiseAction('DECORATOR_UPDATE', (p: DecoratorModel) => {
    console.log('DECORATOR_UPDATE', p);
    return withResult(decorator.update(p.id!, p));
}, 'AutoResult');
export const decoratorCreate = createPromiseWithThunkAction(
    'DECORATOR_CREATE',
    (parms: { decorator: DecoratorModel, call: (res: any) => void }) => {
        console.log('DECORATOR_CREATE', parms.decorator);
        return withResult(decorator.create(parms.decorator));
    },
    (dispatch, getState, res, parms) => {
        (parms as any).call(res);
    }
);
export const decoratorDelete = createPromiseWithThunkAction(
    'DECORATOR_DELETE',
    (parms: { decorator: DecoratorModel, call: (res: any) => void }) => withResult(decorator.delete(parms.decorator.id!)),
    (dispatch, getState, res, parms) => {
        (parms as any).call(res);
    }
);

export const decoratorUsage = createPromiseAction('DECORATOR_USAGE', (id: string) => withResult(decorator.getDecoratorUsage(id)), 'AutoResult');
export const cleanDecoratorUsage = createAction('CLEAN_DECORATOR_USAGE');


// =================================================== CACHE  
export const setCacheRunArg = createAction<{ argName: string, argValue: any }>('CACHE_RUN_ARG');

// Image

export const imageSearch = createPromiseAction('IMAGE_SEARCH', (args: ArgumentListImage) => {
    return withResult(image.list(args.filter, args.filterMatchMode, args.tags, args.tagsMatchMode, args.pageIndex, args.pageSize));
}, 'AutoResult');
export const imageSearchClear = createAction<string>('IMAGE_SEARCH_CLEAR');
export const imageRunnableGet = createPromiseAction('IMAGE_ENTITY_GET', (p: string) => {
    return withResult(image.getBuildDefinitionById(p));
}, 'AutoResult');

export const imageResetChanged = createAction<string>('IMAGE_RESET_CHANGED');
export const imageGet = createPromiseAction('IMAGE_GET', (p: string) => withResult(image.getById(p)), 'AutoResult');

export const imageGetAggregators = createPromiseAction('IMAGE_GET_AGGREGATORS', (p: string) => withResult(image.getAggregatorsById(p)), 'AutoResult');
export const imageGetValidators = createPromiseAction('IMAGE_GET_VALIDATORS', (p: string) => withResult(image.getValidatorsById(p)), 'AutoResult');

export const imageCheck = createPromiseAction('IMAGE_CHECK', (p: string) => withResult(image.checkIntegrity(p)), 'AutoResult');
export const clearCurrentImageCheck = createAction<string>('IMAGE_CHECK_CLEAR');


export const imageUpdate = createPromiseAction('IMAGE_UPDATE', (p: ImageModel) => {
    return withResult(image.update(p.id!, p));
}, 'AutoResult');

export const imageCreate = createPromiseWithThunkAction(
    'IMAGE_CREATE',
    (parms: { image: ImageModel, call: (res: any) => void }) => {
        return withResult(image.create(parms.image));
    },
    (dispatch, getState, res, parms) => {
        (parms as any).call(res);
    }
);
export const imageDelete = createPromiseWithThunkAction(
    'IMAGE_DELETE',
    (parms: { image: ImageModel, call: (res: any) => void }) => withResult(image.delete(parms.image.id!)),
    (dispatch, getState, res, parms) => {
        (parms as any).call(res);
    }
);
export const imageClear = createAction<string>('IMAGE_ENTITY_GET_CLEAR');
export const imageUsage = createPromiseAction('IMAGE_USAGE', (id: string) => withResult(image.getImageUsage(id)), 'AutoResult');
export const cleanImageUsage = createAction('CLEAN_IMAGE_USAGE');
export const setSelectField = createAction<string | undefined>('IMAGE_SELECTFIELD');

// ======================================================= VALIDATOR 
export const validatorSearch = createPromiseAction('VALIDATOR_SEARCH', (args: ArgumentListValidator) => {
    return withResult(validator.list(args.filter, args.filterMatchMode, args.tags, args.tagsMatchMode, args.pageIndex, args.pageSize));
}, 'AutoResult');

export const validatorUpdateRedux = createAction<{ param: string, result: ValidatorModel }>('VALIDATOR_UPDATE_REDUX');
export const validatorGet = createPromiseAction('VALIDATOR_GET', (p: string) => withResult(validator.getById(p)), 'AutoResult');
export const validatorGetCallback = createPromiseWithThunkAction(
    'VALIDATOR_GET_CALLBACK',
    (parms: { id: string, call: (res: any) => void }) => withResult(validator.getById(parms.id)),
    (dispatch, getState, res, parms) => {
        (parms as any).call(res);
    }
);
// validator update
export const validatorUpdate = createPromiseAction('VALIDATOR_UPDATE', (p: ValidatorModel) => {
    return withResult(validator.update(p.id!, p));
}, 'AutoResult');
export const validatorUpdateCallBack = createPromiseWithThunkAction(
    'VALIDATOR_UPDATE_CALLBACK',
    (parms: { model: ValidatorModel, call: (res: any) => void }) => {
        return withResult(validator.update(parms.model.id!, parms.model));
    },
    (dispatch, getState, res, parms) => {
        (parms as any).call(res);
    }
);
export const validatorDelete = createPromiseWithThunkAction(
    'VALIDATOR_DELETE',
    (parms: { validator: ValidatorModel, call: (res: any) => void }) => withResult(validator.delete(parms.validator.id!)),
    (dispatch, getState, res, parms) => {
        (parms as any).call(res);
    }
);
export const validatorCreate = createPromiseWithThunkAction(
    'VALIDATOR_CREATE',
    (parms: { validator: ValidatorModel, call: (res: any) => void }) => {
        return withResult(validator.create(parms.validator));
    },
    (dispatch, getState, res, parms) => {
        (parms as any).call(res);
    }
);
export const validatorSearchClear = createAction<string>('VALIDATOR_SEARCH_CLEAR');
export const validatorClear = createAction<string>('VALIDATOR_GET_CLEAR');



// ======================================================= AGGREGATOR
export const aggregatorSearch = createPromiseAction('AGGREGATOR_SEARCH', (args: ArgumentListAggregator) => {
    return withResult(aggregator.list(args.filter, args.filterMatchMode, args.tags, args.tagsMatchMode, args.pageIndex, args.pageSize));
}, 'AutoResult');

export const aggregatorSearchClear = createAction<string>('AGGREGATOR_SEARCH_CLEAR');
export const aggregatorClear = createAction<string>('AGGREGATOR_GET_CLEAR');

export const aggregatorUpdateRedux = createAction<{ param: string, result: AggregatorModel }>('AGGREGATOR_UPDATE_REDUX');
export const aggregatorGet = createPromiseAction('AGGREGATOR_GET', (p: string) => withResult(aggregator.getById(p)), 'AutoResult');
export const aggregatorGetCallback = createPromiseWithThunkAction(
    'AGGREGATOR_GET_CALLBACK',
    (param: { idAgg: string, call: (res: any) => void }) => withResult(aggregator.getById(param.idAgg)),
    (dispatch, getState, res, parms) => {
        (parms as any).call(res);
    }
);

export const aggregatorUpdate = createPromiseAction('AGGREGATOR_UPDATE', (p: AggregatorModel) => {
    return withResult(aggregator.update(p.id!, p));
}, 'AutoResult');

export const aggregatorUpdateCallBack = createPromiseWithThunkAction(
    'AGGREGATOR_UPDATE_CALLBACK',
    (parms: { model: AggregatorModel, call: (res: any) => void }) => {
        return withResult(aggregator.update(parms.model.id!, parms.model));
    },
    (dispatch, getState, res, parms) => {
        (parms as any).call(res);
    }
);

export const aggregatorDelete = createPromiseWithThunkAction(
    'AGGREGATOR_DELETE',
    (parms: { aggregator: AggregatorModel, call: (res: any) => void }) => withResult(aggregator.delete(parms.aggregator.id!)),
    (dispatch, getState, res, parms) => {
        (parms as any).call(res);
    }
);
export const aggregatorCreate = createPromiseWithThunkAction(
    'AGGREGATOR_CREATE',
    (parms: { aggregator: AggregatorModel, call: (res: any) => void }) => {
        return withResult(aggregator.create(parms.aggregator));
    },
    (dispatch, getState, res, parms) => {
        (parms as any).call(res);
    }
);

// =================================== KEYS ITERATOR
export const keysIteratorSearch = createPromiseAction('KEYSITERATOR_SEARCH', (args: ArgumentListKeysIterator) => {
    return withResult(keysIterator.list(args.filter, args.filterMatchMode, args.tags, args.tagsMatchMode, args.pageIndex, args.pageSize));
}, 'AutoResult');

export const keysIteratorSearchClear = createAction<string>('KEYSITERATOR_SEARCH_CLEAR');
export const keysIteratorGet = createPromiseAction('KEYSITERATOR_GET', (p: string) => withResult(keysIterator.getById(p)), 'AutoResult');
export const keysIteratorClear = createAction<string>('KEYSITERATOR_GET_CLEAR');
export const keysIteratorUpdate = createPromiseAction('KEYSITERATOR_UPDATE', (p: KeysIteratorModel) => {
    return withResult(keysIterator.update(p.id!, p));
}, 'AutoResult');
export const keysIteratorCreate = createPromiseWithThunkAction(
    'KEYSITERATOR_CREATE',
    (parms: { keysIterator: KeysIteratorModel, call: (res: any) => void }) => {
        return withResult(keysIterator.create(parms.keysIterator));
    },
    (dispatch, getState, res, parms) => {
        (parms as any).call(res);
    }
);
export const keysIteratorDelete = createPromiseWithThunkAction(
    'KEYSITERATOR_DELETE',
    (parms: { keysIterator: KeysIteratorModel, call: (res: any) => void }) => withResult(keysIterator.delete(parms.keysIterator.id!)),
    (dispatch, getState, res, parms) => {
        (parms as any).call(res);
    }
);
export const keysIteratorUsage = createPromiseAction('KEYSITERATOR_USAGE', (id: string) => withResult(keysIterator.getKeysIteratorUsage(id)), 'AutoResult');
export const cleankeysIteratorUsage = createAction('CLEAN_KEYSITERATOR_USAGE');
// ================================= WRITER
export const writerSearch = createPromiseAction('WRITER_SEARCH', (args: ArgumentListWriter) => {
    return withResult(writer.list(args.filter, args.filterMatchMode, args.tags, args.tagsMatchMode, args.pageIndex, args.pageSize));
}, 'AutoResult');

export const writerSearchClear = createAction<string>('WRITER_SEARCH_CLEAR');
export const writerGet = createPromiseAction('WRITER_GET', (p: string) => withResult(writer.getById(p)), 'AutoResult');
export const writerUpdate = createPromiseAction('WRITER_UPDATE', (p: WriterModel) => {
    return withResult(writer.update(p.id!, p));
}, 'AutoResult');
export const writerClear = createAction<string>('WRITER_GET_CLEAR');
export const writerCreate = createPromiseWithThunkAction(
    'WRITER_CREATE',
    (parms: { writer: WriterModel, call: (res: any) => void }) => {
        return withResult(writer.create(parms.writer));
    },
    (dispatch, getState, res, parms) => {
        (parms as any).call(res);
    }
);
export const writerDelete = createPromiseWithThunkAction(
    'WRITER_DELETE',
    (parms: { writer: WriterModel, call: (res: any) => void }) => withResult(writer.delete(parms.writer.id!)),
    (dispatch, getState, res, parms) => {
        (parms as any).call(res);
    }
);

export const writerUsage = createPromiseAction('WRITER_USAGE', (id: string) => withResult(writer.getWriterUsage(id)), 'AutoResult');
export const cleanWriterUsage = createAction('CLEAN_WRITER_USAGE');
// ================================================ FLOWS
export const flowSearch = createPromiseAction('FLOW_SEARCH', (args: ArgumentListFlow) => {
    return withResult(flow.list(args.filter, args.filterMatchMode, args.tags, args.tagsMatchMode, args.pageIndex, args.pageSize));
}, 'AutoResult');
export const flowSearchClear = createAction<string>('FLOW_SEARCH_CLEAR');
export const flowGet = createPromiseAction('FLOW_GET', (p: string) => withResult(flow.getById(p)), 'AutoResult');
export const flowCheck = createPromiseAction('FLOW_CHECK', (p: string) => withResult(flow.checkIntegrity(p)), 'AutoResult');
export const clearCurrentFlowCheck = createAction<string>('FLOW_CHECK_CLEAR');
export const flowRunnableGet = createPromiseAction('FLOW_ENTITY_GET', (p: string) => withResult(flow.getRunDefinitionById(p)), 'AutoResult');

export const flowClear = createAction<string>('FLOW_GET_CLEAR');
export const flowUpdate = createPromiseAction('FLOW_UPDATE', (p: DecoratorModel) => {
    return withResult(flow.update(p.id!, p));
}, 'AutoResult');
export const flowCreate = createPromiseWithThunkAction(
    'FLOW_CREATE',
    (parms: { flowItem: FlowModel, call: (res: any) => void }) => {
        return withResult(flow.create(parms.flowItem));
    },
    (dispatch, getState, res, parms) => {
        (parms as any).call(res);
    }
);
export const flowDelete = createPromiseWithThunkAction(
    'FLOW_DELETE',
    (parms: { flowItem: FlowModel, call: (res: any) => void }) => withResult(flow.delete(parms.flowItem.id!)),
    (dispatch, getState, res, parms) => {
        (parms as any).call(res);
    }
);

/* downloadFile*/
const downloadFile = (blob: any, filename: string) => {
    if (typeof window.navigator.msSaveBlob !== 'undefined') {
        window.navigator.msSaveBlob(blob, filename);
    } else {
        var downloadURL = URL.createObjectURL(blob);
        var tempLink = document.createElement('a');
        tempLink.href = downloadURL;
        tempLink.setAttribute('download', filename);
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
        URL.revokeObjectURL(downloadURL);
    }
};

export const runFlowDownload = (parms: { flowItemRun: FlowItemRunModel, callBack: (res: any) => void }) => {
    if (parms) {
        flow.run(parms.flowItemRun as Proxy.FlowItemRunDefinition)
            .then((r: any) => {
                if (r) {
                    let file: string = r.fileName || 'download.txt';
                    downloadFile(r!.data, file);
                }
                if (parms.callBack) {
                    parms.callBack({ result: true, error: null });
                }
            }).catch((err: { response: undefined; } | undefined) => {
                if (parms.callBack) {
                    let e: any = err && err.response !== undefined ? err.response : (err !== undefined ? err : { error: 'unknow' });
                    parms.callBack({ result: false, error: JSON.parse(e) });
                }
            });
    }
};


// FILTER

export const updateFilter = createAction<ArgumentFilter>('UPDATE_FILTER');


// SOURCE DEFINITION
export const getDecoratorsArgs = createPromiseAction('GET_DECORATOR_ARGS', (type: string) => withResult(source.getDecoratorSourceArguments(type)), 'AutoResult');
export const getKeysIteratorArgs = createPromiseAction('GET_KEYSITERATOR_ARGS', (type: string) => withResult(source.getKeysIteratorSourceArguments(type)), 'AutoResult');

// CLONE ITEM 
export const cloneItem = createAction<any>('CLONE_ITEM');
export const deleteCloneItem = createAction('DELETE_CLONE_ITEM');

// REDIS 
export const isRedisConfigured = createPromiseAction('IS_REDIS_CONFIGURED', () => redis.isConfigured(), 'AutoResult');
export const deleteRedisCache = createPromiseAction('DELETE_REDIS_CACHE', () => redis.clear(), 'AutoResult');

// ENGINE 
export const registeredEngines = createPromiseAction('REGISTERED_ENGINES', () => withResult(engine.getRegisteredEngines()), 'AutoResult');
// export const registeredEngines = createAction('REGISTERED_ENGINES');


// TRASH 
/*
export const trashDelete = createPromiseWithThunkAction(
    'TRASH_DELETE',
    (parms: { trashItem: TrashModel, call: (res: any) => void }) => withResult(trash.delete(parms.trashItem.id!)),
    (dispatch, getState, res, parms) => {
        (parms as any).call(res);
    }
);

export const trashSearch = createPromiseAction('TRASH_SEARCH', (args: ArgumentListTrash) => {
    return withResult(trash.list(args.filter, args.filterMatchMode, args.tags, args.tagsMatchMode, args.pageIndex, args.pageSize));
}, 'AutoResult');

export const trashSearchClear = createAction<string>('TRASH_SEARCH_CLEAR');

export const trashRestore = createPromiseWithThunkAction(
    'TRASH_RESTORE',
    (parms: { trashItem: TrashModel, call: (res: any) => void }) => withResult(trash.restore(parms.trashItem.id!)),
    (dispatch, getState, res, parms) => {
        (parms as any).call(res);
    }
);

 */

