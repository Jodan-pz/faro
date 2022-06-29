import { appConnector } from 'app-support';
import * as reducers from '../reducers';
import * as React from 'react';
import { Button, Icon, Modal, Label, Message, Accordion, SemanticICONS, Progress } from 'semantic-ui-react';
import { cleanMessage, displayedMessage, cleanAllMessages, cleanPermanentMessages, changeStateViewer } from '../actions/indexMsg';
import { StateViewers, MessageObject, MessageAction, TypeMessage } from '../actions/modelMsg';
import { Move, Easing } from './shared/Move';
import './managerMessage.css';

type HPosition = 'left' | 'right' | number;

type FPos = {
    horizontal: HPosition;
    vertical: number;
};

export type FlyngPosition = 'left' | 'right' | FPos;

export enum TypeView {
    Modal,
    Stack,
    Flying
}

export interface TypeViewMessage {
    deleteMessage?: (message: MessageObject, performHideActions: boolean) => void;
    messages?: MessageObject[];
    typeView?: TypeView;
}

/////////////////////////////////////////////////////////
type PropMessage = {
    icon: string;
    color: string;
    backgroundColor: string;
};

type PropMessageStyle = {
    title: React.CSSProperties,
    style: React.CSSProperties,
    icon: string;
};

const getPropsMessage = (type: TypeMessage) => {
    switch (type) {
        case TypeMessage.Info:
            return {
                icon: 'info circle',
                backgroundColor: '#f8ffff',
                color: '#276f86'
            };
        case TypeMessage.Warning:
            return {
                icon: 'warning sign',
                backgroundColor: '#fffaf3',
                color: '#573a08'
            };
        default:
    }
    return {
        icon: 'alarm',
        backgroundColor: '#fff6f6',
        color: '#9f3a38'
    } as PropMessage;
};

const getStyle = (type: TypeMessage) => {
    let custom: PropMessage = getPropsMessage(type);
    let style: React.CSSProperties = {
        color: custom.color,
        backgroundColor: custom.backgroundColor
    };
    let titleStyle: React.CSSProperties = {
        ...style,
        width: '97%'
    };
    return {
        style: style,
        title: titleStyle,
        icon: custom.icon
    } as PropMessageStyle;
};

class DefaultFlyingMessage extends React.Component<{ message: MessageObject }, {}> {
    render() {
        const { message } = this.props;
        let prop: PropMessageStyle = getStyle(message.typeMessage);
        return <Message style={prop.style} icon={prop.icon} header={message.title ? message.title : ''} content={message.message} />;
    }
}
/////////////////////////////////////////////////////////
class DefaultModalMessage extends React.Component<{ message: MessageObject }, {}> {
    render() {
        const { message } = this.props;
        let pstyle: PropMessageStyle = getStyle(message.typeMessage);

        return <Message header={message.title === undefined ? '' : message.title} content={<pre>{message.message}</pre>} icon={pstyle.icon} style={{ ...pstyle.style, overflow: 'auto' }} />;
    }
}
/////////////////////////////////////////////////////////
class DefaultStackMessage extends React.Component<{ messages: MessageObject[] }, {}> {
    render() {
        const { messages } = this.props;
        let panels: Array<any> = messages.map((message: MessageObject, index: number) => {
            let pstyle: PropMessageStyle = getStyle(message.typeMessage);
            return {
                key: index,
                title: {
                    key: `lab-${index}`,
                    style: { backgroundColor: pstyle.style.backgroundColor },
                    content: <Label content={message.title === undefined ? '' : message.title} style={pstyle.title} />
                },
                content: {
                    key: `mes-${index}`,
                    content: <Message content={message.message} icon={pstyle.icon} style={pstyle.style} />
                },
            };
        });
        let defaultActiveIndex: number = messages.length - 1;
        return <Accordion key="accordion-viewer" panels={panels} styled defaultActiveIndex={defaultActiveIndex} style={{ width: '100%' }} />;
    }
}
/////////////////////////////////////////////////////////
export interface ManagerMessageProps {
    deafultMessage?: { [key: string]: Array<MessageAction> };
    /**
     * Default 5000 ms.
     */
    timeoutTimed?: number;
    /**
     * Nasconde il bottone di delete all sulla modale dei messaggi di stack
     */
    hideDeleteButton?: boolean;
    /**
     * Nasconde il progress bar dei messaggi timed
     */
    hideProgressTimed?: boolean;

