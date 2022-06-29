import { createAction } from 'app-support';
import { MessageObject, StateViewers } from './modelMsg';
 
// cancella il singolo messaggio identificato per la key
export const cleanMessage = createAction<string>('CLEAN_MESSAGE');  

export const displayedMessage = createAction<string>('DISPLAYED_MESSAGE');  
 
// cancella tutti i messaggi presenti
export const cleanAllMessages = createAction('CLEAN_ALL_MESSAGE'); 

export const cleanPermanentMessages = createAction('CLEAN_PERMANENT_MESSAGE'); 

export const addMessage = createAction<MessageObject>('ADD_MESSAGE'); 

export const changeStateViewer = createAction<StateViewers>('CHANGE_STATE_VIEWER'); 