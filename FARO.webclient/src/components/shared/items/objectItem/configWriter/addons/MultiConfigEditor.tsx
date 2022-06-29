import * as React from 'react';
import { WriterDefinition } from 'src/actions/faro_api_proxy';
import { withResult, writer } from 'src/actions/proxy';
import { MultiConfigType } from './types';
import { WriterConfigItem } from './WriterConfigItem';

export const MultiConfigEditor = ({ value, definition }: { value: MultiConfigType, definition: WriterDefinition }) => {
    const [all, setAll] = React.useState<WriterDefinition[] | undefined>();
    const { streamzip = false, writers = undefined } = value || {};

    React.useEffect(() => {
        let loaded = true;
        const getData = async () => {
            let toSet: WriterDefinition[] = [];
            if (writers) {
                for (const w of writers) {
                    const wriDef = await withResult(writer.getById(w.id));
                    if (wriDef)
                        toSet.push(wriDef);
                }
            }
            setAll(toSet);
        };
        if (loaded && writers) getData();
        return () => { loaded = false; };
    }, [writers]);

    const currentWriterArgs = definition?.args?.map(a => a.name);

    return writers
        ? (
            <div>
                {streamzip ? <h4>Content is compressed</h4> : null}
                {writers.map(a =>
                    <WriterConfigItem key={a.id} definition={all?.find(i => i.id === a.id)} itemConfig={a} currentWriterArgs={currentWriterArgs} />
                )}
            </div>
        )
        : null;
};