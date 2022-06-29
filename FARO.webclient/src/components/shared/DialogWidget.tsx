import * as React from 'react';
import { Modal, Button, Icon, Input, Header } from 'semantic-ui-react';
import { eventPrevent } from '../Utils';

export interface DialogWidgetProps {
    show?: boolean;
    title?: string | JSX.Element;
    children?: string | JSX.Element | undefined;
    cancelButton?: string;
    confirmButton?: string;
    onCancel?: () => void;
    onConfirm?: () => void;
    style?: any;
    dimmer?: 'blurring' | 'inverted';
    size?: 'fullscreen' | 'large' | 'mini' | 'small' | 'tiny';
    scrolling?: boolean;
    
}

export const SpotlightWidget = (props: DialogWidgetProps & { value?: any, icon?: string }) => {
    const triggerButton = <Button basic icon={props.icon || 'search'} size="mini" />;

    if (React.isValidElement(props.value)) {
        return (
            <React.Fragment>
                {props.value}
                <DialogWidget {...props} trigger={triggerButton} />
            </React.Fragment>
        );
    }

    return <Input size="mini" fluid style={{ opacity: 1 }} type="text" value={props.value || ''} disabled action={props.children && <DialogWidget {...props} trigger={triggerButton} onConfirm={undefined} />} />;
};
  
export const ConfirmWidget = (props: { trigger: JSX.Element, children: any, onConfirm: () => void, onCancel?: () => void }) => {
    const defaultProps: DialogWidgetProps & { trigger: JSX.Element } = {
        confirmButton: 'yes',
        cancelButton: 'no',
        dimmer: 'inverted',
        size: 'small',
        title: <React.Fragment><Icon name="question circle outline" />{props.children}</React.Fragment>,
        trigger: props.trigger,
        onConfirm: props.onConfirm,
        onCancel: props.onCancel
    };
    return <DialogWidget {...defaultProps} />;
};

export class DialogWidget extends React.Component<DialogWidgetProps & { trigger: JSX.Element }, { open: boolean }> {
    state = { open: this.props.show || false };
    private customTrigger: React.FunctionComponentElement<any>;
    show = () => {
        this.setState({ open: true });
    }

    getSnapshotBeforeUpdate(prevProps: any, prevState: any): any {
        let propshow: boolean | undefined = this.props && this.props.show !== undefined ? this.props.show : undefined;
        if (propshow !== undefined &&  propshow !== prevState.show) {
            return propshow;
        }
        return null;
    }
    componentDidUpdate(prevProps: any, prevState: any, snapshot: any): void {
        if (snapshot !== null) {
            this.setState({ open: snapshot });
        }
    }
    handleConfirm = () => {
        this.setState({ open: false }, () => {
            if (this.props.onConfirm) {
                this.props.onConfirm();
            }
        });
    }
    handleCancel = () => {
        this.setState({ open: false }, () => {
            if (this.props.onCancel) {
                this.props.onCancel();
            }
        });
    }
    render() {
        const { title, trigger, children, onConfirm, cancelButton, confirmButton, style, size, dimmer = 'inverted', scrolling = true } = this.props;
        const { open } = this.state;
        let customTrigger = trigger && React.cloneElement(trigger, { onClick: eventPrevent(this.show) });

        return (
            <Modal  closeIcon={onConfirm === undefined} trigger={customTrigger} open={open} onClose={eventPrevent(this.handleCancel)} dimmer={dimmer} style={style} size={size} closeOnDimmerClick={false}>
                {title && <Header>{title}</Header>}
                {children && <Modal.Content scrolling={scrolling}>{children}</Modal.Content>} 
                {onConfirm &&
                    <Modal.Actions>
                        <Button onClick={eventPrevent(this.handleConfirm)} size="mini" color="blue"> 
                            <Icon name="checkmark" /> {confirmButton || 'YES'}
                        </Button>
                        <Button onClick={eventPrevent(this.handleCancel)} size="mini" color="red" >
                            <Icon name="remove" /> {cancelButton || 'NO'}
                        </Button>
                    </Modal.Actions>
                }
            </Modal>
        );
    }
}