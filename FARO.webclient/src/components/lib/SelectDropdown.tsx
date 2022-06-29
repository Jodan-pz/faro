import * as React from 'react';
import { Button, Icon, SemanticICONS, Checkbox, CheckboxProps, List, Segment, Menu, Grid, Table } from 'semantic-ui-react';
import '../../styles/items/items.css';
import { addListener } from 'cluster';

interface SelectDropdownCompProps {

    list: Array<string>;
    onConfirm: (list: Array<string>) => void;
    onClose: () => void;
}
interface SelectDropdownCompState {
    list: Array<string>;
    selected: Array<string>;
    sort: number;
}

type DropData = {
    selected: boolean;
    name: string;
};
type Position = { top: number, left: number };

const getDropDataList = (list: Array<string>, selected: Array<string>) => {
    let result: Array<DropData> = [];
    list.forEach((item: string) => {
        result.push({
            name: item,
            selected: selected.find((s) => s === item) !== undefined
        });
    });
    return result;
};
const getSortIcon = (sort: number): SemanticICONS => {
    return sort === 0 ? 'arrows alternate horizontal' : (sort === 1 ? 'arrow up' : 'arrow down');
};
interface DropCompProps {
    dropData: DropData;
    onChange: (name: string, select: boolean) => void;
}
class DropListComp extends React.PureComponent<DropCompProps> {
    constructor(props: DropCompProps) {
        super(props);
    }
    render() {
        const { dropData, onChange } = this.props;
        return (<Checkbox label={dropData.name} checked={dropData.selected} onChange={(event: any, data: CheckboxProps) => onChange(dropData.name, !dropData.selected)} />);
    }
}

class SelectDropDownComp extends React.Component<SelectDropdownCompProps, SelectDropdownCompState> {

    private SELECTALL: string = 'Select All';
    private tempSelected: Array<string>;
    constructor(props: SelectDropdownCompProps) {
        super(props);
        let selected: Array<string> = [...props.list];
        selected.unshift(this.SELECTALL);
        this.tempSelected = [...selected];
        this.state = { selected: [...selected], list: [...selected], sort: 0 };
    }
    onConfirm = () => {
        const { onConfirm } = this.props;
        const { selected, list } = this.state;
        this.tempSelected = [...selected];
        if (onConfirm !== undefined) {
            let outSelected: Array<string> = [];
            list.forEach((item: string) => {
                if (item !== this.SELECTALL && selected.find((s) => s === item) !== undefined) {
                    outSelected.push(item);
                }
            });
            onConfirm(outSelected);
        }
    }
    onClose = () => {
        const { onClose } = this.props;
        this.setState({ ...this.state, selected: [...this.tempSelected] }, () => onClose());
    }
    changeSort = () => {
        let newList: Array<string> = [...this.props.list];
        let tempSort: number = this.state.sort;
        tempSort++;
        if (tempSort > 2) tempSort = 0;
        if (tempSort === 1) {
            newList = newList.sort();
        } else if (tempSort === 2) {
            newList = newList.sort().reverse();
        }
        newList.unshift(this.SELECTALL);
        this.setState({ ...this.state, sort: tempSort, list: newList });
    }
    onChangeDrop = (name: string, select: boolean) => {
        let selected: Array<string> = this.state.selected;

        if (select) {
            if (name === this.SELECTALL) {
                selected = [...this.props.list];
            }
            selected.push(name);
        } else {
            if (name === this.SELECTALL) {
                selected = [];
            } else {
                let index: number = selected.findIndex((s) => s === name);
                if (index >= 0) {
                    selected.splice(index, 1);
                }
            }
        }
        this.setState({ ...this.state, selected: selected });
    }

