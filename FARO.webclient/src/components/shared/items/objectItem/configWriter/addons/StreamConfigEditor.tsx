import { WriterDefinition } from 'mglib-faro.webclient/MGLib_FARO.WEBAPI';
import * as React from 'react';
import { Grid } from 'semantic-ui-react';
import { StreamConfigType } from './types';
import { WriterConfigFullPreview } from './WriterConfigFullPreview';

export const StreamConfigEditor = ({ value, definition }: { value: StreamConfigType, definition: WriterDefinition }) => {
    return (
        <div style={{ width: '100%' }}>
            <Grid divided columns={1} >
                <Grid.Row>
                    <Grid.Column>
                        <WriterConfigFullPreview definition={definition} />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </div>
    );
};

