import * as React from 'react';
import { InputValue } from '../shared/items/InputValue';
import { LayerDefinitionModel, LayerFieldDefinitionModel } from '../../actions/model';

interface SearchLayersProps {
    style?: React.CSSProperties;
    disabled?: boolean;
    listLayers?: LayerDefinitionModel[];
    triggerClean?: any;
    triggerPosition?: 'left' | 'right';
    onSearched?: (resultList: Array<{ layerIndex: number, items: Array<number> }> | null) => void;
    isSearchedElement?: (element: any, filter: string) => boolean;
}
interface SearchLayersState {
    filter: string;
}

export class SearchLayers extends React.Component<SearchLayersProps, SearchLayersState> {
    state = { filter: '', oldFilter: '' };

    shouldComponentUpdate(nextProps: SearchLayersProps, nextState: SearchLayersState): boolean {
        let flag: boolean = false;
        if (nextState.filter !== this.state.filter) flag = true;
        if (nextProps.listLayers !== this.props.listLayers) flag = true;
        if (nextProps.disabled !== this.props.disabled) flag = true;
        return flag;
    }

    componentDidUpdate(prevProps: SearchLayersProps, prevState: SearchLayersState): void {
        const { disabled, listLayers, onSearched } = this.props;
        const { filter } = this.state;

        if (onSearched && !disabled && (listLayers || []).length > 0) {
            if (filter.length > 0) {
                let resultData: Array<{ layerIndex: number, items: Array<number> }> = [];
                (listLayers || []).forEach((layer: LayerDefinitionModel, index: number) => {
                    let items: LayerFieldDefinitionModel[] = layer.items || [];
                    let resData: { layerIndex: number, items: Array<number> } = {
                        layerIndex: index,
                        items: []
                    };
                    let founded: boolean = false;
                    items.forEach((itm: LayerFieldDefinitionModel, itmIndex: number) => {
                        if (this.isEqual(itm, filter)) {
                            founded = true;
                            resData.items.push(itmIndex);
                        }
                    });
                    if (founded) resultData.push(resData);
                });
                onSearched(resultData);
            } else {
                onSearched(null);
            }
        }
    }

    isEqual = (element: any, newValue: string) => {
        if (newValue === '') return true;
        return this.isInternalEqual(element, newValue);
    }

    isInternalEqual = (element: any, newValue: string) => {
        if (this.props.isSearchedElement) {
            return this.props.isSearchedElement(element, newValue);
        }
        let searched: string = newValue.toLowerCase().trim();
        let type: string = typeof (element);
        if (type === 'string') {
            if ((element as string).toLowerCase().indexOf(searched) !== -1) return true;
        } else if (type === 'number') {
            let elementString: string = String(element);
            if (elementString.toLowerCase().indexOf(searched) !== -1) return true;
        } else if (type === 'object') {
            for (const key in element) {
                if (element.hasOwnProperty(key)) {
                    const el = element[key];
                    if (this.isInternalEqual(el, searched)) return true;
                }
            }
        }
        return false;
    }

    triggerClick = (ev: any) => {
        this.setState({ filter: '' });
    }

    render() {
        const { style, disabled, triggerClean, triggerPosition } = this.props;
        const { filter } = this.state;
        let clean: any = triggerClean ? React.cloneElement(triggerClean, { onClick: this.triggerClick }) : '';
        let isleft: boolean = triggerPosition === 'left';
        return (
            <div style={{ ...(style || {}), display: 'flex' }}>
                {
                    isleft && clean
                }
                <InputValue
                    disabled={disabled}
                    name={'search'}
                    placeholder={'search'}
                    value={filter}
                    onChange={(name: string, newValue: string) => this.setState({ filter: newValue })}
                />
                {
                    !isleft && clean
                }
            </div>
        );
    }
}