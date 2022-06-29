import { WriterDefinition } from 'mglib-faro.webclient/MGLib_FARO.WEBAPI';
import * as React from 'react';
import { Segment } from 'semantic-ui-react';
import { WriterEngineKind } from 'src/actions/model';
import { withResult, writer } from 'src/actions/proxy';
import { MultiConfigType, PreviewItem, StreamConfigType, WriterConfigType } from './types';
import { WriterConfigItem } from './WriterConfigItem';

const createBlocks = async (d: WriterDefinition, cfg?: WriterConfigType): Promise<PreviewItem[]> => {
    switch (d.kind) {
        case WriterEngineKind.STREAM:
            const streamConfig: StreamConfigType = d.config?.value;
            if (!streamConfig?.chain) return [];
            const root = await withResult(writer.getById(streamConfig.chain.root.id));
            const next = await withResult(writer.getById(streamConfig.chain.next.id));
            const rDef = root ? (await createBlocks(root, streamConfig.chain.root)) : [];
            const nDef = next ? (await createBlocks(next, streamConfig.chain.next)) : [];
            return rDef.concat(nDef);
        case WriterEngineKind.MULTI:
            const multiConfig: MultiConfigType = d.config?.value;
            let ret: PreviewItem = { item: d, config: cfg, children: [] };
            for (const w of multiConfig.writers) {
                const wri = await withResult(writer.getById(w.id));
                if (wri) {
                    const childWri = await createBlocks(wri, w);
                    ret.children!.push(...childWri);
                }
            }
            return [ret];
        default:
            return [{ item: d, config: cfg }];
    }
};

export const WriterConfigFullPreview = ({ definition }: { definition: WriterDefinition }) => {
    const [blocks, setBlocks] = React.useState<PreviewItem[]>();
    React.useEffect(() => {
        let loaded = true;
        const getData = async () => {
            const blocks = await createBlocks(definition);
            setBlocks(blocks);
        };
        if (loaded) getData();
        return () => { loaded = false; };
    }, [definition.config]);

    const currentWriterArgs = definition.args?.map(a => a.name);

    const mapBlock = React.useCallback((block: PreviewItem, children?: boolean) => {
        return (
            <Segment key={block.item.id} color={children ? 'green' : 'grey'} >
                <WriterConfigItem definition={block.item} itemConfig={block.config} currentWriterArgs={currentWriterArgs} />
                {block.children?.map(child => mapBlock(child, true))}
            </Segment>
        );
    }, []);

    return (
        <div>
            {blocks?.map(block => mapBlock(block))}
        </div>
    );
};

