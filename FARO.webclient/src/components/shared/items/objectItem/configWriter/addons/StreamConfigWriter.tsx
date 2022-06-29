import * as React from 'react';
import { Button } from 'semantic-ui-react';
import { JsonEditorWidget } from 'src/components/shared/JsonEditorWidget';
import { ConfigWriterProps } from '../ConfigWriterProps';
import { StreamConfigEditor } from './StreamConfigEditor';

export const StreamConfigWriter = ({ name: propName, value, disabled, onChange, definition }: ConfigWriterProps) => {
    const [json, setJsonEditor] = React.useState<boolean>(value === undefined);

    return (
        <div style={{ width: '100%', display: 'flex', margin: '0px' }}>
            <Button active={json} onClick={() => setJsonEditor(!json)}>{json ? 'Viewer' : 'Json'}</Button>
            {json ?
                <JsonEditorWidget
                    name={propName as string}
                    item={value && value.value || {}}
                    disabled={disabled}
                    onChange={onChange}
                />
                : <StreamConfigEditor value={value?.value} definition={definition} />
            }
        </div>
    );
};