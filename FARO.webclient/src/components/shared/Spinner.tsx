import { Dimmer, Header, Icon, Loader, Segment } from 'semantic-ui-react';
import * as React from 'react';

export const Spinner = (props: { loading: boolean, message?: string }) => {
    return props.loading ? (
        <Dimmer active page>
            <Segment inverted raised>
                <Icon loading name="spinner" size="big"/>
                <span style={{fontSize: '16px', marginLeft: '6px'}}>{props.message || 'loading'}</span>
            </Segment>
        </Dimmer>
    ) : null;
};