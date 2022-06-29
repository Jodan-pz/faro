import * as React from 'react';
import { Segment } from 'semantic-ui-react';
import { createHideProp, alternateStyle } from 'src/components/lib/UtilLib';
import { ExcelConfig, ExcelConfigSheet, ExcelConfigSheetField, ItemValue } from '../../../../../actions/model';
import { ArrayContainerSearch } from '../../ArrayContainerSearch';
import { ExpandableContainer } from '../../ExpandableContainer';
import { InputValue } from '../../InputValue';
import { LabeledContainerItem } from '../../LabeledContainer';
import { OpenableRow } from '../../OpenableRow';
import { TextAreaItem } from '../../TextAreaItem';
import { MenuLayers } from '../MenuLayers';


interface ExcelEditorProps extends ItemValue<any> {
}

export class ExceldEditor extends React.Component<ExcelEditorProps, {}> {
    listenerItemChange = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            let item: any = { ...this.props.value, [name]: newValue };
            this.props.onChange(this.props.name !== undefined ? this.props.name : '', item);
        }
    }

    render() {
        const { value, disabled } = this.props;
        let excel: ExcelConfig = value as ExcelConfig;
        let style: React.CSSProperties = {};

        return (
            < >
                <div style={{ width: '100%', display: 'flex', margin: '0px' }}>
                    <LabeledContainerItem
                        style={{ ...style }}
                        label={'Culture: '}
                        value={excel && excel.culture || ''}
                        name={'culture'}
                        disabled={disabled}
                        onChange={this.listenerItemChange}
                    >
                        <InputValue />
                    </LabeledContainerItem>

                    <LabeledContainerItem
                        style={{ ...style }}
                        label={'Template: '}
                        value={excel && excel.template || ''}
                        name={'template'}
                        disabled={disabled}
                        onChange={this.listenerItemChange}
                    >
                        <InputValue />
                    </LabeledContainerItem>

                </div>

                <LabeledContainerItem
                    style={{ ...style }}
                    label={'Sheet: '}
                    value={excel && excel.sheets || []}
                    name={'sheets'}
                    disabled={disabled}
                    onChange={this.listenerItemChange}
                >
                    <ExcelSheetsList />
                </LabeledContainerItem>
            </>
        );
    }
}

interface ExcelSheetsListProps extends ItemValue<any> {
}
interface ExcelSheetsListState {
    currentName: string;
}
class ExcelSheetsList extends React.Component<ExcelSheetsListProps, ExcelSheetsListState> {
    state = { currentName: '' };

    shouldComponentUpdate(nextProps: ExcelSheetsListProps, nextState: ExcelSheetsListState): boolean {
        const { value, disabled, style } = this.props;
        if (
            value !== nextProps.value
            || disabled !== nextProps.disabled
            || style !== nextProps.style
            || this.state.currentName !== nextState.currentName
        ) return true;
        return false;
    }

    componentDidMount(): void {
        this.didUpdate();
    }
    componentDidUpdate(): void {
        this.didUpdate();
    }

    didUpdate = () => {
        const { currentName } = this.state;
        const { value } = this.props;
        let list: ExcelConfigSheet[] = value as ExcelConfigSheet[];
        if (currentName.length === 0 && list.length > 0) {
            this.setState({ currentName: list[0].name! });
        }
    }


    updateLayers = (newValue: any) => {
        if (this.props.onChange) {
            this.props.onChange(this.props.name || '', newValue);
        }
    }
    sortLayer = (oldIndex: number, newIndex: number) => {
        const { value } = this.props;
        let list: ExcelConfigSheet[] = [...(value as ExcelConfigSheet[])];
        let layerOld: ExcelConfigSheet = list[oldIndex];
        let layerNew: ExcelConfigSheet = list[newIndex];
        list[oldIndex] = layerNew;
        list[newIndex] = layerOld;
        this.updateLayers(list);
    }

