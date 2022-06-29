import * as React from 'react';
import { Divider } from 'semantic-ui-react';

export const RowCount = (props: { data?: Array<any> }) => {
    return props.data && props.data.length && (
        <Divider  horizontal>{props.data.length} {props.data.length === 1 ? 'row' : 'rows'}</Divider>
    ) || null;
};