    templateMessage?: (view: TypeViewMessage) => React.ReactNode;

    buttonStyle?: (label: string, typeView: TypeView) => any | null;
    /**
     * Il size width dei messagi flying
     */
    flyingWidth?: number;
    flyingPosition?: FlyngPosition;
}

const conn = appConnector<ManagerMessageProps>()(
    (s) => ({
        shownList: reducers.getShownList(s),
        modalList: reducers.getModalList(s),
        flyingList: reducers.getFlyingList(s),
        stateViewers: reducers.getStateViewers(s),
        waitingViewers: reducers.getWaitingViewers(s)
    }),
    {
        cleanMessage,
        displayedMessage,
        cleanAllMessages,
        cleanPermanentMessages,
        changeStateViewer
    }
);
class ManagerMessageCompo extends conn.StatefulCompo<{}> {
    private isOpen: boolean = false;
    private timed: { [id: string]: any } = {};
    constructor(props: any) {
        super(props);
    }

    public shouldComponentUpdate(): boolean {
        const { stateViewers } = this.props;
        if (stateViewers === StateViewers.Close) {
            this.isOpen = false;
        }
        return !this.isOpen;
    }
    private createMessage(view: TypeViewMessage): any {
        const { templateMessage } = this.props;
        let messageView: any = null;
        let messages: Array<MessageObject> = view.messages && view.messages.length > 0 ? view.messages : [];
        if (templateMessage && messages.length > 0) {
            messageView = templateMessage(view);
        }
        if (messageView === null) {
            let children: any[] = React.Children.toArray(this.props.children);
            if (children.length === 0) {
                if (view.typeView === TypeView.Modal) messageView = <DefaultModalMessage message={messages[0]} />;
                else if (view.typeView === TypeView.Flying) messageView = <DefaultFlyingMessage message={messages[0]} />;
                else if (view.typeView === TypeView.Stack) messageView = <DefaultStackMessage messages={messages} />;
            } else {
                messageView = children.map((child: any, index: number) => {
                    return React.cloneElement(child as any, { key: 'comp-' + index, messages: view.messages, typeView: view.typeView, deleteMessage: view.deleteMessage });
                });
            }
        }

        return messageView === null ? '' : messageView;
    }


    private deleteMessage(mes: MessageObject, performHideActions: boolean): void {
        console.log('DELETE ', mes.id);
        this.buttonAction(mes, 'CLOSE', performHideActions);
    }

