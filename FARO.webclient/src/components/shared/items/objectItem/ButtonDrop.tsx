import * as React from 'react';
import { ItemValue } from 'src/actions/model';
import { Dropdown, DropdownProps, Button } from 'semantic-ui-react';
 
interface ButtonDropProps extends ItemValue<Array<{ label: string, value: any, key: any }>> {
}

export class ButtonDrop extends React.Component<ButtonDropProps, {}> {
    onChangeDrop = (val: any) => {
        if (this.props.onChange) {
            this.props.onChange(this.props.name || '', val);
        }
    }
    render() {
        const { value , disabled } = this.props;
        return (
            <Dropdown
                disabled={disabled}
                style={{ ...(this.props.style || {}) }}
                trigger={<Button content={'Move'} style={{ width: '100%' }} />}
                options={value}
                pointing={'top left'}
                icon={null}
                onChange={(event: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {
                    this.onChangeDrop(data.value);
                }}
            />
        );
    }
}

/*
<Dropdown
                style={{...(this.props.style || {})}}
                button
                className={'icon'}
                floating
                labeled
                icon={'caret square down outline'}
                options={value}

                onChange={(event: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => this.onChangeDrop(data.value)}
            />

*/