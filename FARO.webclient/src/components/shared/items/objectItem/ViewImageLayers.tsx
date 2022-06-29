import * as React from 'react';
import { Modal, Header, Icon, Button } from 'semantic-ui-react';
import { appConnector } from 'app-support';
import { MenuLayers } from './MenuLayers';
import { eventPrevent, deepCopy } from '../../../Utils';
import * as reducers from '../../../../reducers';
import { LayerDefinitionModel, ItemValue, KeysIteratorModel, DecoratorModel, ImageKeysIteratorsDefinitionModel, LodashItem, LayerFieldDefinitionModel } from '../../../../actions/model';
import { SearchLayers } from '../../../lib/SearchLayers';
import { ArrayContainer } from '../ArrayContainer';
import { ViewItem } from './viewItemsLayer/ViewItem';
import { alternateStyle } from 'src/components/lib/UtilLib';

type Missed = {
    itemIndex: number;
    index: number;
};

type ResultList = { layerIndex: number, items: Array<number> };

interface ViewImageLayersProps extends ItemValue<LayerDefinitionModel[]> {
    searchKeys?: Array<KeysIteratorModel>;
    searchDecorators?: Array<DecoratorModel>;
    selectedKeys?: Array<ImageKeysIteratorsDefinitionModel>;
}
const conn = appConnector<ViewImageLayersProps>()(
    (s, p) => ({
        selectField: reducers.getSelectImageField(s)
    }),
    {

    }
);

interface ViewImageLayersState {
    currentName: string;
    resultList: Array<ResultList> | null;
    open: boolean;
    sortableArray: boolean;
}
class ViewImageLayersCompo extends conn.StatefulCompo<ViewImageLayersState> {


    tempMove: {
        itemIndex: number;
        fromLayer: number;
        toLayer: number;
    };

    constructor(props: any) {
        super(props);
        let layers: LayerDefinitionModel[] = props.value ? [...(props.value as LayerDefinitionModel[])] : [];
        this.state = {
            currentName: layers.length > 0 && layers[0].name ? layers[0].name : '',
            open: false,
            resultList: null,
            sortableArray: false
        };
    }

    componentDidUpdate(prevProps: ViewImageLayersProps): void {
        const { currentName } = this.state;
        if (currentName.length === 0) {
            const { value } = this.props;
            let layers: LayerDefinitionModel[] = value as LayerDefinitionModel[];
            if (layers.length > 0) {
                this.setState({ currentName: layers[0].name! });
            }
        }

    }

    updateLayers = (newValue: any) => {
        if (this.props.onChange) {
            this.props.onChange(this.props.name || '', newValue);
        }
    }

    sortLayer = (oldIndex: number, newIndex: number) => {
        const { value } = this.props;
        let layers: LayerDefinitionModel[] = [...(value as LayerDefinitionModel[])];
        let layerOld: LayerDefinitionModel = layers[oldIndex];
        let layerNew: LayerDefinitionModel = layers[newIndex];
        layers[oldIndex] = layerNew;
        layers[newIndex] = layerOld;
        this.updateLayers(layers);
    }

    deleteLayer = () => {
        const { value } = this.props;
        const { currentName } = this.state;
        let newSelected: string = '';
        let layers: LayerDefinitionModel[] = [...(value as LayerDefinitionModel[])];
        for (let i: number = 0; i < layers.length; i++) {
            if (layers[i].name === currentName) {
                layers.splice(i, 1);
                if (i > 0) newSelected = layers[i - 1].name!;
                else if (i === 0 && layers.length > 0) newSelected = layers[0].name!;
                else newSelected = '';
                break;
            }
        }
        this.updateLayers(layers);
        this.setState({ currentName: newSelected });
    }

    changeNameLayers = (oldName: string, newName: string) => {
        const { value } = this.props;
        let layers: LayerDefinitionModel[] = [...(value as LayerDefinitionModel[])];
        for (let i: number = 0; i < layers.length; i++) {
            if (layers[i].name === oldName) {
                layers[i].name = newName;
                break;
            }
        }
        this.updateLayers(layers);
    }
    addLayer = (name: string) => {
        this.setState({ ...this.state, currentName: name }, () => {
            const { value } = this.props;
            let layers: LayerDefinitionModel[] = [...(value as LayerDefinitionModel[])];
            layers.push({ name: name, items: [] });
            this.updateLayers(layers);
        });
    }


