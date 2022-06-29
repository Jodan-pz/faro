export enum StateViewers {
    Close,
    Modal,
    ModalSingle,
    Flying
}


export enum TypeMessage {
    Info,
    Warning,
    Error
}

export type MessageAction = {
    // l'azione da compiere una volta visualizzato il messaggio
    // extra contiene se presente, dati aggiuntivi legati al messaggio
    // l'azione viene compiuta alla avvenuta visualizzazione se il MessageAction
    // manca di name. 
    // Se invece presente il name l'azione viene compiuta attraverso la scelta dell'utente 
    action: (idMessage: string, data?: any) => void;
    // il nome dell'azione, se presente indica oltre al nome anche che l'azione viene eseguita solo 
    // su scelta dell'utente  
    name?: string;
};




export type MessageObject = {
    // identifica il messaggio
    id: string;
    // il messaggio da visualizzare
    message: string;
    // indica il tipo di messaggio 
    typeMessage: TypeMessage;
    // il titolo del messaggio per una visualizzazione veloce
    title?: string;
    // indica se deve essere visualizzato in una modale default false
    modal?: boolean;
    // indica se è un messaggio da conservare default false
    stackable?: boolean;
    // indica le azioni da compiere legate alla avvenuta visualizzazione del messaggio.
    // Se il messaggio è permanente ed è rivisualizzato le azioni non verranno riazionate
    actions?: Array<MessageAction>;
    // default true.
    timed?: boolean;
    // informazioni aggiuntive legate al messaggio
    data?: any
};