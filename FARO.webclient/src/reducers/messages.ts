import { onError } from 'app-support';
import { cleanMessage, addMessage, cleanAllMessages, displayedMessage, changeStateViewer, cleanPermanentMessages } from '../actions/indexMsg';
import { MessageObject, TypeMessage, StateViewers, MessageAction } from '../actions/modelMsg';
import { UID } from './utils';

enum Filter {
    All,
    Shown,
    NotYetSeen
}

type ReduxMessage = {
    message: MessageObject;
    shown: boolean;
    index: number;
};

type Messages = { [key: string]: ReduxMessage };

export interface MessagesState {
    // contiene tutti i messaggi creati per visualizzazione modale
    modalMessages: Messages;
    flyingMessages: Messages;
    stateViewer: StateViewers;
    waitingViewer: StateViewers;
}

const defaultState: MessagesState = {
    modalMessages: {},
    flyingMessages: {},
    stateViewer: StateViewers.Close,
    waitingViewer: StateViewers.Close
};


export default (state: MessagesState = defaultState, action: any): MessagesState => {
    if (onError.matchAction(action)) {
        let message: MessageObject = readMessageError(action.payload);
        if (message.message === 'TypeError: Failed to fetch') message.stackable = false;
        // mettere qui la logica per modellare un tipo di messaggio diverso
        let nwstate: MessagesState | null = addInternalMessage(state, message);
        if (nwstate) {
            return nwstate;
        }
    } else if (displayedMessage.matchAction(action)) {
        let key: string = action.payload;
        if (key && key.length > 0) {
            let messages: Messages | null = null;
            if (state.modalMessages[key] !== undefined) messages = { ...state.modalMessages };
            if (messages === null && state.flyingMessages[key] !== undefined) messages = { ...state.flyingMessages };
            if (messages !== null) {
                if (!messages[key].shown) {
                    messages[key].shown = true;
                    let modal: boolean = !!messages[key].message.modal;
                    let permanent: boolean = !!messages[key].message.stackable;
                    if (!permanent) {
                        delete messages[key];
                    }
                    if (modal) return { ...state, modalMessages: { ...messages } };
                    return { ...state, flyingMessages: { ...messages } };
                }
            }
        }
    } else if (cleanMessage.matchAction(action)) {
        let key: string = action.payload;
        if (key && key.length > 0) {
            let messages: Messages | null = null;
            if (state.modalMessages[key] !== undefined) messages = { ...state.modalMessages };
            if (messages === null && state.flyingMessages[key] !== undefined) messages = { ...state.flyingMessages };
            if (messages !== null) {
                let modal: boolean = !!messages[key].message.modal;
                delete messages[key];
                if (modal) return { ...state, modalMessages: { ...messages } };
                return { ...state, flyingMessages: { ...messages } };
            }
        }
    } else if (cleanAllMessages.matchAction(action)) {
        return { ...state, modalMessages: {}, flyingMessages: {}, stateViewer: StateViewers.Close, waitingViewer: StateViewers.Close };
    } else if (cleanPermanentMessages.matchAction(action)) {
        let flyingMessages: Messages = { ...state.flyingMessages };
        let modalMessages: Messages = { ...state.modalMessages };
        for (const key in flyingMessages) {
            if (flyingMessages.hasOwnProperty(key)) {
                const element = flyingMessages[key];
                if (element.shown && !!element.message.stackable) {
                    delete flyingMessages[element.message.id];
                }
            }
        }
        for (const key in modalMessages) {
            if (modalMessages.hasOwnProperty(key)) {
                const element = modalMessages[key];
                if (element.shown && !!element.message.stackable) {
                    delete modalMessages[element.message.id];
                }
            }
        }
        return { ...state, modalMessages: modalMessages, flyingMessages: flyingMessages };
    } else if (addMessage.matchAction(action)) {
        let message: MessageObject = action.payload;
        let nwstate: MessagesState | null = addInternalMessage(state, message);
        if (nwstate) {
            return nwstate;
        }
    } else if (changeStateViewer.matchAction(action)) {
        let reqStateViewer: StateViewers = action.payload;
        return { ...state, stateViewer: reqStateViewer };
    }
    return state;
};

// =================================================================
// =================================================================
// =================================================================

export const selectFlyingMessage = (s: MessagesState, id: string) => {
    let messages: Messages = s.flyingMessages;
    return messages[id].message;
};
export const selectModalMessage = (s: MessagesState, id: string) => {
    let messages: Messages = s.modalMessages;
    return messages[id].message;
};

// lista oridinata per arrivo di tutti i messagi già visti e permanenti
export const getShownList = (s: MessagesState) => {
    let modalmessages: Messages = s.modalMessages;
    let flyingmessages: Messages = s.flyingMessages;
    let modalList: Array<ReduxMessage> = getInternalListMessages(modalmessages, Filter.Shown);
    let flyingList: Array<ReduxMessage> = getInternalListMessages(flyingmessages, Filter.Shown);
    let list: Array<ReduxMessage> = modalList.concat(flyingList);
    return sortAndExtract(list);
};