    private getButtonComp(message: MessageObject, buttons: any[], typeView: TypeView): any {
        let comp: any = '';
        let timed: boolean = message.timed === undefined ? true : message.timed;
        if (buttons.length === 0 && timed) {
            const { timeoutTimed, hideProgressTimed } = this.props;
            let hideProgr: boolean = !!hideProgressTimed;
            let time: number = timeoutTimed !== undefined ? timeoutTimed : 5000;

            if (!hideProgr) {
                comp = (
                    <Move key={'move-' + message.id} anim element={(prev: any, curr: any) => { return (<Progress style={{ width: '100%', margin: '0px' }} indicating key={'progress-' + message.id} percent={Math.floor(curr)} size="tiny" />); }} from={100} to={0} easing={Easing.linear} time={time} onEndMove={() => { this.buttonAction(message, 'TIMEOUT'); }} />);
            } else {
                setTimeout((btnAction: any, message: MessageObject) => {
                    btnAction(message, 'TIMEOUT');
                }, time, this.buttonAction.bind(this), message);
            }
        } else if (buttons.length > 0) {
            let clz: string = typeView === TypeView.Flying ? 'flyBar' : '';
            comp = <div className={clz} style={{ display: 'flex', width: '100%' }}><div style={{ width: '1px', marginRight: 'auto' }} />{buttons}</div>;
        }
        return comp;
    }
    private addDefaultActions(message: MessageObject): MessageObject {
        const { deafultMessage } = this.props;
        if (deafultMessage) {
            if (message.actions === undefined) message.actions = [];
            if (deafultMessage[message.id] !== undefined) {
                message.actions = message.actions.concat(deafultMessage[message.id]);
            }
        }
        return message;
    }
    private createFlyingList(): any {
        const { flyingList, flyingWidth, flyingPosition } = this.props;
        if (flyingList.length === 0) return null;
        let tempWidth: number = flyingWidth !== undefined ? flyingWidth : 300;
        let width: string = (tempWidth - 5) + 'px';
        let list: any = flyingList.map((mes: MessageObject, index: number) => {
            mes = this.addDefaultActions(mes);
            let message: any = this.createMessage({ messages: [mes], typeView: TypeView.Flying, deleteMessage: (mes: MessageObject, performHideActions: boolean) => this.deleteMessage(mes, performHideActions) });
            let buttons: any[] = this.createButtons(mes, TypeView.Flying);

            let timed: boolean = mes.timed === undefined ? true : mes.timed;
            let close: any = null;

            let comp: any = this.getButtonComp(mes, buttons, TypeView.Flying);

            if (buttons.length === 0 && !timed) {
                close = <Icon key={'close-' + index} name="close" color="red" link onClick={(ev: any) => this.buttonAction(mes, 'CLOSE')} />;
            }

            return (
                <div key={'flying-' + index} className="flyContainer" style={{ width: width, position: 'relative' }}>
                    {close !== null && <div style={{ position: 'absolute', top: '0px', right: '0px', zIndex: 100 }}>{close}</div>}
                    <div>{message}</div>
                    {comp}
                </div>);
        });
        let left: string = '0px';
        let top: string = '0px';

        if (flyingPosition) {
            if (typeof (flyingPosition) === 'string') {
                if (flyingPosition === 'right') {
                    left = 'CALC(100% - ' + width + ')';
                }
            } else {
                if (typeof (flyingPosition.horizontal) === 'string') {
                    if (flyingPosition.horizontal === 'right') {
                        left = 'CALC(100% - ' + width + ')';
                    }
                } else {
                    left = flyingPosition.horizontal + 'px';
                }
                top = flyingPosition.vertical + 'px';
            }
        }

        return <div style={{ left: left, position: 'fixed', top: top, zIndex: 1000 }}>{list}</div>;
    }

