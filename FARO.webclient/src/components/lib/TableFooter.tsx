import * as React from 'react';
import { Button, Icon, Input, InputOnChangeData, Label } from 'semantic-ui-react';
import { StyleItem } from 'mildev-react-table';



interface TableFooterProps {
    selectIndex: number;
    totalPages: number;
    totalData: number;
    onChangeIndex: (newIndex: number) => void;
}

interface TableFooterState {
    selectIndex: number;
    totalPages: number;
}

export default class TableFooter extends React.Component<TableFooterProps, TableFooterState> {


    constructor(props: TableFooterProps) {
        super(props);
        this.state = { selectIndex: props.selectIndex, totalPages: props.totalPages };
    }
    componentWillReceiveProps(nextProps: TableFooterProps): void {
        this.setState({ selectIndex: nextProps.selectIndex, totalPages: nextProps.totalPages });
    }
    clickButton = (n: number) => {
        const { selectIndex } = this.state;
        this.changeIndex(selectIndex + n);
    }
    changeIndex = (page: number) => {
        if (this.props.onChangeIndex) {
            this.props.onChangeIndex(page);
        }
    }

    keyPress = (ev: any) => {
        const { charCode } = ev;
        if (charCode === 13) {
            ev.preventDefault();
            let newIndex: number = this.state.selectIndex <= 1 ? 1 : (this.state.selectIndex > this.state.totalPages ? this.state.totalPages : this.state.selectIndex);
            this.changeIndex(newIndex);
        }
    }

    onChangeInput = (value: any) => {
        let select: number = -1;
        if (value && (value as string).length > 0) {
            select = parseInt(value, 10);
        }
        this.setState({ ...this.state, selectIndex: select });
    }
    getInfo = () => {
        let indx: any = this.state.selectIndex !== -1 ? this.state.selectIndex : '';
        return (
            <Input
                onKeyPress={this.keyPress}
                style={{ width: '80px', marginRight: '5px' }}
                type={'number'}
                value={indx}
                onChange={(event: React.SyntheticEvent<HTMLInputElement>, data: InputOnChangeData) => this.onChangeInput(data.value)}
            >
                <input />
            </Input>);
    }

    buttonFooter = (label: string) => {
        const { totalPages, selectIndex } = this.props;

        let isLeft: boolean = label === 'left';
        let disabledLeft: boolean = selectIndex === 1;
        let disabledRight: boolean = selectIndex === totalPages;
        let styles: StyleItem = disabledLeft ? {
            className: 'footer-button-disabled',
            style: { marginRight: '5px', width: '120px' }
        } : {
                className: 'footer-button',
                style: { marginRight: '5px', width: '120px' }
            };
        let remain: number = isLeft ? selectIndex - 1 : totalPages - selectIndex;
        let labelPosition: 'right' | 'left' = isLeft ? 'left' : 'right';
        return (
            <Button
                key={label}
                color="blue"
                disabled={isLeft ? disabledLeft : disabledRight}
                className={styles.className}
                style={styles.style}
                onClick={(ev: any) => this.clickButton(isLeft ? -1 : 1)}
                icon
                labelPosition={labelPosition}
            >
                <Icon name={isLeft ? 'angle left' : 'angle right'} />
                {remain}
            </Button>
        );
    }
    render() {
        const { totalPages, totalData } = this.props;
        if (totalPages > 0) {
            let leftButton: any = this.buttonFooter('left');
            let rightButton: any = this.buttonFooter('right');
            let info: any = this.getInfo();
            return (
                <div style={{ display: 'flex', padding: '5px' }}>
                    {leftButton}
                    {info}
                    {rightButton}

                    <Label as="a" color="blue" style={{ marginTop: 'auto', marginBottom: 'auto' }}>
                        Total Pages:
                        <Label.Detail>{totalPages}</Label.Detail>
                    </Label>

                    <Label as="a" color="blue" style={{ marginTop: 'auto', marginBottom: 'auto' }}>
                        Total rows:
                        <Label.Detail>{totalData}</Label.Detail>
                    </Label>

                </div>);
        }
        return '';
    }
}