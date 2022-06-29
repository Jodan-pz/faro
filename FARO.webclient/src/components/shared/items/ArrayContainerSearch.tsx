import { ItemValue } from '../../../actions/model';
import * as React from 'react';
import { ArrayContainer } from './ArrayContainer';
import { listValues } from '../../../components/Utils';
import { Search } from '../../../components/lib/Search';


interface ArrayContainerProps extends ItemValue<any[]> {
    alternateStyle?: Array<React.CSSProperties>;
    height?: string;
    showAdd?: boolean;
    showDelete?: boolean;
    showRowNumber?: boolean;
    defaultValue?: any;
    isSearchedElement?: (element: any, filter: string) => boolean;
    toClone?: (item: any) => any;
}
interface ArrayContainerState {
    list: Array<any> | null;
    disableSearch: boolean;
}

export class ArrayContainerSearch extends React.Component<ArrayContainerProps, ArrayContainerState> {
    state = { list: [], disableSearch: false };
    origlist: Array<any>;
    search: boolean = false;
 
    shouldComponentUpdate(nextProps: ArrayContainerProps, nextState: ArrayContainerState): boolean {
        const { value, height, showAdd, showDelete, showRowNumber, defaultValue, disabled, style } = this.props;
        if (
            value !== nextProps.value
            || height !== nextProps.height
            || showAdd !== nextProps.showAdd
            || showDelete !== nextProps.showDelete
            || showRowNumber !== nextProps.showRowNumber
            || defaultValue !== nextProps.defaultValue
            || disabled !== nextProps.disabled
            || style !== nextProps.style
            || this.state.list !== nextState.list
            || this.state.disableSearch !== nextState.disableSearch
        ) return true;
        return false;
    }

    changeValue = (newValue: Array<any>) => {
        if (this.props.onChange) {
            const { value } = this.props;
            const { list } = this.state;
            let cloneValue: Array<any> = [...(value as Array<any>)];
            list.forEach((valIndx: number, index: number) => {
                cloneValue[valIndx] = newValue[index];
            });
            this.props.onChange(this.props.name || '', cloneValue);
        }
    }

    changeLen = (newValue: Array<any>) => {
        if (this.props.onChange) {
            const { value } = this.props;
            const { list } = this.state;
            if (this.origlist.length > 0) {
                for (let i: number = 0; i < newValue.length; i++) {
                    let indx: number = this.origlist.findIndex(v => v === newValue[i]);
                    if (indx >= 0) this.origlist.splice(indx, 1);
                }
            }
            let cloneValue: Array<any> = [...(value as Array<any>)];
            if (cloneValue && cloneValue.length > 0 && this.origlist.length > 0) {
                let indx: number = cloneValue.findIndex(v => v === this.origlist[0]);
                if (indx >= 0) cloneValue.splice(indx, 1);

            }
            if (cloneValue && cloneValue.length > 0) {
                this.setState({ list: [] }, () => {
                    if (this.props.onChange) {
                        this.search = true;
                        this.props.onChange(this.props.name || '', cloneValue);
                    }
                });
            }
        }
    }
    onChange = (name: string | number, newValue: Array<any>) => {
        const { list } = this.state;
        if (list.length === 0) {
            if (this.props.onChange) {
                this.props.onChange(this.props.name || '', newValue);
            }
        } else {
            if (newValue.length !== list.length) {
                this.changeLen(newValue);
            } else {
                this.changeValue(newValue);
            }
        }
    }

    render() {
        const { list, disableSearch } = this.state;
        const { value , alternateStyle} = this.props;
        let values: Array<any> = value as Array<any>;

        this.origlist = list === null ? [] : list && list.length === 0 ? values : listValues(list, values);

        let src: boolean = this.search;

        this.search = false;

        let showAdd: boolean = list === null || list.length === 0 ? !!this.props.showAdd : false;
        // marco1
        return ( 
            <>
                <Search
                    search={src}
                    listData={values || []}
                    isSearchedElement={this.props.isSearchedElement}
                    onIndex={(listIndex: Array<number>) => this.setState({ list: listIndex })}
                    onDisableSearch={(disableSearch: boolean) => this.setState({ ...this.state, disableSearch: disableSearch })}
                />
                <div >
                   
                        <ArrayContainer
                            className={this.props.className}
                            alternateStyle={alternateStyle}
                            style={this.props.style}
                            showRowNumber={this.props.showRowNumber}
                            sortable={disableSearch}
                            defaultValue={this.props.defaultValue}
                            showAdd={showAdd}
                            showDelete={this.props.showDelete}
                            value={this.origlist}
                            disabled={this.props.disabled}
                            name={this.props.name}
                            onChange={this.onChange}
                            toClone={this.props.toClone}
                        >
                            {this.props.children}
                        </ArrayContainer>
                    
                </div>
            </>
        );
    }
}