import * as React from 'react';
import { Button, Menu, Dropdown } from 'semantic-ui-react';
import { ItemValue } from '../../../actions/model';
import { SortableElement, SortableContainer, SortEvent, SortEventWithTag, SortableHandle } from 'react-sortable-hoc';
import '../../../styles/items/items.css';
import { arrayMove } from 'react-sortable-hoc';
 

const DragHandle = SortableHandle((props: { index: number }) => {

    return (<Button key={props.index} icon="move" />);
});
const SortableArrayContainer = SortableContainer((props: { children: any }) => {
    const { children } = props;
    return <div>{children}</div>;
});

const SortableItem = SortableElement((props: { cloneElement: any, showRowNumber: boolean, currentIndex: number }) => {
    const { cloneElement, currentIndex, showRowNumber } = props;
    return (
        <div key={'item-' + currentIndex} className={'arrayValueItem'}>
            <DragHandle index={currentIndex} />
            {showRowNumber && <label className={'arrayValueLabel'}>{`${currentIndex + 1}.`}</label>}
            {cloneElement}
        </div>);
});

interface ArrayContainerProps extends ItemValue<any[]> {
    alternateStyle?: Array<React.CSSProperties>;
    sortable?: boolean;
    showAdd?: boolean;
    showDelete?: boolean;
    showRowNumber?: boolean;
    defaultValue?: any;
    toClone?: (item: any) => any;
}

export class ArrayContainer extends React.Component<ArrayContainerProps, {}> {

    cloned: any = null;

    shouldComponentUpdate(nextProps: ArrayContainerProps, nextState: any): boolean {
        const { value, showAdd, showDelete, showRowNumber, defaultValue, disabled, sortable, style } = this.props;
        if (
            value !== nextProps.value
            || showAdd !== nextProps.showAdd
            || showDelete !== nextProps.showDelete
            || showRowNumber !== nextProps.showRowNumber
            || sortable !== nextProps.sortable
            || defaultValue !== nextProps.defaultValue
            || disabled !== nextProps.disabled
            || style !== nextProps.style
        ) return true;
        return false;
    }

    cloneFromIndex = (cloneIndex: number) => {
        const { value } = this.props;
        if (cloneIndex !== undefined && cloneIndex >= 0) {
            let list: any[] = value as any[];
            if (list !== undefined && list.length > 0) {
                let index: number = cloneIndex;
                if (index >= list.length) index = 0;
                let item: any = list[index];
                if (this.props.toClone) {
                    return this.props.toClone(item);
                }
                let type: string = typeof (item);
                if (type !== 'object') return item;
                return { ...list[index] };
            }
        }
        return undefined;
    }

    onDelete(indx: number): void {
        const { value: oldValue = [] } = this.props;
        let newValues = [...oldValue];
        newValues.splice(indx, 1);
        this.toParentChange(newValues);
    }
    onClone(indx: number): void {
        const { value: oldValue = [] } = this.props;
        let newValues = [...(oldValue || [])];
        let defaultVal: any = this.cloneFromIndex(indx);
        if (indx === newValues.length - 1) {
            newValues.push(defaultVal);
        } else {
            let pre: Array<any> = newValues.slice(0, indx + 1);
            let post: Array<any> = newValues.slice(indx + 1);
            pre.push(defaultVal);
            newValues = pre.concat(post);
        }
        this.toParentChange(newValues);
    }
    onAdd(indx: number): void {
        const { value: oldValue = [] } = this.props;
        let newValues = [...(oldValue || [])];
        let defaultVal: any = this.props.defaultValue;
        if (indx === newValues.length - 1) {
            newValues.push(defaultVal);
        } else {
            let pre: Array<any> = newValues.slice(0, indx + 1);
            let post: Array<any> = newValues.slice(indx + 1);
            pre.push(defaultVal);
            newValues = pre.concat(post);
        }
        this.toParentChange(newValues);
    }
    toParentChange = (value: any) => {
        if (this.props.onChange) {
            this.props.onChange(this.props.name !== undefined ? this.props.name : '', value);
        }
    }

    listenerItemChange = (indxItem: number, value: any) => {
        const { value: oldValue = [] } = this.props;
        const newValues = [...(oldValue || [])];
        newValues[indxItem] = value;
        this.toParentChange(newValues);
    }

