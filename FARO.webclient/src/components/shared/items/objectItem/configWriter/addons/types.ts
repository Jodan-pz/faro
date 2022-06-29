import { WriterDefinition } from 'mglib-faro.webclient/MGLib_FARO.WEBAPI';

export type WriterConfigType = {
    id: string,
    args: { [key: string]: string }
};

export type StreamConfigType = {
    chain: {
        root: WriterConfigType,
        next: WriterConfigType
    }
};

export type MultiConfigType = {
    writers: WriterConfigType[],
    streamzip: boolean
};

export type PreviewItem = {
    item: WriterDefinition,
    config?: WriterConfigType,
    children?: PreviewItem[]
};