    moveItemTo = (itemIndxFrom: number, layerTo: number) => {
        const { value, onChange } = this.props;
        const { currentName } = this.state;
        if (onChange && layerTo !== undefined && itemIndxFrom !== undefined) {
            let realIndex: number = itemIndxFrom;
            let layers: LayerDefinitionModel[] = [...(value as LayerDefinitionModel[])];
            if (layerTo < layers.length) {
                let layerIndex: number = layers.findIndex((lay: LayerDefinitionModel) => lay.name === currentName);
                let objLayerFrom: LayerDefinitionModel = deepCopy(layers[layerIndex]);
                let objLayerTo: LayerDefinitionModel = deepCopy(layers[layerTo]);
                if (objLayerFrom.items && realIndex < objLayerFrom.items.length) {
                    let item = objLayerFrom.items[realIndex];
                    objLayerFrom.items.splice(realIndex, 1);
                    objLayerTo.items = objLayerTo.items || [];
                    objLayerTo.items.push(item);
                    layers[layerIndex] = objLayerFrom;
                    layers[layerTo] = objLayerTo;
                    this.updateLayers(layers);
                }
            }
        }
    }

    cancelMoveLayer = () => {
        this.setState({ ...this.state, open: false });
    }

    confirmMoveLayer = () => {
        this.setState({ ...this.state, open: false }, () => {
            const { value } = this.props;
            let layers: LayerDefinitionModel[] = [...(value as LayerDefinitionModel[])];
            let layerFrom: LayerDefinitionModel = { ...layers[this.tempMove.fromLayer] };
            let layerTo: LayerDefinitionModel = { ...layers[this.tempMove.toLayer] };
            let itemsFrom: Array<any> = layerFrom.items !== undefined ? [...layerFrom.items] : [];
            let itemsTo: Array<any> = layerTo.items !== undefined ? [...layerTo.items] : [];
            let item: any = itemsFrom[this.tempMove.itemIndex];
            itemsFrom.splice(this.tempMove.itemIndex, 1);
            itemsTo.push(item);
            layerFrom.items = itemsFrom;
            layerTo.items = itemsTo;
            layers[this.tempMove.fromLayer] = layerFrom;
            layers[this.tempMove.toLayer] = layerTo;
            this.updateLayers(layers);
        });
    }



    getKeys = (indexLayer: number, layers: LayerDefinitionModel[]) => {
        const { selectedKeys, searchKeys } = this.props;
        let fields: Array<string> = [];
        (selectedKeys || []).forEach(sk => {
            if (sk.keyid) {
                let keyid: string = sk.keyid;
                let keyIterator: KeysIteratorModel | undefined = (searchKeys || []).find(k => k.id === keyid);
                if (keyIterator && keyIterator.fields) {
                    keyIterator.fields.forEach(fl => {
                        if (fl.name) {
                            let nm: string = fl.name;
                            if (sk.fields && sk.fields[nm]) {
                                nm = sk.fields[nm];
                            }
                            fields.push('#key:' + nm);
                        }
                    });
                }
            }
        });
        // aggiungo tutte le variabili create sui vari layer fino al layer precedente a quello corrente
        for (let i: number = 0; i < indexLayer; i++) {
            let ls: LayerDefinitionModel = layers[i];
            if (ls.items) {
                ls.items.forEach(it => {
                    if (it.field) fields.push(it.field);
                });
            }
        }
        return fields;
    }
     
