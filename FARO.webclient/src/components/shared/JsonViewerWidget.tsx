import * as React from 'react';
import { Popup, Table, Icon } from 'semantic-ui-react';
import { truncate } from 'lodash';
import { isNumber } from 'util';

export interface JsonViewerWidgetProps {
    mode?: 'first' | 'icon' | 'all' | 'custom';
    display?: 'inline-block' | 'block';
    json?: string | any;
    customTrigger?: JSX.Element;
    doTruncate?: boolean | number;
}

export const JsonViewerWidget = (props: JsonViewerWidgetProps) => {
    const { json = '', mode = 'first', display = 'block', customTrigger, doTruncate = true } = props;

    let jObject: any = undefined;

    if (typeof json === 'string') {
        try {
            jObject = JSON.parse(json);
        } catch {
            console.log(json);
            return null;
        }
    } else {
        jObject = json;
    }

    const jObjectKeys = Object.keys(jObject || {}).reduce((m, key) => {
        var value = jObject[key];
        if (value) {
            if (typeof value === 'string' && value !== '') {
                m.push({ key: key.toUpperCase(), value });
            } else {
                m.push({ key: key.toUpperCase(), value: <JsonViewerWidget json={value} mode="all" display="block" doTruncate={doTruncate} /> });
            }
        }
        return m;
    }, [] = [] as any);

    if (jObjectKeys.length === 0) return null;

    let inlineKeys = [];
    let restKeys = [];

    if (mode === 'all') {
        inlineKeys = jObjectKeys;
    } else if (mode === 'first') {
        inlineKeys = [jObjectKeys[0]];
        [, ...restKeys] = jObjectKeys;
    } else {
        restKeys = jObjectKeys;
    }

    const getValueText = (value: any, doTruncate?: boolean | number) => {
        if (!doTruncate) return value;
        return truncate(value, { length: isNumber(doTruncate) ? doTruncate : 20 });
    };

    const trigger = (
        <div style={{ whiteSpace: 'nowrap' }}>
            {customTrigger ||
                (mode && mode === 'icon'
                    ? <Icon name="list layout" circular link />
                    : <>
                        {inlineKeys.map((v: any, i: any) => {
                            if (display === 'inline-block') {
                                return <div key={i} style={{ display, marginRight: '5px' }} >[<a>{v.key}: </a>{getValueText(v.value, doTruncate)}]</div>;
                            }
                            return <div key={i} style={{ display, marginRight: '5px' }} ><a>{v.key}: </a>{getValueText(v.value, doTruncate)}</div>;
                        })}
                        {restKeys.length !== 0 && <span>and {restKeys.length} ...</span>}
                    </>
                )}
        </div>
    );

    if (mode !== 'all') {
        return (
            <Popup wide trigger={trigger} flowing hoverable size="small" on="click" >
                <Table definition compact style={{ width: '500px' }}>
                    <Table.Body>
                        {jObjectKeys.map((v: any, i: number) => {
                            return (
                                <Table.Row key={i}>
                                    <Table.Cell width="4" collapsing textAlign={'right'} ><a>{v.key} :</a></Table.Cell>
                                    <Table.Cell collapsing content={v.value} style={{ whiteSpace: 'normal' }} />
                                </Table.Row>
                            );
                        })}
                    </Table.Body>
                </Table>
            </Popup>
        );
    }

    return trigger;
};