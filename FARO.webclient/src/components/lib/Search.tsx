import * as React from 'react';
import { InputValue } from '../shared/items/InputValue';
import { Button } from 'semantic-ui-react';


interface SearchProps {
    listData?: Array<any>;
    search?: boolean;
    onIndex?: (listIndex: Array<number> | null) => void;
    onDisableSearch?: (disable: boolean) => void;
    isSearchedElement?: (element: any, filter: string) => boolean;
}
interface SearchState {
    value: string;
    oldvalue: string;
    disable: boolean;
}

export class Search extends React.Component<SearchProps, SearchState> {
    state = { value: '', oldvalue: '', disable: false };
    last: string = '';
    isEqual = (element: any, newValue: string) => {
        if (this.props.isSearchedElement) {
            return this.props.isSearchedElement(element, newValue);
        }
        let type: string = typeof (element);
        if (type === 'string') {
            if ((element as string).indexOf(newValue) !== -1) return true;
        } else if (type === 'number') {
            let elementString: string = String(element);
            if (elementString.indexOf(newValue) !== -1) return true;
        } else if (type === 'object') {
            for (const key in element) {
                if (element.hasOwnProperty(key)) {
                    const el = element[key];
                    if (this.isEqual(el, newValue)) return true;
                }
            }
        }
        return false;
    }

    onChange = (name: string, newValue: string) => {
        const { value } = this.state;
        this.setState({ value: newValue, oldvalue: value });
    }

    updateIndex = () => {
        const { value } = this.state;
        if (this.props.onIndex) {
            const { listData } = this.props;
            let resultIndex: Array<number> | null = [];
            if (value && value.length > 0) {
                if (listData && listData.length > 0) {
                    listData.forEach((element: any, index: number) => {
                        if (this.isEqual(element, value) && resultIndex) resultIndex.push(index);
                    });
                }
            }
            if (value !== undefined && value.length > 0 && resultIndex.length === 0 && listData && listData.length > 0) {
                resultIndex = null;
            }
            this.props.onIndex(resultIndex);
        }
    }
    shouldComponentUpdate(nextProps: SearchProps, nextState: SearchState): boolean {
        const { listData, search } = this.props;
        if (
            listData !== nextProps.listData
            || search !== nextProps.search
            || this.state.value !== nextState.value
            || this.state.oldvalue !== nextState.oldvalue
            || this.state.disable !== nextState.disable
        ) return true;
        return false;
    }

    componentDidUpdate(): void {
        const { search } = this.props;
        const { value, oldvalue } = this.state;
        if (value !== oldvalue || search) {
            this.setState({ value: value, oldvalue: value }, () => {
                this.updateIndex();
            });
        }
    }
    changeDisable = () => {
        const { disable, value } = this.state;
        this.last = !disable ? value : this.last;

        this.setState({ ...this.state, disable: !this.state.disable, value: disable ? this.last : '' }, () => {
            if (this.props.onDisableSearch) {
                this.props.onDisableSearch(!disable);
            }
        });

    }
    render() {
        const { value, disable } = this.state;

        let disabldInput: boolean = disable || this.props.listData === undefined || this.props.listData.length === 0;
        let col: string = value && value.length > 0 ? 'green' : '#d0ffce';
        return (
            <div style={{ marginTop: '4px', marginBottom: '4px' }}>
                <div style={{ padding: '1px', display: 'flex' }}>
                    <Button icon="power off" size="mini" color={disable ? 'grey' : 'green'} onClick={() => this.changeDisable()} /> 
                    <InputValue disabled={disabldInput} name={'search'} placeholder={'search'} value={value} onChange={this.onChange} />
                    <Button icon="erase" size="mini" disabled={disable} onClick={() => this.onChange('', '')} />
                </div>
            </div>

        );
    }
}