    render() {
        const { list, selected, sort } = this.state;
        let dropDataList: Array<DropData> = getDropDataList(list, selected);
        let iconName: SemanticICONS = getSortIcon(sort);

        return (

            <Segment.Group size={'small'} className={'dropShadow'}>
                <Segment>
                    <div style={{ overflow: 'auto', maxHeight: '300px' , padding: '5px'}}>
                        <List>
                            {dropDataList.map((item: DropData, index: number) => {
                                return (<List.Item key={index}><DropListComp dropData={item} onChange={(name: string, select: boolean) => this.onChangeDrop(name, select)} /></List.Item>);
                            })}
                        </List>
                    </div>
                </Segment>
                <Segment>
                    <Table celled>
                        <Table.Body>
                            <Table.Row active>
                                <Table.Cell>
                                    <Button icon onClick={() => this.changeSort()}>
                                        <Icon name={iconName} />
                                    </Button>     
                                </Table.Cell>   
                                <Table.Cell >
                                    <Button fluid color={'green'} onClick={() => { this.onConfirm(); }}>Confirm</Button>
                                </Table.Cell>
                                <Table.Cell >
                                    <Button fluid color={'blue'} onClick={() => { this.onClose(); }}> Close </Button>
                                </Table.Cell>
                            </Table.Row>
                        </Table.Body>
                    </Table>
                </Segment>
            </Segment.Group>

        );
    }
}
// ==================================

interface SelectDropdownProps {
    list: Array<string>;
    onChange: (list: Array<string>) => void;
}
interface SelectDropdownState {
    open: boolean;
}

const popModal: React.CSSProperties = {
    display: 'block',
    position: 'fixed',
    zIndex: 1000,
    width: '100%',
    height: '100%'
};

export class SelectDropDown extends React.Component<SelectDropdownProps, SelectDropdownState> {
    private position: Position;
    private maxWidth: number = 400;
   
    constructor(props: SelectDropdownProps) {
        super(props);
        this.state = { open: false };
        
    }
    onConfirm = (list: Array<string>) => {
        const { onChange } = this.props;
        if (onChange !== undefined) {
            onChange(list);
        }
        this.setState({ ...this.state, open: false });
    }
    calculatePosition = () => {
        let btn: HTMLElement | null = document.getElementById('openList');
        if (btn !== null) {
           
            let rect: DOMRect = btn.getBoundingClientRect();
            let scrollLeft: number = window.pageXOffset || document.documentElement.scrollLeft;
          //  let scrollTop: number = (window.pageYOffset || document.documentElement.scrollTop);
            this.position = { top: rect.top , left: rect.left + scrollLeft - this.maxWidth + rect.width - 5};
            
        }
    }
 
    componentDidMount() {
        this.refreshComponent();
    }
    componentWillUnmount() {
        this.removeListener(); 
    }
    
    onResize = () => {
        this.refreshComponent();
    }
    addListener = () => {
        window.addEventListener('resize', this.onResize);
        window.addEventListener('scroll', this.onResize);
        
        // on scroll
    }
    removeListener = () => {
        window.removeEventListener('resize', this.onResize);
        window.removeEventListener('scroll', this.onResize);
    }
    refreshComponent = () => {
        this.calculatePosition();
        const { open } = this.state;
        if (open) this.forceUpdate();
    }

    componentDidUpdate(prevProps: any, prevState: SelectDropdownState) {
        const { open } = this.state;
        if (open) {
            if (!prevState.open) {
                this.addListener();
                this.refreshComponent();
            }
        } else {
            this.removeListener();
        }
    }

    render() {
        const { list } = this.props;
        const { open } = this.state;
        let keycomp: string = list.length === 0 ? 'keycomp' : list.join('');
        let left: string = this.position !== undefined ? this.position.left + 'px' : '0px';
        let top: string = this.position !== undefined ? this.position.top  + 'px' : '0px';
        let visiDrop: any = open ? 'visible' : 'hidden';
        let visiBtn: any = !open ? 'visible' : 'hidden';
        let styleDrop: React.CSSProperties = { ...popModal, visibility: visiDrop, left: left, top: top, maxWidth: this.maxWidth + 'px' };
        return (
            <div id="openList"  >
                <div style={{ visibility: visiBtn }}>
                    <Button  onClick={() => this.setState({ ...this.state, open: true })}>Selected columns</Button>
                </div>
                <div style={styleDrop} >
                    <SelectDropDownComp
                        key={keycomp}
                        list={list}
                        onConfirm={(list: Array<string>) => this.onConfirm(list)}
                        onClose={() => this.setState({ ...this.state, open: false })}
                    />
                </div>
            </div>

        );
    }
}