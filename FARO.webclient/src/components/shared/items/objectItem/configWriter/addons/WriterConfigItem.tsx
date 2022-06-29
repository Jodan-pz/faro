import { Link } from 'app-support';
import * as React from 'react';
import { Segment } from 'semantic-ui-react';
import { WriterDefinition } from 'src/actions/faro_api_proxy';
import { WriterConfigType } from './types';

export const WriterConfigItem = ({ definition, itemConfig, currentWriterArgs }: { definition?: WriterDefinition, itemConfig?: WriterConfigType, currentWriterArgs?: any[] }) => {
    return definition ? (
        <Segment>
            <h3><Link target="_blank" to={`/writers/${definition.id}/edit`}>{definition.name}</Link></h3>
            {definition.args?.map(a => (
                a.name ?
                    <p key={a.name}>
                        <strong> {a.name}</strong> {a.description}
                        {itemConfig?.args && a.name in itemConfig.args
                            ?
                            <span> {'=> '} {itemConfig.args[a.name]}</span>
                            : currentWriterArgs && currentWriterArgs.indexOf(a.name) !== -1 &&
                            <span> {'=> '} {a.name}</span>
                        }
                    </p>
                    : null
            ))
            }
        </Segment>
    ) : null;
};