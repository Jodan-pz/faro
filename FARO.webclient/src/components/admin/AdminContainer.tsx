import * as React from 'react';
import * as reducers from '../../reducers';
import { appConnector, Link } from 'app-support';
import { deleteRedisCache } from '../../actions';
import { Segment, Button } from 'semantic-ui-react';
import { ConfirmWidget } from '../shared/DialogWidget';

const conn = appConnector<{}>()(
    (s, p) => ({

    }),
    {
        deleteRedisCache
    }
);
class AdminContainer extends conn.StatefulCompo<{}> {
 

    render() {

        return (
            <Segment>
                <ConfirmWidget
                    children={`Are you sure you want clean the redis cache?`}
                    onConfirm={() => this.props.deleteRedisCache()}
                    trigger={<Button content="Clean redis cache" icon="delete" basic color="red" />}
                />

            </Segment>);
    }

}

export default conn.connect(AdminContainer); 