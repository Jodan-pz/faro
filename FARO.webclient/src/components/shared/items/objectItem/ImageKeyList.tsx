import { ItemValue, KeysIteratorModel, ImageKeysIteratorsDefinitionModel, ValueFieldKey } from '../../../../actions/model';
import * as React from 'react';
import { ImageKeyItem } from './ImageKeyItem';
import { Segment } from 'semantic-ui-react';
import { ArrayContainer } from '../ArrayContainer';
import { alternateStyle, alternateStyle2 } from 'src/components/lib/UtilLib';

interface ImageKeyListProps extends ItemValue<ImageKeysIteratorsDefinitionModel[]> {
    searchKeys?: Array<KeysIteratorModel>;
}

export class ImageKeyList extends React.Component<ImageKeyListProps, {}> {

    constructor(props: any) {
        super(props);
    }
 
    render() {
        const { disabled, searchKeys } = this.props;

        let dropValues: Array<ValueFieldKey> = [];
        if (searchKeys && searchKeys.length > 0) {
            dropValues.push({
                text: '',
                description: '',
                value: { fields: [], id: null, args: [] }
            });

            searchKeys.forEach((val: KeysIteratorModel) => {
                if (val.name && val.name.length > 0) {
                    dropValues.push({
                        text: val.name,
                        description: val.description || '',
                        value: {
                            fields: val.fields ? val.fields : [],
                            args: val.args ? val.args : [],
                            id: val.id ? val.id : null
                        }
                    });
                }
            });
        }

        return (
            <Segment>
                <ArrayContainer value={this.props.value} showRowNumber defaultValue={{}} showAdd showDelete disabled={disabled} name="keys" onChange={this.props.onChange}>
                    <ImageKeyItem dropValueKeys={dropValues} />
                </ArrayContainer>
            </Segment>);
    }
}
