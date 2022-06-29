import * as React from 'react';
import { useState } from 'react';
import { Button } from 'semantic-ui-react';
import { JsonEditorWidget } from 'src/components/shared/JsonEditorWidget';
import { ConfigWriterProps } from '../ConfigWriterProps';

// export const FileOperationConfigWriterConfig = vceConfiguration(b => [
//     b.text('input'),
//     b.text('output'),
//     b.select('operation', { items: ['copy', 'move'] }),
//     // b.text('operation'),
//     b.text('switches')
// ])

export const FileOperationConfigWriter = ({ name: propName, value, disabled, onChange, definition }: ConfigWriterProps) => {
    const [json, setJsonEditor] = useState<boolean>(value === undefined);

    const onVceChange = (newData: any) => {
        onChange && propName && onChange(propName, newData)
    }

    return (
        <div style={{ width: '100%', display: 'flex', margin: '0px' }}>
            <Button active={json} onClick={() => setJsonEditor(!json)}>{json ? 'Viewer' : 'Json'}</Button>
            {/* {json ? */}
            <JsonEditorWidget
                name={propName as string}
                item={value && value.value || {}}
                disabled={disabled}
                onChange={onChange}
            />
            {/* //     : <Vce
            //         hideBreadCrumb
            //         data={value?.value || {}}
            //         configuration={FileOperationConfigWriterConfig}
            //         onChange={onVceChange}
            //     />
            // } */}
        </div>
    );
};