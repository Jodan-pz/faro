import * as React from 'react';
import { Table, TableProps, List, ListProps, Label, Button, IconProps, Visibility, Divider, TableCellProps, Segment, TableHeaderCellProps } from 'semantic-ui-react';
import { eventPrevent } from '../Utils';

interface PaginatedProps<T> {
    data?: T[];
    onChange?: (pageIndex?: number, pageSize?: number) => any;
    pageIndex?: number;
    pageSize?: number;
    pageDivider?: number;
    pageMode?: 'infinity' | 'more' | 'none';
    context?: any;
}
interface PaginatedWidgetProps<T> extends PaginatedProps<T> {
    component: (index: any, data: T | undefined, visibility: any, pageInfo: any) => any;
}
interface PaginatedListWidgetProps<T> extends PaginatedProps<T> {
    renderItem: (item: T) => void;
    onSelection?: (item: T) => void;
}
class PaginatedWidget<T> extends React.Component<PaginatedWidgetProps<T>> {
    onChangePage(pageIndex: number) {
        if (this.props.onChange) {
            this.props.onChange(pageIndex, this.props.pageSize);
        }
    }

    render() {
        const { data, component, pageDivider, pageMode = 'infinity', pageSize = 0, pageIndex = 1, context } = this.props;

        if (data && data.length > 0 && component) {
            let visibilityIndex: number | undefined = undefined;
            let moreIndex: number | undefined = undefined;

            // pagination
            if (pageMode && pageMode !== 'none' && pageSize) {
                const dataLength = data.length;
                const expdLength = pageSize * pageIndex;

                if (dataLength === expdLength) {
                    switch (pageMode) {
                        case 'infinity':
                            visibilityIndex = expdLength - Math.floor(pageSize * 40 / 100);
                            break;
                        case 'more':
                            moreIndex = 1;
                            break;
                        default:
                            break;
                    }
                }
            }

            return (
                <>
                    {data && data.map((v: any, i) => {
                        const pagenbr = pageDivider && !(i % pageDivider) && (i / pageDivider);

                        const visibility = visibilityIndex && visibilityIndex === i
                            ? <Visibility context={context} fireOnMount offset={0} onOnScreen={() => this.onChangePage(pageIndex + 1)}><div /></Visibility>
                            : undefined;

                        return component(i, v, visibility, pagenbr ? <PaginatedMorePage content={pagenbr + 1} /> : undefined);
                    })}

                    {moreIndex
                        ? component('more', undefined, undefined, <PaginatedMorePage content="MORE" icon="chevron down" onMore={() => this.onChangePage(pageIndex + 1)} />)
                        : undefined}
                </>
            );
        }

        return null;
    }
}
class PaginatedMorePage extends React.Component<{ content: string | number, icon?: string | IconProps, onMore?: () => void }, { loading: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = { loading: false };
    }
    componentWillReceiveProps(next: any) {
        this.setState({ loading: false });
    }
    onClick = () => {
        this.setState({ loading: true }, () => this.props.onMore && this.props.onMore());
    }
    render() {
        const { content, icon, onMore } = this.props;

        return (
            onMore
                ? <Button as="a" basic size="mini" content={content} icon={icon} loading={this.state.loading} onClick={eventPrevent(this.onClick)} />
                : <Label basic circular content={content} icon={icon} />
        );
    }
}
// export
export class PaginatedTableWidget<T> extends React.Component<PaginatedWidgetProps<T> & TableProps> {
    static Header = (props: TableHeaderCellProps & { orderByCol?: string, orderByVal?: string, onOrderBy?: (col: string, direction: string) => void }) => {
        const { orderByCol, orderByVal = '', onOrderBy, ...cellProps } = props;

        if (orderByCol && onOrderBy) {
            const sorted = (orderByVal.indexOf(orderByCol) !== -1);
            const direction = sorted ? (orderByVal.indexOf('desc') !== -1 ? 'descending' : 'ascending') : undefined;
            cellProps.sorted = direction;
            cellProps.onClick = onOrderBy(orderByCol, (direction !== 'descending' ? 'desc' : 'asc'));
        }

        return <Table.HeaderCell collapsing singleLine {...cellProps} />;
    }
    static Cell = (props: TableCellProps & { miniPadding?: boolean }) => {
        const { children, content, miniPadding, ...cellProps } = props;
        const child = content || children;

        cellProps.title = cellProps.singleLine && !cellProps.title && !React.isValidElement(child) ? child : cellProps.title;

        if (miniPadding) cellProps.className = `${cellProps.className || ''} minipadding`; 

        return <Table.Cell singleLine verticalAlign="middle" {...cellProps}>{child}</Table.Cell>;
    }

    render() {
        const { data, onChange, component, pageDivider, pageMode, pageSize, pageIndex, children, onSelection, context, ...innerProps } = this.props;

        innerProps.className = `${innerProps.className || ''} widget`;

        return (
            <Table sortable compact="very" unstackable celled {...innerProps}>
                {children}
                <Table.Body>
                    {data && data.length > 0
                        ? <PaginatedWidget data={data} onChange={onChange} pageMode={pageMode} pageIndex={pageIndex} pageSize={pageSize} pageDivider={pageDivider} component={component} context={context} />
                        : <Table.Row ><Table.Cell /></Table.Row>
                    }
                </Table.Body>
            </Table>
        );
    }
}
export class PaginatedListWidget<T> extends React.Component<PaginatedListWidgetProps<T> & ListProps> {
    handlerSelection = (v: any) => {
        const { onSelection } = this.props;
        if (onSelection) {
            onSelection(v);
        }
    }
    render() {
        const { data, onChange, renderIcon, renderItem, pageDivider, pageMode, pageSize, pageIndex, children, onSelection, context, ...innerProps } = this.props;

        return (
            <Segment className="widget">
                {children}
                <List divided relaxed="very" {...innerProps} >
                    <PaginatedWidget data={data} onChange={onChange} pageMode={pageMode} pageIndex={pageIndex} pageSize={pageSize} pageDivider={pageDivider} component={this.renderRecord} context={context} />
                </List>
            </ Segment>
        );
    }
    renderRecord = (i: any, v: T | undefined, visibility: any, divider: any) => {
        const { renderItem } = this.props;
        return (
            <React.Fragment key={i}>
                {divider && <Divider horizontal>{divider}</Divider>}
                {v &&
                    <List.Item onClick={eventPrevent(() => this.handlerSelection(v))}>
                        {renderItem && renderItem(v)}
                        {visibility}
                    </List.Item>
                }
            </ React.Fragment>
        );
    }
}