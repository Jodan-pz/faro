

import * as React from 'react';
import { Pagination, PaginationProps, PaginationItemProps, Icon, SemanticShorthandItem } from 'semantic-ui-react';


interface TablePaginationProps {
    onChangePage?: (page: number) => void;
    activePage?: number;
    pageSize?: number;
    totalSize?: number;
    disable?: boolean;
}

export class TablePagination extends React.Component<TablePaginationProps, {}> {

    handlePaginationChange = (event: React.MouseEvent<HTMLAnchorElement>, data: PaginationProps) => {
        if (this.props.onChangePage && data.activePage) {
            // tslint:disable-next-line: radix
            this.props.onChangePage(typeof (data.activePage) === 'string' ? parseInt(data.activePage) : data.activePage as number);
        }
    }
    getProps = (): PaginationProps | null => {
        const { activePage, pageSize, totalSize , disable} = this.props;
        if (activePage && pageSize && totalSize) {
            const totalPages = Math.ceil(totalSize / pageSize);
            let disableProps: boolean = disable === undefined ? false : disable;
            return {
                totalPages: totalPages,
                activePage: activePage,
                onPageChange: this.handlePaginationChange,

                // Each item is based on the default props, in case they may change in the future.
                // defaultProps is not contained in the @types definition, hence the cast to any.
                pageItem: {
                    ...(Pagination as any).defaultProps.pageItem,
                    disabled: disableProps,
                },
                nextItem: {
                    ...(Pagination as any).defaultProps.nextItem,
                    disabled: disableProps || activePage >= totalPages,
                    icon: true,
                    content: <Icon name="angle right" />,
                },
                lastItem: {
                    ...(Pagination as any).defaultProps.lastItem,
                    disabled: disableProps || (activePage === totalPages),
                    icon: true,
                    content: <Icon name="angle double right" />,
                },
                prevItem: {
                    ...(Pagination as any).defaultProps.prevItem,
                    disabled: disableProps || (activePage <= 1),
                    icon: true,
                    content: <Icon name="angle left" />,
                },
                firstItem: {
                    ...(Pagination as any).defaultProps.firstItem,
                    disabled: disableProps || (activePage === 1),
                    icon: true,
                    content: <Icon name="angle double left" />,
                },
                ellipsisItem: {
                    icon: true,
                    content: <Icon name="ellipsis horizontal" />,
                },
            };
        }
        return null;
    }

    render() {
        const { activePage, pageSize, totalSize } = this.props;
        let prpsPag: PaginationProps | null = this.getProps();
        if ( prpsPag !== null) {
            return ( <Pagination {...prpsPag} /> );
        }
        return null;


        /*
        if (activePage && pageSize && totalSize) {
            const totalPages = Math.ceil(totalSize / pageSize);

            let boundaryRange: number = 0;
            let siblingRange: number = 1;
            let firstItem: SemanticShorthandItem<PaginationItemProps> = null;
            let lastItem: SemanticShorthandItem<PaginationItemProps> = null;
            let ellipsisItem: SemanticShorthandItem<PaginationItemProps> = null;
            //  activePage === 1 ? '' : <Icon name={'angle double left'} />
            // activePage === totalPages ? '' : <Icon name={'angle double right'} />

            if (totalPages > 3) {
                boundaryRange = 2;
                siblingRange = 2;
                firstItem = { content: <Icon name={'angle double left'} />, icon: true };
                lastItem = { content: <Icon name={'angle double right'} />, icon: true };
                ellipsisItem = { content: <Icon name={'ellipsis horizontal'} />, icon: true };
            }
            return (

                <div>
                    <Pagination
                        nextItem={activePage === 1 ? '' : <Icon name={'angle double left'} />}
                        totalPages={totalPages}
                        defaultActivePage={activePage}
                        boundaryRange={boundaryRange}
                        siblingRange={siblingRange}
                        firstItem={firstItem}
                        lastItem={lastItem}
                        ellipsisItem={ellipsisItem}
                        onPageChange={this.handlePaginationChange}
                    />

                    <label style={{ paddingLeft: '10px' }}>{`Total Items :${totalSize}`}</label>
                </div>

            );
        }

        return null;*/


    }
}
