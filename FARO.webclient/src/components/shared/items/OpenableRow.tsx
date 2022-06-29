import * as React from 'react';
import { Segment, Button, Table, Container, Grid } from 'semantic-ui-react';
import { OpenableTabContainer } from './OpenableTabContainer';
import { EyeMessage } from './EyeMessage';

interface OpenableRowProps {
    columns: number;
    message?: any;
    alternateCellStyle?: Array<React.CSSProperties>;
    style?: React.CSSProperties;
}

export class OpenableRow extends React.Component<OpenableRowProps, { open: boolean }> {
    state = { open: false };

    render() {
        const { columns, children, message, style, alternateCellStyle } = this.props;
        const { open } = this.state;
        if (children === null || children === undefined) return null;
        let itemChildren: any[] = React.Children.toArray(children);
        // let openCss: React.CSSProperties = open ? { backgroundColor: 'rgba(249, 253, 241, 0.5)'} : {};

        return (
            <Segment.Group horizontal style={{ ...style, width: '100%' }}  >
                <Segment compact style={{ padding: '6px', width: '92%' }}>
                    <OpenableTabContainer alternateCellStyle={alternateCellStyle} columns={columns < 1 ? 1 : columns} open={open} >
                        {itemChildren}
                    </OpenableTabContainer>
                </Segment>

                <Segment style={{ width: '96px' }}>

                    <Grid columns={2} verticalAlign="middle" >
                        <Grid.Row>
                            <Grid.Column>
                                <EyeMessage message={!open ? message : undefined} style={{ margin: 'auto' }} />
                            </Grid.Column>
                            <Grid.Column >
                                <Button
                                    floated="right"
                                    // style={{ margin: 'auto' }}
                                    size={'tiny'}
                                    icon={open ? 'angle up' : 'angle down'}
                                    onClick={() => this.setState({ open: !this.state.open })}
                                />
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                    {/* <Segment style={{ display: 'flex', padding: '6px' }}>
                        <EyeMessage message={!open ? message : undefined} style={{ margin: 'auto' }} />
                        <Button
                            style={{ margin: 'auto' }}
                            size={'tiny'}
                            icon={open ? 'angle up' : 'angle down'}
                            onClick={() => this.setState({ open: !this.state.open })}
                        />
                    </Segment> */}
                </Segment>
            </Segment.Group>
        );
    }
}

