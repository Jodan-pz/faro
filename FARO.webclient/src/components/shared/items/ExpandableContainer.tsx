import { ItemValue } from '../../../actions/model';
import * as React from 'react';
import { Button, Modal } from 'semantic-ui-react';

interface ExpandableContainerProps extends ItemValue<any> {
    placeholder?: string;
    /** The HTML input type. */
    type?: string;
    fireChangeOnBlur?: boolean;
}
interface ExpandableContainerState {
    open: boolean;
}

export class ExpandableContainer extends React.Component<ExpandableContainerProps, ExpandableContainerState> {
    state = { open: false };
    margin: string = '3px';

    listenerItemChange = (name: string | number, value: any) => {
        if (this.props.onChange) {
            this.props.onChange(name, value);
        }
    }

    getElements = (): Array<any> => {
        const { children } = this.props;
        let itemChildren: any[] = React.Children.toArray(children);
        if (itemChildren.length >= 2) return [itemChildren[0], itemChildren[1]];
        return [itemChildren[0]];
    }
    getProps = (): ItemValue<any> => {
        const { value, disabled, name } = this.props;
        return {
            disabled: disabled,
            name: name,
            onChange: (name: string | number, newValue: any) => this.listenerItemChange(name, newValue),
            value: value
        };
    }
    closeComp = () => {
        const { style, className, disabled } = this.props;
        let itemChildren: any[] = this.getElements();
        if (itemChildren.length === 0) return null;
        let element: any = itemChildren[0];
        let props: ItemValue<any> = this.getProps();
        let cloneElement: any = React.cloneElement(element, props);

        let cssSegment: React.CSSProperties = {
            width: '100%',
            margin: this.margin,
            padding: '0px',
            display: 'flex',
            ...style
        };
        return (
            <div className={className} style={cssSegment}>
                <Button
                    style={{ marginTop: 'auto', marginBottom: 'auto' }}
                    size="tiny"
                    color={'grey'}
                    icon="expand arrows alternate"
                    onClick={() => {
                        if (!disabled) this.setState({ ...this.state, open: true });
                    }}
                />
                <div style={{ marginRight: this.margin, width: '100%' }}>{cloneElement}</div>
            </div>
        );
    }
    openComp = () => {
        const { disabled } = this.props;
        let itemChildren: any[] = this.getElements();
        if (itemChildren.length === 0) return null;
        let element: any = itemChildren.length > 1 ? itemChildren[1] : itemChildren[0];
        let props: ItemValue<any> = this.getProps();
        let cloneElement: any = React.cloneElement(element, props);
        return (
            <Modal
                closeIcon
                open={true}
                onClose={() => {
                    if (!disabled) this.setState({ ...this.state, open: false });
                }}
                closeOnDimmerClick={false}
            >
                <Modal.Content scrolling={true}>
                    <div style={{ marginRight: this.margin, width: '100%' }}>
                        {cloneElement}
                    </div>
                </Modal.Content>
            </Modal>);
    }

    render() {

        const { open } = this.state;
        if (open) return this.openComp();
        return this.closeComp();
    }
}