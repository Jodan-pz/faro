import * as React from 'react';
import { ButtonProps, Button } from 'semantic-ui-react';
import { eventPrevent } from '../Utils';


export const Copy = (prop: { button?: any, trigger?: JSX.Element, textProvider?: () => string, onCopy?: (msg: string) => void }) => {
    const copyTextToClipboard = (text: string) => {
        if (!text) return 'undefined';
        let msg: string = 'error';
        let scrollTop: number = document && document.documentElement && document.documentElement.scrollTop || 0;
        let textArea: HTMLTextAreaElement = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            msg = document.execCommand('copy') ? 'successfull' : 'unsuccessfull';
        } catch (err) {
            // 
        } finally {
            document.body.removeChild(textArea);
            if (document.documentElement)
                document.documentElement.scrollTop = scrollTop;
            return msg;
        }
    };

    const handlerClick = (textProvider?: () => string, onCopy?: (msg: string) => void) => {
        if (textProvider) {
            let msg: string = copyTextToClipboard(textProvider());
            if (onCopy) onCopy(msg);
        }
    };
    let customTrigger: any = null;
    if (prop.trigger !== undefined) {
        customTrigger = prop.trigger && React.cloneElement(prop.trigger, { prop: { ...prop.button }, onClick: () => handlerClick(prop.textProvider, prop.onCopy) });
    }
    if (customTrigger === null) {
        customTrigger = (<Button  {...prop.button} content={'Copy'}  onClick={() => handlerClick(prop.textProvider, prop.onCopy)} />);
    }
    return customTrigger;
};