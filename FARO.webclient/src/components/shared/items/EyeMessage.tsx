
import * as React from 'react';
import { Popup, Icon } from 'semantic-ui-react';

interface EyeMessageProps {
    message?: any;
    style?: React.CSSProperties;
}

export class EyeMessage extends React.Component<EyeMessageProps, {}> {

    render() {
        const { message, style } = this.props;
        let showMessage: boolean = message !== undefined && message.length > 0;
        return (
            <div style={style}>
                {
                    showMessage && <Popup
                        trigger={<div style={{ margin: 'auto' }}>
                            <Icon size="large" name="eye" />
                        </div>}
                        content={<div style={{ minWidth: '280px' }}>{message}</div>}
                    />
                }
                {!showMessage && <div style={{ margin: 'auto' }}>
                    <Icon size="large" name="eye" color="grey" />
                </div>}
            </div>
        );
    }
}