    getItemButton = (indx: number, drawDelete: boolean, first: boolean) => {
        const { showAdd, showDelete } = this.props;
        let itemBTN: any = '';
        let btnDelete: any = !!showDelete && drawDelete ? (<Menu.Item icon="delete" onClick={() => this.onDelete(indx)} color="red" />) : '';

        let btnAdd: any = !!showAdd ? (first ? (<Menu.Item icon="add" onClick={() => this.onAdd(indx)} />) :
            (
                <Dropdown item icon={'add'}>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => this.onAdd(indx)}>New Item</Dropdown.Item>
                        <Dropdown.Item onClick={() => this.onClone(indx)}>Clone</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            )) : '';


        if (!!showDelete || !!showAdd) {
            itemBTN = (
                <div className={'arrayMenuItem'}>
                    <Menu compact >
                        {btnAdd}
                        {btnDelete}
                    </Menu>
                </div>
            );
        }
        return itemBTN;
    }

    sortLayers = (oldIndex: number, newIndex: number) => {
        const { value: oldValue = [] } = this.props;
        let newValues = [...(oldValue || [])];
        let dragaded: Array<any> = arrayMove(newValues, oldIndex, newIndex);
        this.toParentChange(dragaded);
    }

    getItemSort = (element: any, newValues: Array<any>) => {
        const { showRowNumber, disabled , alternateStyle} = this.props;
        let altStyle: Array<React.CSSProperties> = alternateStyle === undefined ? [] : alternateStyle;
        let len: number = altStyle.length;
        return (
            <SortableArrayContainer
                onSortEnd={(prop: { oldIndex: number, newIndex: number }) => this.sortLayers(prop.oldIndex, prop.newIndex)}
                pressDelay={300}
                axis="y"
                lockAxis="y"
                lockToContainerEdges
                lockOffset={['50%', 0]}
                shouldCancelStart={(event: SortEvent | SortEventWithTag) => false}
            >
                {newValues.map((val: any, indx: number) => {
                     
                    let curStyleItem: React.CSSProperties  = {};
                    if (len !== 0) {
                        curStyleItem  = altStyle[indx % len];
                    }

                    let props: ItemValue<any> = {
                        style: curStyleItem,
                        name: indx,
                        onChange: (name: string | number, newValue: any) => this.listenerItemChange(name as number, newValue),
                        value: val
                    };

                    let cloneElement: any = React.cloneElement(element, { ...(element.props || {}), ...props });

                    return (
                        <SortableItem
                            key={indx}
                            index={indx}
                            cloneElement={cloneElement}
                            currentIndex={indx}
                            showRowNumber={showRowNumber || false}
                        />);
                })}

            </SortableArrayContainer>);
    }

    copyData = (indx: number) => {
        const { value } = this.props;
        let newValues: Array<any> = value as Array<any>;
        if (indx < newValues.length) {
            let val: any = newValues[indx];
            this.cloned = typeof (val) === 'object' ? Object.assign({}, val) : val;
            // this.setState({ ...this.state, cloned: typeof (val) === 'object' ? Object.assign({}, val) : val });
        }
    }

    getItemNosort = (element: any, newValues: Array<any>) => {
        const { showRowNumber, disabled , alternateStyle} = this.props;
        let altStyle: Array<React.CSSProperties> = alternateStyle === undefined ? [] : alternateStyle;
        let len: number = altStyle.length;

        return newValues.map((val: any, indx: number) => {
            let curStyleItem: React.CSSProperties  = {};
            if (len !== 0) {
                curStyleItem  = altStyle[indx % len];
            }
            

            let props: ItemValue<any> = {
                style: curStyleItem,
                name: indx,
                onChange: (name: string | number, newValue: any) => this.listenerItemChange(name as number, newValue),
                value: val
            };
            let cloneElement: any = React.cloneElement(element, props);
            let itemBTN: any = this.getItemButton(indx, true, !(newValues.length > 0));

            return (
                <div key={'item-' + indx} className={'arrayValueItem'}>
                    {showRowNumber && <label className={'arrayValueLabel'}>{`${indx + 1}.`}</label>}

                    {cloneElement}
                    {itemBTN}
                </div>);
        });
    }

    render() {
        const { children, value, sortable } = this.props;

        let element: any = null;
        let itemChildren: any[] = React.Children.toArray(children);
        if (React.isValidElement(itemChildren[0])) {
            element = itemChildren[0];
        }
        if (element === null) return null;

        const newValues = [...(value || [])];

        let clzz: string = 'arrayValueBox ' + (this.props.className ? this.props.className : '');
        let style: React.CSSProperties = this.props.style ? this.props.style : {};

        return (
            <div key={'container'} className={clzz} style={style}>
                {!sortable && newValues && this.getItemNosort(element, newValues)}
                {sortable && newValues && this.getItemSort(element, newValues)}
                {(newValues === undefined || newValues.length === 0) && this.getItemButton(0, false, true)}
            </div>
        );
    }
}