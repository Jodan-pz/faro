import { ItemValue, LayerDefinitionModel } from 'src/actions/model';
import { SortableElement, SortableContainer, SortEvent, SortEventWithTag } from 'react-sortable-hoc';
import * as React from 'react';
import { Menu, Input, InputOnChangeData } from 'semantic-ui-react';

import { dialogMenuWidget } from '../../MenuWidget';

const SortableMenuContainer = SortableContainer((props: { children: any }) => {
    const { children } = props;
    return <Menu>{children}</Menu>;
});

const SortableItem = SortableElement((props: { element: any }) => {
    const { element } = props;
    return <div style={{ display: 'flex' }}>{element}</div>;
});


interface MenuLayersProps {
    selected: string;
    value: string[];
    alarmValue?: string[];
    infoDelete?: string;
    onSelect?: (name: string) => void;
    onDelete?: () => void;
    onChange?: (oldName: string, newName: string) => void;
    onSort?: (oldIndex: number, newIndex: number) => void;
    onAdd?: (name: string) => void;

}
interface MenuLayersState {
    addname: boolean;
}
export class MenuLayers extends React.Component<MenuLayersProps, MenuLayersState> {

    state = {
        addname: false
    };

    shouldComponentUpdate(nextProps: MenuLayersProps, nextState: MenuLayersState): boolean {
        const { value, selected, alarmValue, infoDelete } = this.props;
        if (
            value !== nextProps.value
            || selected !== nextProps.selected
            || alarmValue !== nextProps.alarmValue
            || infoDelete !== nextProps.infoDelete
            || this.state.addname !== nextState.addname
        ) return true;
        return false;
    }

    sortLayers = (oldIndex: number, newIndex: number) => {
        const { onSort } = this.props;
        this.setState({ addname: false }, () => {
            if (onSort) {
                onSort(oldIndex, newIndex);
            }
        });
    }
    onDeleteLayer = () => {
        const { onDelete } = this.props;
        this.setState({ addname: false }, () => {
            if (onDelete) {
                onDelete();
            }
        });
    }
    changeName = (name: string, newValue: string) => {
        const { onChange } = this.props;
        this.setState({ addname: false }, () => {
            if (onChange) {
                onChange(name, newValue);
            }
        });
    }
    addName = (nameLayer: string) => {
        this.setState({ addname: false }, () => {
            if (nameLayer) {
                const { onAdd } = this.props;
                if (onAdd) {
                    onAdd(nameLayer);
                }
            }
        });
    }

    selectName = (name: string) => {
        const { onSelect } = this.props;
        this.setState({ addname: false }, () => {
            if (onSelect) {
                onSelect(name);
            }
        });
    }



    render() {
        const { value, selected, infoDelete, alarmValue } = this.props;
        const { addname } = this.state;
        let listName: string[] = value as string[];
        let listAlarm: string[] = alarmValue || [];

        let info: string = infoDelete && infoDelete.length > 0 ? infoDelete : 'Are you sure you want delete selected layer?';
        return (
            <SortableMenuContainer
                onSortEnd={(prop: { oldIndex: number, newIndex: number }) => this.sortLayers(prop.oldIndex, prop.newIndex)}
                pressDelay={300}
                axis="x"
                lockAxis="x"
                lockToContainerEdges
                lockOffset={[0, '50%']}
                shouldCancelStart={(event: SortEvent | SortEventWithTag) => false}
            >
                {listName.map((name: string, index: number) => {

                    let inAlarm: boolean = listAlarm.find(a => a === name) !== undefined;

                    return (
                        <SortableItem
                            key={index}
                            index={index}
                            element={
                                <MenuTabItem
                                    value={name}
                                    name={name}
                                    inAlarm={inAlarm}
                                    active={name === selected && !addname}
                                    onChange={(name: string | number, newValue: any) => this.changeName(name as string, newValue)}
                                    onSelect={(name: string) => this.selectName(name)}
                                />}
                        />);
                })}


                <div style={{ display: 'flex' }}>

                    {!addname &&
                        <>
                            <Menu.Item
                                icon="plus"
                                onClick={() => this.setState({ ...this.state, addname: true })}
                            />

                            {dialogMenuWidget(true, '', this.onDeleteLayer, 'close', info)}

                        </>}

                    {addname &&
                        <>
                            <MenuInputItem
                                value={''}
                                name={'newitem'}
                                onClose={() => this.setState({ addname: false })}
                                onSave={(name: string) => this.addName(name)}
                            />
                        </>}
                </div>

            </SortableMenuContainer>);
    }
}


