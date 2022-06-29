import * as React from 'react';
import { Button, Grid } from 'semantic-ui-react';
import { JsonEditorWidget } from 'src/components/shared/JsonEditorWidget';
import { ConfigWriterProps } from '../ConfigWriterProps';
import { MultiConfigEditor } from './MultiConfigEditor';
import { withResult, writer } from 'src/actions/proxy';

// export const MultiConfigWriterConfig = vceConfiguration(b => [
//     b.boolean('streamzip', { label: 'Zip' }),

//     b.array(() =>

//         b.object('writers', () => [
//             b.remoteSelect('id', {
//                 searchData: (text) => withResult(writer.list(text, undefined, undefined, undefined, undefined, undefined)).then(r => r?.map(v => ({ label: v.name, value: v.id })) as any),
//                 getValueDescription: (v) => v.name,
//                 inline: true
//             }),
//             b.json('args')
//         ])
//     )
// ])

export const MultiConfigWriter = ({ name: propName, value, disabled, onChange, definition }: ConfigWriterProps) => {
    const [json, setJsonEditor] = React.useState<boolean>(value === undefined);

    const onVceChange = (newData: any) => {
        onChange && propName && onChange(propName, newData)
    }

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
                : <MultiConfigEditor value={value?.value} definition={definition} />

                // <Grid>
                //     <Grid.Row>
                //         <Grid.Column>
                //             <Vce
                //                 hideBreadCrumb
                //                 data={value?.value || {}}
                //                 configuration={MultiConfigWriterConfig}
                //                 onChange={onVceChange}
                //             /></Grid.Column>
                //         <Grid.Column>
                //             <MultiConfigEditor value={value?.value} definition={definition} />
                //         </Grid.Column> 
                //     </Grid.Row>
                // </Grid>
            }
        </div>
    );
};