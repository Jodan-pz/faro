import * as React from 'react';
import { Menu, Form, Segment, Input, TextArea } from 'semantic-ui-react';
import { HeaderMenuWidget } from '../shared/MenuWidget';
import { SourceDefinitionModel } from '../../actions/model';

interface DecoratorSourceProps {
    item?: SourceDefinitionModel;
    disabled?: boolean;
    onChange?: (items: SourceDefinitionModel) => void;
}

interface DecoratorSourceState {
    value: string;
}

export class DecoratorSource extends React.Component<DecoratorSourceProps, DecoratorSourceState> {
    constructor(props: DecoratorSourceProps) {
        super(props);
        this.state = { value: JSON.stringify(props.item) };
    }
    componentWillReceiveProps(next: DecoratorSourceProps): void {
        this.setState({ value: JSON.stringify(next.item) });
    }
    handleValueChange = (value: string) => {
        this.setState({ value });
    }
    handleChange = () => {
        if (this.props.onChange) this.props.onChange(JSON.parse(this.state.value));
    }

    render() {
        const { value } = this.state;
 
        return value && (
            <div>
                <HeaderMenuWidget size="mini" >
                    <Menu.Item content="Accept" icon="check" onClick={this.handleChange} />
                </HeaderMenuWidget>
                <Segment basic attached="bottom" style={{ padding: 0 }}>
                    <TextArea value={value} onChange={(e: any, d: any) => this.handleValueChange(d.value)} style={{ width: '100%', height: '100%' }} />
                </Segment>
            </div>);
    }
}