// ======================================================

interface MenuTabItemProps extends ItemValue<string> {
    active?: boolean;
    inAlarm?: boolean;
    onSelect?: (name: string) => void;
}
class MenuTabItem extends React.Component<MenuTabItemProps, { selected: number, down: boolean, blur: boolean, newName: string }> {
    ref: any;
    constructor(props: MenuTabItemProps) {
        super(props);
        this.state = {
            blur: false,
            down: false,
            selected: 0,
            newName: ''
        };
    }

    public componentWillReceiveProps(newProps: any): void {
        this.setState({ ...this.state, selected: newProps && newProps.active ? 1 : 0, newName: newProps.value || '' });
    }

    public componentDidUpdate(): void {
        const { selected, down, blur } = this.state;
        const { active } = this.props;
        if (selected === 1 && !active) {
            if (this.props.onSelect) this.props.onSelect(this.props.name as string || '');
        } else if (blur && !down) {
            this.setState({ ...this.state, blur: false, down: false, selected: active ? 1 : 0 });
        }
    }

    onSave = () => {
        const { active, value } = this.props;
        const { newName } = this.state;

        this.setState({ ...this.state, blur: false, down: false, selected: active ? 1 : 0 }, () => {
            if (this.props.onChange && newName && newName.length > 0) {
                this.props.onChange(this.props.name || '', newName);
            }
        });

    }
    onBlurInput = () => {
        const { value } = this.props;
        this.setState({ ...this.state, blur: true, newName: value as string });
    }

    keyDown = (ev: any) => {
        if (ev.keyCode === 13) {
            ev.preventDefault();
            this.onSave();
        }
    }
    render() {
        const { value, active, inAlarm } = this.props;
        const { selected, newName } = this.state;
        let sty: React.CSSProperties = inAlarm && !active ? { backgroundColor: 'rgba(33, 186, 69, 0.3)' } : inAlarm && active ? { backgroundColor: 'rgba(33, 186, 69, 0.8)' } : {};
        if (selected < 2) return (
            <Menu.Item
                style={sty}
                active={active}
                content={value}
                onClick={() => this.setState({ ...this.state, selected: selected + 1 })}
            />);
        return (
            <>
                <Input
                    onBlur={() => this.onBlurInput()}
                    onKeyDown={(ev: KeyboardEvent) => this.keyDown(ev)}
                    ref={(r: any) => r && r.focus && r.focus()}
                    value={newName}
                    onChange={(event: React.SyntheticEvent<HTMLInputElement>, data: InputOnChangeData) => this.setState({ ...this.state, newName: data.value })}
                >
                    <input />
                </Input>

                <Menu.Item
                    icon="save"
                    content="Save"
                    onMouseDown={(ev: any) => this.setState({ ...this.state, down: true })}
                    onClick={(ev: any) => this.onSave()}
                />
            </>);
    }
}

// ======================================================
interface MenuInputItemProps extends ItemValue<string> {
    onClose?: () => void;
    onSave?: (name: string) => void;
}

class MenuInputItem extends React.Component<MenuInputItemProps, { down: boolean, blur: boolean }> {
    newName: string;
    ref: any;

    constructor(props: MenuInputItemProps) {
        super(props);
        this.state = {
            down: false,
            blur: false
        };
    }

    onSave = () => {

        if (this.props.onSave && this.newName && this.newName.length > 0) {
            this.props.onSave(this.newName);
        } else if (this.props.onClose) {
            this.props.onClose();
        }
    }


    componentDidUpdate(): void {
        const { blur, down } = this.state;
        if (blur && !down) {
            if (this.props.onClose) {
                this.props.onClose();
            }
        }
    }
    keyDown = (ev: any) => {
        if (ev.keyCode === 13) {
            ev.preventDefault();
            this.onSave();
        }
    }
    render() {
        const { value } = this.props;

        return (
            <>
                <Input
                    onBlur={() => this.setState({ ...this.state, blur: true })}
                    ref={(r: any) => r && r.focus && r.focus()}
                    placeholder={value}
                    onKeyDown={(ev: KeyboardEvent) => this.keyDown(ev)}
                    onChange={(event: React.SyntheticEvent<HTMLInputElement>, data: InputOnChangeData) => this.newName = data.value}
                />

                <Menu.Item
                    icon="save"
                    content="Save"
                    onMouseDown={(ev: any) => this.setState({ ...this.state, down: true })}
                    onClick={() => this.onSave()}
                />
            </>);
    }
}