    onChangeLayerMerge = (name: string | number, newValue: any | null) => {
        const { value } = this.props;
        const { currentName, resultList } = this.state;
        let selected: string = currentName;
        let layers: LayerDefinitionModel[] = value !== undefined ? [...(value as LayerDefinitionModel[])] : [];
        let layerIndex: number = layers.findIndex((lay: LayerDefinitionModel) => lay.name === selected);
        let layer: LayerDefinitionModel | undefined = deepCopy(layers.find((lay: LayerDefinitionModel) => lay.name === selected));
        let itmLodashItem: LodashItem[] = newValue;
        if (layer !== undefined && resultList && resultList.length > 0) {
            if (layer.items === undefined) layer.items = [];
            let res: ResultList | undefined = resultList.find(rl => rl.layerIndex === layerIndex);
            if (res && res.items) {
                if (itmLodashItem.length < res.items.length) {
                    // delete
                    let missed: Array<Missed> = [];
                    res.items.forEach((value: number, index: number) => {
                        if (itmLodashItem.find(itm => itm.index === value) === undefined) {
                            missed.push({
                                itemIndex: value,
                                index: index
                            });
                        }
                    });

                    missed.forEach((ms: Missed) => {
                        if (layer && layer.items) layer.items.splice(ms.itemIndex, 1);
                        if (res && res.items) res.items.splice(ms.index, 1);
                    });
                } else {
                    itmLodashItem.forEach((itld: LodashItem, index: number) => {
                        if (layer !== undefined && itld.index !== undefined) {
                            if (layer && layer.items) {
                                layer.items[itld.index] = {
                                    field: itld.key,
                                    config: itld.value
                                };
                            }
                        }
                    });
                }
            }
        }
        if (layer) layers[layerIndex] = layer;
        this.updateLayers(layers);
    }
    onChangeLayer = (name: string | number, newValue: any | null) => {
        const { value, onChange } = this.props;
        const { sortableArray } = this.state;

        if (onChange && newValue) {
            const { currentName, resultList } = this.state;
            if (resultList !== null && !sortableArray) {
                this.onChangeLayerMerge(name, newValue);
            } else {
                let selected: string = currentName;
                let layers: LayerDefinitionModel[] = [...(value as LayerDefinitionModel[])];
                let layerIndex: number = layers.findIndex((lay: LayerDefinitionModel) => lay.name === selected);
                let layer: LayerDefinitionModel | undefined = deepCopy(layers.find((lay: LayerDefinitionModel) => lay.name === selected));
                if (layer && layerIndex >= 0) {
                    let itmLodashItem: LodashItem[] = newValue;
                    layer.items = itmLodashItem.map(ld => {
                        return {
                            field: ld.key,
                            config: ld.value
                        };
                    });
                    layers[layerIndex] = layer;
                }
                this.updateLayers(layers);
            }
        }
    }

    toClone = (item: any) => {
        let clone: any = deepCopy(item);
        clone.key = 'Clone of ' + clone.key;
        return clone;
    }


