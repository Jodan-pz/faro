import * as React from 'react';
import { ItemValue } from '../../../../../actions/model';
import { EXPRTAG } from '../../../../../components/Utils';
import { ValidatorExpressionEditor } from '../../../../../components/shared/ValidatorExpressionEditor';
interface ViewExprProps extends ItemValue<string> {
    fields?: Array<string>;
}
const NEWLINES: Array<string> = ['\n', '\r', '\n\r', '\r\n'];
export class ViewExpr extends React.Component<ViewExprProps, {}> {
    changeValue = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            this.props.onChange(this.props.name || '', EXPRTAG + newValue);
        }
    }
    render() {
        const { value } = this.props;
        let val: string = (value as string).split(EXPRTAG)[1];
        return (
            <ValidatorExpressionEditor
                style={{ width: '100%' }}
                disabled={this.props.disabled}
                name={'viewExpr'}
                onChange={this.changeValue}
                value={val}
                fields={this.props.fields}
            />
        );
    }
}