    deleteLayer = () => {
        const { value } = this.props;
        const { currentName } = this.state;
        let newSelected: string = '';
        let list: ExcelConfigSheet[] = [...(value as ExcelConfigSheet[])];
        for (let i: number = 0; i < list.length; i++) {
            if (list[i].name === currentName) {
                list.splice(i, 1);
                if (i > 0) newSelected = list[i - 1].name!;
                else if (i === 0 && list.length > 0) newSelected = list[0].name!;
                else newSelected = '';
                break;
            }
        }
        this.setState({ currentName: newSelected }, () => {
            this.updateLayers(list);
        });
    }

    changeNameLayers = (oldName: string, newName: string) => {
        const { value } = this.props;
        let layers: ExcelConfigSheet[] = [...(value as ExcelConfigSheet[])];
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
            let layers: ExcelConfigSheet[] = [...(value as ExcelConfigSheet[])];
            let itm: ExcelConfigSheet = {
                name: name,
                startRow: undefined,
                rowStyle: undefined,
                fields: []
            };
            layers.push(itm);
            this.updateLayers(layers);
        });
    }
    changeLayer = (name: string | number, newValue: any) => {
        const { value } = this.props;
        const { currentName } = this.state;
        let layers: ExcelConfigSheet[] = [...(value as ExcelConfigSheet[])];
        for (let i: number = 0; i < layers.length; i++) {
            if (layers[i].name === currentName) {
                let item: any = { ...layers[i], [name]: newValue };
                layers[i] = item;
                break;
            }
        }
        this.updateLayers(layers);
    }


    render() {
        const { value, disabled } = this.props;
        const { currentName } = this.state;
        let list: ExcelConfigSheet[] = value as ExcelConfigSheet[];
        let sheet: ExcelConfigSheet | undefined = list.find((lay: ExcelConfigSheet) => lay.name === currentName);
        let style: React.CSSProperties = {  };
        let valuesMenu: Array<string> = list.map((l: ExcelConfigSheet) => l.name!);
        let startRow: number | undefined = sheet && sheet.startRow;
        let rowStyle: number | undefined = sheet && sheet.rowStyle;

        // console.log('render render');

        return (
            <Segment key={currentName + ' ' + valuesMenu.length}>
                <MenuLayers
                    selected={currentName}
                    infoDelete={'Are you sure you want delete selected sheet?'}
                    value={valuesMenu}
                    onSort={(oldIndex: number, newIndex: number) => this.sortLayer(oldIndex, newIndex)}
                    onSelect={(name: string) => this.setState({ currentName: name })}
                    onDelete={() => this.deleteLayer()}
                    onAdd={(name: string) => this.addLayer(name)}
                    onChange={(oldName: string, newName: string) => this.changeNameLayers(oldName, newName)}
                />

                {currentName && currentName.length > 0 &&
                    < >
                        <div style={{ width: '100%', display: 'flex', margin: '0px' }}>
                            <LabeledContainerItem
                                label={'Start Row: '}
                                style={{ ...style }}
                                value={startRow}
                                name={'startRow'}
                                disabled={disabled}
                                onChange={this.changeLayer}
                            >
                                <InputValue
                                    type={'number'}
                                />
                            </LabeledContainerItem>

                            <LabeledContainerItem
                                label={'Row Style: '}
                                style={{ ...style }}
                                value={rowStyle}
                                name={'rowStyle'}
                                disabled={disabled}
                                onChange={this.changeLayer}
                            >
                                <InputValue
                                    type={'number'}
                                />
                            </LabeledContainerItem>

                        </div>

                        <LabeledContainerItem 
                            style={{textAlign: 'center'}} 
                            labelColor={'green'} 
                            label={'Fields'}
                            name={'fields'}
                            disabled={disabled}
                            value={sheet && sheet.fields || []}
                            onChange={this.changeLayer}
                        >
                             <ExcelSheetField/>
                        </LabeledContainerItem>
                    </ >
                }
            </Segment>
        );
    }
}

interface ExcelSheetFieldProps extends ItemValue<any> {
}
class ExcelSheetField extends React.Component<ExcelSheetFieldProps, {}> {

    shouldComponentUpdate(nextProps: ExcelSheetFieldValueProps, nextState: any): boolean {
        const { value, disabled, style } = this.props;
        if (
            value !== nextProps.value
            || disabled !== nextProps.disabled
            || style !== nextProps.style
        ) return true;
        return false;
    }

