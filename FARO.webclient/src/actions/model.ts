import { Proxy } from './proxy';
import { ImageBuildDefinition, FlowItemRunDefinition, Argument, FlowItemImagePersisterState } from './faro_api_proxy';

export interface ClientConfigurationModel {
    EnvironmentName: any;
    Version: any;
}

export type OutputFieldModel = Proxy.OutputField;
export type DecoratorModel = Proxy.DecoratorDefinition;
export type DecoratorUsageCollectionModel = Proxy.DecoratorUsageCollection;
export type ImageKeysIteratorsDefinitionModel = Proxy.ImageKeysIteratorsDefinition;
export type KeysIteratorUsageCollectionModel = Proxy.KeysIteratorUsageCollection;

export type SourceDefinitionModel = Proxy.SourceDefinition;
export type ArgumentModel = Argument;

export type ImageModel = Proxy.ImageDefinition & { filter?: string | undefined };
export type ImageUsageCollectionModel = Proxy.ImageUsageCollection;
export type AggregatorModel = Proxy.AggregatorDefinition;
export type ValidatorModel = Proxy.ValidatorDefinition;
// export type AggregatorFieldModel = Proxy.AggregatorField;
export type ImageBuildModel = ImageBuildDefinition;

export type LayerDefinitionModel = Proxy.LayerDefinition;
export type LayerFieldDefinitionModel = Proxy.LayerFieldItemDefinition;

export type KeysIteratorModel = Proxy.KeysIteratorDefinition;
export type KeysIteratorRunDefinitionModel = Proxy.KeysIteratorRunDefinition;
export type WriterModel = Proxy.WriterDefinition;
export type WriterUsageCollectionModel = Proxy.WriterUsageCollection;
export type FlowModel = Proxy.FlowItemDefinition;
export type CheckResultCollectionModel = Proxy.CheckResultCollection;
export type FlowItemRunModel = FlowItemRunDefinition;
export type FlowItemImagePersisterStateModel = FlowItemImagePersisterState;


export type ImageResultModel = Proxy.ImageBuildResult;
export type ImageWatcherItemLogModel = Proxy.ImageWatcherItemLog;


export type ObjectDefinition = {
    id: string;
    name: string;
    description: string;
    tags: Array<string>;
};

export type TrashModel = {
    id: string;
    name: string;
    description: string;
    documentType: string;
    tags: Array<string>;
    document: ObjectDefinition;
};

// =================================================
// COSTANTI KIND CENSITE
export class AggregatorEngineKind {
    static DEFAULT: string = 'DEFAULT';
    static COVIP: string = 'COVIP';
}
export class WriterEngineKind {
    static CONSOLE: string = 'CONSOLE';
    static DELIMITED: string = 'DELIMITED';
    static EXCEL: string = 'EXCEL';
    static JSON: string = 'JSON';
    static FIXED: string = 'FIXED';
    static STREAM: string = 'STREAM';
    static MULTI: string = 'MULTI';
    static FILE_OPE: string = 'FILE_OPE';
}
export class DecoratorSourceType {
    static MSSQL: string = 'MSSQL';
    static WEBAPI: string = 'WEBAPI';
    static COVIP: string = 'COVIP';
    static ORACLE: string = 'ORACLE';
    static DELIMITED: string = 'DELIMITED';
    static EXCEL: string = 'EXCEL';
}
export class ValidatorEngineKind {
    static DEFAULT: string = 'DEFAULT';
}

export class KeysIteratorSourceType {
    static MSSQL: string = 'MSSQL';
    static WEBAPI: string = 'WEBAPI';
    static ORACLE: string = 'ORACLE';
    static DELIMITED: string = 'DELIMITED';
    static EXCEL: string = 'EXCEL';
}

// =================================================

// export type AvailableSourceTypes = DecoratorSourceType | KeysIteratorSourceType;

