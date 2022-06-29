import * as React from 'react';
import { Table, Header, Feed } from 'semantic-ui-react';

export const TableEditableWidget = (props: { edit?: boolean, editJSON?: boolean, children?: any | undefined }) => {
    
    return ( 
        <Table basic="very" className="editabled widget">
            <Table.Body style={{ height: '100%' }}>
                {React.Children.map(props.children,
                    (child: any) => child && React.cloneElement(child)
                )}
            </Table.Body>
        </Table>
    );
};

export const RowEditableWidget = (props: { label?: string, edit?: boolean, children: any | undefined, content?: string | JSX.Element }) => {
    const content = props.content !== undefined && (React.isValidElement(props.content) ? props.content : <Feed><Feed.Event summary={props.content} /></Feed>);
    return (
        <Table.Row >
            <Table.Cell style={{ border: 0 , height: '100%'}} textAlign="right" collapsing>
                <Header content={props.label && `${props.label} :`} as="h4" />
            </Table.Cell>
            <Table.Cell style={{ border: 0 , height: '100%'}}>
                {content && !props.edit
                    ? content
                    : props.children
                }
            </Table.Cell>
        </Table.Row>
    );
};