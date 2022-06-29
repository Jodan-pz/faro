import { ItemValue } from '../../../actions/model';
import * as React from 'react';
import { TextArea, TextAreaProps } from 'semantic-ui-react';
interface ExpandableContainerProps extends ItemValue<any> {
}
export class TextAreaItem extends React.Component<ExpandableContainerProps, {}> {

    shouldComponentUpdate(nextProps: ExpandableContainerProps, nextState: {}): boolean {
        const { value, disabled } = this.props;
        if (
            value !== nextProps.value
            || disabled !== nextProps.disabled
        ) return true;
        return false;
    }
    
    render() {
        const { value } = this.props;
        return (
            <TextArea
                autoHeight
                ref={r => r && r.focus && r.focus()}
                style={{ width: '100%' }}
                value={value}
                onChange={(event: React.FormEvent<HTMLTextAreaElement>, data: TextAreaProps) => {
                    if (this.props.onChange) {
                        this.props.onChange(this.props.name || '', data.value);
                    }
                }}
            />
        );
    }
}