    listenerItemChange = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            // let item: any = { ...this.props.value, [name]: newValue };
            this.props.onChange(this.props.name !== undefined ? this.props.name : '', newValue);
        }
    }
    render() {
        const { value, disabled } = this.props;
        return (
            
                <ArrayContainerSearch
                    alternateStyle={alternateStyle()}
                    key={'ArrayContainerSearch'}
                    showRowNumber
                    showAdd
                    showDelete
                    defaultValue={{}}
                    value={value || []}
                    disabled={disabled}
                    name={'tags'}
                    toClone={(item: any) => {
                        return { ...item, name: 'clone of ' + item.name };
                    }}
                    onChange={this.listenerItemChange}
                >
                    <ExcelSheetFieldValue />
                </ArrayContainerSearch>
        );
    }
}

interface ExcelSheetFieldValueProps extends ItemValue<any> {
}
interface ExcelSheetFieldValueState extends ItemValue<any> {
    open: boolean;
}
class ExcelSheetFieldValue extends React.Component<ExcelSheetFieldValueProps, ExcelSheetFieldValueState> {
    state = { open: false };

    shouldComponentUpdate(nextProps: ExcelSheetFieldValueProps, nextState: ExcelSheetFieldValueState): boolean {
        const { value, disabled, style } = this.props;
        if (
            value !== nextProps.value
            || disabled !== nextProps.disabled
            || style !== nextProps.style
            || this.state.open !== nextState.open
        ) return true;
        return false;
    }

    listenerItemChange = (name: string | number, newValue: any) => {
        if (this.props.onChange) {
            let item: any = { ...this.props.value, [name]: newValue };
            this.props.onChange(this.props.name !== undefined ? this.props.name : '', item);
        }
    }


    render() {
        const { value, disabled , style} = this.props;
        let field: ExcelConfigSheetField = value as ExcelConfigSheetField;

        let msg: any = createHideProp(field, ['name', 'when', 'type']);

        return (
            <OpenableRow columns={3} message={msg} style={style}>

                <LabeledContainerItem labelPosition={'left'} label={'Name:'} value={field && field.name || undefined} name={'name'} onChange={this.listenerItemChange} disabled={disabled}>
                    <ExpandableContainer>
                        <InputValue />
                        <TextAreaItem />
                    </ExpandableContainer>
                </LabeledContainerItem>

                <LabeledContainerItem labelPosition={'left'} label={'When:'} value={field && field.when || undefined} name={'when'} onChange={this.listenerItemChange} disabled={disabled} >
                    <ExpandableContainer>
                        <InputValue />
                        <TextAreaItem />
                    </ExpandableContainer>
                </LabeledContainerItem>

                <LabeledContainerItem labelPosition={'left'} label={'Type:'} value={field && field.type || undefined} name={'type'} onChange={this.listenerItemChange} disabled={disabled}>
                    <InputValue />
                </LabeledContainerItem>

                <LabeledContainerItem labelPosition={'left'} label={'Column:'} value={field && field.column || undefined} name={'column'} onChange={this.listenerItemChange} disabled={disabled}>
                    <InputValue type={'number'} placeholder={'...'} />
                </LabeledContainerItem>

                <LabeledContainerItem labelPosition={'left'} label={'RowOffset:'} value={field && field.rowOffset || undefined} name={'rowOffset'} onChange={this.listenerItemChange} disabled={disabled}>
                    <InputValue type={'number'} placeholder={'...'} />
                </LabeledContainerItem>

                <LabeledContainerItem labelPosition={'left'} label={'FieldProgPrependFormat:'} value={field && field.fieldProgPrependFormat || undefined} name={'fieldProgPrependFormat'} onChange={this.listenerItemChange} disabled={disabled}>
                    <ExpandableContainer>
                        <InputValue />
                        <TextAreaItem />
                    </ExpandableContainer>
                </LabeledContainerItem>

                <LabeledContainerItem labelPosition={'left'} label={'Description:'} value={field && field.description || undefined} name={'description'} onChange={this.listenerItemChange} disabled={disabled}>
                    <ExpandableContainer>
                        <InputValue />
                        <TextAreaItem />
                    </ExpandableContainer>
                </LabeledContainerItem>

            </OpenableRow>

        );
    }
}