    private getLabelAction(actions: Array<MessageAction>): string[] {
        let labels: string[] = [];
        for (let i: number = 0; i < actions.length; i++) {
            let act: string | undefined = actions[i].name;
            if (act !== undefined && act.length > 0) labels.push(act);
        }
        return labels;
    }
    private nextStateViewer(): StateViewers {
        const { modalList, flyingList } = this.props;
        let _nextStateViewer: StateViewers = StateViewers.Close;
        if (modalList.length > 1) _nextStateViewer = StateViewers.ModalSingle;
        else if (flyingList.length > 0) _nextStateViewer = StateViewers.Flying;
        return _nextStateViewer;
    }
    private buttonAction(message: MessageObject, label: string, performHide: boolean = true): void {
        let actions: Array<MessageAction> | undefined = message.actions;

        let callbacks: Array<any> = new Array<any>();
        if (actions !== undefined && performHide) {
            // le azioni per questo messaggio da fare comunque
            actions.forEach(element => {
                if (element.name === undefined) {
                    callbacks.push(element.action);
                }
            });
            // l'azione scelta dall'utente
            for (let i: number = 0; i < actions.length; i++) {
                if (actions[i].name !== undefined && actions[i].name === label) {
                    callbacks.unshift(actions[i].action);
                    break;
                }
            }
        }
        let id: string = message.id;
        callbacks.forEach(callback => {
            callback(id, message.data);
        });
        this.isOpen = false;


        this.props.displayedMessage(id);
        this.props.changeStateViewer(this.nextStateViewer());
    }
    private getButtonStyle(label: string, typeView: TypeView): any {
        const { buttonStyle } = this.props;
        let props: any | null = null;
        if (buttonStyle !== undefined) {
            props = buttonStyle(label, typeView);
        }
        if (props === null) {
            props = { basic: true, compact: true };
        }
        return props;
    }
    private createButtons(message: MessageObject, typeView: TypeView): Array<any> {
        let buttons: Array<any> = [];
        let actions: Array<MessageAction> = message.actions ? message.actions : [];
        let labels: string[] = this.getLabelAction(actions);

        if (typeView !== TypeView.Flying) {
            let timed: boolean = message.timed === undefined ? true : message.timed;
            if (labels.length === 0 && !timed) {
                labels = ['CLOSE'];
            }
        }

        buttons = labels.map((lab: string, index: number) => {
            let prop: any = this.getButtonStyle(lab, typeView);
            return <Button key={'btn-' + index} {...prop} onClick={(ev: any) => this.buttonAction(message, lab)}>{lab}</Button>;
        });
        return buttons;
    }
    private cleanModal(): void {
        this.isOpen = false;
        this.props.cleanPermanentMessages();
        this.props.changeStateViewer(this.nextStateViewer());
    }
    private closeModal(): void {
        this.isOpen = false;
        this.props.changeStateViewer(this.nextStateViewer());
    }
    private createStackButtons(): any {
        const { hideDeleteButton } = this.props;
        let hideDelete: boolean = !!hideDeleteButton;
        let propClean: any = this.getButtonStyle('DELETE ALL', TypeView.Stack);
        let propClose: any = this.getButtonStyle('CLOSE', TypeView.Stack);
        let btns: Array<any> = [];
        if (!hideDelete) {
            btns.push((
                <Button key="CLEAN-MODAL" {...propClean} onClick={(ev: any) => this.cleanModal()}>DELETE ALL</Button>));
        }
        btns.push(
            <Button key="CLOSE-MODAL" {...propClose} onClick={(ev: any) => this.closeModal()}>CLOSE</Button>);
        return btns;
    }
    render() {
        const { stateViewers } = this.props;
        if (stateViewers === StateViewers.Close) return null;
        if (stateViewers === StateViewers.ModalSingle || stateViewers === StateViewers.Modal) {
            let messageComponent: any = '';
            let comp: any = '';
            if (stateViewers === StateViewers.ModalSingle) {
                const { modalList } = this.props;
                if (modalList.length > 0) {
                    this.isOpen = true;
                    let message: MessageObject = this.addDefaultActions(modalList[0]);
                    messageComponent = this.createMessage({ messages: [message], typeView: TypeView.Modal, deleteMessage: (mes: MessageObject, performHideActions: boolean) => this.deleteMessage(mes, performHideActions) });
                    let buttons: Array<any> = this.createButtons(message, TypeView.Modal);
                    comp = this.getButtonComp(message, buttons, TypeView.Modal);
                }
            } else if (stateViewers === StateViewers.Modal) {
                const { shownList } = this.props;
                if (shownList.length > 0) {
                    this.isOpen = true;
                    messageComponent = this.createMessage({ messages: [...shownList], typeView: TypeView.Stack, deleteMessage: (mes: MessageObject, performHideActions: boolean) => this.deleteMessage(mes, performHideActions) });
                    comp = this.createStackButtons();
                }
            }
            return (
                <Modal size="large" open={true} closeOnDimmerClick={false}>
                    <Modal.Content >
                        {messageComponent}
                    </Modal.Content>
                    <Modal.Actions>
                        {comp}
                    </Modal.Actions>
                </Modal>);
        }

        return this.createFlyingList();
    }

}
export const ManagerMessage = conn.connect(ManagerMessageCompo);
/////////////////////////////////////////////////////////




const conn2 = appConnector<{ iconName?: SemanticICONS }>()(
    (s) => ({
        shownList: reducers.getShownList(s)
    }),
    {
        changeStateViewer
    }
);

class AlarmErrorCompo extends conn2.StatefulCompo<{}> {
    constructor(props: any) {
        super(props);
    }
    render() {
        const { shownList } = this.props;
        if (shownList.length === 0) return null;
        return (
            <Icon key={'alarmError'} name={this.props.iconName !== undefined ? this.props.iconName : 'alarm'} style={{ cursor: 'pointer', margin: '5px' }} inverted bordered circular color={'red'} onClick={() => this.props.changeStateViewer(StateViewers.Modal)} />);
    }
}
export const AlarmError = conn2.connect(AlarmErrorCompo);