export const getModalList = (s: MessagesState) => {
    let modalList: Array<ReduxMessage> = getInternalListMessages(s.modalMessages, Filter.NotYetSeen);
    return sortAndExtract(modalList);
};
export const getFlyingList = (s: MessagesState) => {
    let flyingList: Array<ReduxMessage> = getInternalListMessages(s.flyingMessages, Filter.NotYetSeen);
    return sortAndExtract(flyingList);
};

export const getStateViewers = (s: MessagesState) => s.stateViewer;
export const getWaitingViewers = (s: MessagesState) => s.waitingViewer;

const Index: { index: number } = { index: 0 };

const sortAndExtract = (list: Array<ReduxMessage>) => {
    list = list.sort((a: ReduxMessage, b: ReduxMessage) => {
        return a.index - b.index;
    });
    return list.map((element: ReduxMessage) => {
        return element.message;
    });
};

const getInternalListMessages = (messages: Messages, filter: Filter = Filter.All) => {
    let reduxResult: Array<ReduxMessage> = [];
    for (const key in messages) {
        if (messages.hasOwnProperty(key)) {
            if (filter === Filter.All) {
                reduxResult.push(messages[key]);
            } else if (filter === Filter.Shown && messages[key].shown) {
                reduxResult.push(messages[key]);
            } else if (filter === Filter.NotYetSeen && !messages[key].shown) {
                reduxResult.push(messages[key]);
            }
        }
    }
    return reduxResult;
};

const createReduxMessage = (message: MessageObject) => {
    return {
        message: message,
        shown: false,
        index: ++Index.index
    };
};

const addInternalMessage = (state: MessagesState, message: MessageObject) => {
    let id: string = message.id;
    let modal: boolean = !!message.modal;
    let messages: Messages = modal ? { ...state.modalMessages } : { ...state.flyingMessages };

    let nextViewers: StateViewers = modal ? StateViewers.ModalSingle : StateViewers.Flying;
    let waitingViewer: StateViewers = StateViewers.Close;
    if (state.stateViewer === StateViewers.Modal || state.stateViewer === StateViewers.ModalSingle) {
        waitingViewer = nextViewers;
        nextViewers = state.stateViewer;
    }
    let reduxMessage: ReduxMessage = createReduxMessage(message);
    messages[id] = reduxMessage;
    let temp: MessagesState = { ...state, waitingViewer: waitingViewer, stateViewer: nextViewers };
    if (modal) return { ...temp, modalMessages: messages };
    return { ...temp, flyingMessages: messages };
};


const readMessageError = (payload: { messageString: string; originalError: any; }) => {
    const { messageString, originalError } = payload;
    let msg: string = messageString;
    let objectError: any = originalError;
    if (Array.isArray(originalError)) {
        objectError = payload.originalError[0];
        let omsg: { Code: string, Message: string } = objectError;
        const idx = omsg.Message.indexOf(`[${omsg.Code}]`);
        if (idx >= 0) msg = omsg.Message.substring(idx + omsg.Code.toString().length + 3);
    }
    let actions: Array<MessageAction> = [];
    let permanent: boolean = true;
    let title: string = 'Sorry, there were some errors';
    let message: string = msg;
    let status: number | undefined = objectError.status;
    let id: string = '';

    if (status !== undefined) {
        if (status === 551 || status === 554) {
            id = '' + status;
            permanent = false;
        }
    }
    if (id.length === 0) id = UID();

    let messageObj: MessageObject = {
        data: payload,
        id: id,
        title: title,
        message: message,
        timed: false,
        modal: true,
        stackable: permanent,
        typeMessage: TypeMessage.Error,
        actions: actions,
    };

    return messageObj;
};

export const getNewModalMessage = (typeMessage: TypeMessage = TypeMessage.Error, permanent: boolean = false, message: string | undefined = undefined, title: string | undefined = undefined , id: string | undefined = undefined) => {
    let messageObj: MessageObject = {
        id: id ? id : UID(),
        stackable: permanent,
        modal: true,
        timed: false,
        title: title ? title : '',
        message: message ? message : '',
        typeMessage: typeMessage
    };
    return messageObj;
};

export const getNewFlyMessage = (typeMessage: TypeMessage = TypeMessage.Error, permanent: boolean = false, message: string | undefined = undefined, title: string | undefined = undefined , id: string | undefined = undefined) => {
    let messageObj: MessageObject = {
        id: id ? id : UID(),
        stackable: permanent,
        modal: false,
        timed: false,
        title: title ? title : '',
        message: message ? message : '',
        typeMessage: typeMessage
    };
    return messageObj;
};
export const getNewTimedFlyMessage = (typeMessage: TypeMessage = TypeMessage.Error, permanent: boolean = false, message: string | undefined = undefined, title: string | undefined = undefined , id: string | undefined = undefined) => {
    let messageObj: MessageObject = {
        id: id ? id : UID(),
        stackable: permanent,
        modal: false,
        timed: true,
        title: title ? title : '',
        message: message ? message : '',
        typeMessage: typeMessage
    };
    return messageObj;
};