export const UNIQUE_WRITER = 'searchWriter';
export const UNIQUE_FLOW = 'searchFlow';
export const UNIQUE_KEYSITERATOR = 'searchKeysIterator';
export const UNIQUE_DECORATOR = 'searchDecorator';
export const UNIQUE_IMAGE = 'searchImage';
export const UNIQUE_AGGREGATOR = 'searchAggregator';
export const UNIQUE_VALIDATOR = 'searchValidator';


export interface ArgumentFilter {
    filter: string | null | undefined;
    filterMatchMode: Proxy.FilterMatchMode | undefined;
    tags: string[] | null;
    tagsMatchMode: Proxy.TagsMatchMode | undefined;
    pageIndex: number | null | undefined;
    pageSize: number | null | undefined;
}
export interface ArgumentListBase extends ArgumentFilter {
    uniqueId: string;
}
// nel caso un domani ci sia bisogno di aggiungere parametri ad hoc  
export interface ArgumentListDecorator extends ArgumentListBase {
}
export interface ArgumentListImage extends ArgumentListBase {
}
export interface ArgumentListValidator extends ArgumentListBase {
}
export interface ArgumentListAggregator extends ArgumentListBase {
}
export interface ArgumentListKeysIterator extends ArgumentListBase {
}
export interface ArgumentListWriter extends ArgumentListBase {
}
export interface ArgumentListFlow extends ArgumentListBase {
}
export interface ArgumentListTrash extends ArgumentListBase {
}
export interface ItemValue<T> {
    name?: string | number;
    value?: T;
    onChange?: (name: string | number, newValue: T | null) => void;
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
}


export type Field = {
    name?: string;
    description?: string;
    label?: string;
    format?: string;
    type?: string;
    quote?: string;
    when?: string;
    order?: number;
};

export type Delimited = {
    delim?: string;
    culture?: string;
    encoding?: string;
    includeheader?: boolean;
    fields?: Array<Field>;
};


export type JsonConfigField = {
    label?: string;
    name?: string;
    format?: string;
    type?: string;
    when?: string;
};
export type JsonConfig = {
    culture?: string;
    encoding?: string;
    fields?: JsonConfigField[]
};

export type ExcelConfigSheetField = {
    name?: string;
    type?: string;
    when?: string;
    description?: string;
    fieldProgPrependFormat?: string;
    column?: number;
    rowOffset?: number;
};
export type ExcelConfigSheet = {
    name?: string;
    startRow?: number;
    rowStyle?: number;
    fields?: ExcelConfigSheetField[];
};

export type ExcelConfig = {
    culture?: string;
    template?: string;
    sheets?: ExcelConfigSheet[];
};


export type FixedConfigField = {
    name?: string;
    type?: string;
    format?: string;

    description?: string;

    when?: string;
    start?: number;
    length?: number;
    virtualDec?: number;
};
export type FixedConfig = {
    culture?: string;
    encoding?: string;
    length?: number;
    fields?: FixedConfigField[];
};
export enum DefaultAggregatorFunction {
    DISTINCT,
    COUNT,
    SUM,
    MIN,
    MAX
}
export type DefaultValidatorConfigField = {
    name?: string;
    function?: DefaultAggregatorFunction;
};
export type DefaultAggregatorConfigField = {
    name?: string;
    function?: DefaultAggregatorFunction;
};
// DA TOGLIERE
export type DefaultAggregatorConfig = {
    fields?: DefaultAggregatorConfigField[];
    filter?: DefaultAggregatorFunction;
};
export type RuleConfig = {
    name?: string;
    expression?: string;
    context?: string;
    message?: string;
};
export type CovipAggregatorConfig = {
    target?: string;
};

export type ValueFieldKey = {
    text: string;
    description: string;
    value: {
        fields: OutputFieldModel[],
        args: ArgumentModel[],
        id: string | null;
    };
};

export type LodashItem = {
    key: string,
    modified?: boolean,
    value?: any,
    index?: number
};

export type ArgsType = {
    key: string,
    value: any,
    index: number,
    description: string;
};