    renderClose = (layers: LayerDefinitionModel[]) => {
        const { disabled, searchKeys, searchDecorators } = this.props;
        const { currentName, resultList, sortableArray } = this.state;
        let clzz: string = this.props.className ? this.props.className : '';
        let style: React.CSSProperties = this.props.style ? this.props.style : {};
        // il layer corrente/ visualizzato
        let selected: string = currentName;
        let layer: LayerDefinitionModel | undefined = layers.find((lay: LayerDefinitionModel) => lay.name === selected);
        let indexLayer: number = layers.findIndex((lay: LayerDefinitionModel) => lay.name === selected);

        // le voci del menù
        let menuValues: Array<any> = layers.map((l: LayerDefinitionModel) => l.name!);
        // le voci del bottone move
        let moveLayers: Array<any> = [];

        layers.forEach((l: LayerDefinitionModel, index: number) => {
            if (l.name && selected && selected !== l.name) moveLayers.push({ label: l.name, value: index, key: 'm-' + index });
        });
        moveLayers.unshift({ label: 'None', value: -1, key: 'm--1' });

        // creo una lista di campi/variabili a partire dalle chiavi
        let fields: Array<string> = this.getKeys(indexLayer, layers);

        let validItems: Array<LodashItem> = [];
        let alarmValue: Array<string> = [];

        if (resultList !== null && !sortableArray) {
            resultList.forEach((rl: { layerIndex: number, items: Array<number> }) => {
                if (rl.layerIndex < layers.length) {
                    let lay: LayerDefinitionModel = layers[rl.layerIndex];
                    if (lay.name) alarmValue.push(lay.name);
                    // siamo nel layer corrente
                    if (indexLayer === rl.layerIndex) {
                        if (lay.items && lay.items.length > 0) {
                            if (lay.items && rl.items.length <= lay.items.length) {
                                let layerItems: LayerFieldDefinitionModel[] = lay.items;
                                rl.items.forEach(int => {
                                    validItems.push({
                                        index: int,
                                        key: layerItems[int].field!,
                                        value: layerItems[int].config
                                    });
                                });
                            }
                        }
                    }
                }
            });
        } else {
            if (layer && layer.items && layer.items.length > 0) {
                layer.items.forEach((it, index) => {
                    validItems.push({
                        index: index,
                        key: it.field!,
                        value: it.config
                    });
                });
            }
        }


        let showAddPlus: boolean = resultList === null;

        let showLayers: boolean = validItems.length > 0;

        const newItemDefaultValue: LodashItem = { key: '' };

        return (
            <div className={clzz} style={style} >

                <MenuLayers
                    alarmValue={alarmValue}
                    selected={selected}
                    value={menuValues}
                    onSort={(oldIndex: number, newIndex: number) => this.sortLayer(oldIndex, newIndex)}
                    onSelect={(name: string) => this.setState({ currentName: name })}
                    onDelete={() => this.deleteLayer()}
                    onAdd={(name: string) => this.addLayer(name)}
                    onChange={(oldName: string, newName: string) => this.changeNameLayers(oldName, newName)}
                />

                <div style={{ display: 'flex', width: '100%', marginBottom: '10px' }}>
                    <Button
                        icon="power off"
                        size="mini"
                        color={disabled ? 'grey' : 'green'}
                        onClick={() => this.setState({ ...this.state, sortableArray: !this.state.sortableArray })}
                    />
                    <SearchLayers
                        style={{ width: '100%' }}
                        key={'SearchLayers'}
                        disabled={sortableArray || disabled}
                        listLayers={layers || []}
                        onSearched={(resultList: Array<any>) => this.setState({ ...this.state, resultList: resultList })}
                        triggerClean={<Button icon="erase" size="mini" disabled={sortableArray || disabled} style={{ marginLeft: '5px' }} />}
                    />
                </div>

                <ArrayContainer
                    
                    showRowNumber={true}
                    sortable={sortableArray}
                    defaultValue={newItemDefaultValue}
                    showAdd={showAddPlus}
                    showDelete={true}
                    value={validItems}
                    disabled={disabled}
                    name={'arrayContainer'}
                    onChange={this.onChangeLayer}
                    toClone={this.toClone}
                >
                    <ViewItem
                        disabled={sortableArray || disabled}
                        fields={fields}
                        searchKeys={searchKeys}
                        searchDecorators={searchDecorators}
                        presentLayers={!sortableArray ? moveLayers : []}
                        onMoveItemTo={this.moveItemTo}
                    />
                </ArrayContainer>

            </div>
        );
    }

    renderOpen = (layers: LayerDefinitionModel[]) => {
        // alert muove l'item dal layer x al layer y
        let nameLayerFrom: string | undefined = layers[this.tempMove.fromLayer].name;
        let nameLayerTo: string | undefined = layers[this.tempMove.toLayer].name;
        let userIndex: number = this.tempMove.itemIndex + 1;
        return (
            <Modal open={true} onClose={this.cancelMoveLayer} dimmer={'inverted'} size={'small'} closeOnDimmerClick={false}>
                <Header>
                    <Icon name="question circle outline" />{'Do you want move item' + userIndex + ' from layer ' + nameLayerFrom + ' to layer ' + nameLayerTo + '?'}
                </Header>
                <Modal.Actions>
                    <Button onClick={eventPrevent(this.confirmMoveLayer)} size="mini" color="blue">
                        <Icon name="checkmark" /> {'YES'}
                    </Button>
                    <Button onClick={eventPrevent(this.cancelMoveLayer)} size="mini" color="red" >
                        <Icon name="remove" /> {'NO'}
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }

    render() {
        const { value } = this.props;
        const { open } = this.state;
        let layers: LayerDefinitionModel[] = value as LayerDefinitionModel[];
        if (!open) return this.renderClose(layers);
        return this.renderOpen(layers);
    }
}

export const ViewImageLayers = conn.connect(ViewImageLayersCompo);



