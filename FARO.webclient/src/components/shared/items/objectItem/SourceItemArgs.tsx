import { appConnector } from 'app-support';
import * as React from 'react';
import * as lodash from 'lodash';
import { Table, Icon, Popup } from 'semantic-ui-react';
import { InputValue } from '../InputValue';
import * as reducers from '../../../../reducers';
import { getDecoratorsArgs, getKeysIteratorArgs } from '../../../../actions';
import { ItemValue, ArgumentModel, KeysIteratorSourceType } from '../../../../actions/model';
import { SQLEditorWidget } from '../../SQLEditorWidget';
import { cloneObject } from '../../../../components/Utils';



interface SourceItemArgsProps extends ItemValue<any> {
    type: string;
    isDecorator: boolean;
}
interface SourceItemArgsState {
    args: ArgumentModel[];
}
const conn = appConnector<SourceItemArgsProps>()(
    (s, p) => ({
        decArgs: reducers.selectDecoratorsArgs(s),
        lastDecType: reducers.getLastDecoratorsType(s),
        lastKeysType: reducers.getLastKeysIteratorType(s),
        keyArgs: reducers.selectKeysIteratorArgs(s)
    }),
    {
        getDecoratorsArgs,
        getKeysIteratorArgs
    }
);


class SourceItemArgs extends conn.StatefulCompo<SourceItemArgsState> {
    constructor(props: any) {
        super(props);
        this.state = {args: props.isDecorator ? props.decArgs :  props.keyArgs};
    }
    componentDidMount(): void {
        const { type } = this.props;
        this.loadType(type);
    }
    
    getSnapshotBeforeUpdate(prevProps: any, prevState: SourceItemArgsState): any {
        let prevargs = prevProps.isDecorator ? prevProps.decArgs :  prevProps.keyArgs;
        let currargs = this.props.isDecorator ? this.props.decArgs :  this.props.keyArgs;
        if (currargs && prevargs !== currargs) {
            return currargs;
        }
        return null;
    }
    componentDidUpdate(prevProps: any, prevState: SourceItemArgsState, snapshot: any): void {
        let lastType: string | undefined = this.props.isDecorator ? this.props.lastDecType : this.props.lastKeysType;
        if ( lastType && this.props.type !== lastType) {
            this.loadType(this.props.type );
        } else {
            if (snapshot) {
                this.setState({args: snapshot});
            }
        }
    } 
    loadType = (ty: string) => {
        if (ty) { 
            if (!this.props.isDecorator) this.props.getKeysIteratorArgs(ty);
            else this.props.getDecoratorsArgs(ty);
        }
    }
    
    changeArgValue = (name: string | number, newValue: any) => {
        const { value } = this.props;
        if (this.props.onChange) {
            let item: any = cloneObject(value, name as string, newValue);
            this.props.onChange(this.props.name || '', item);
        }
    }

    getInputComponent = (type: string, name: string, value: any) => {
        if (name === 'sqlBody') {
            return (<SQLEditorWidget name={name} item={value} onChange={this.changeArgValue} />);
        }
        if (type === KeysIteratorSourceType.EXCEL && name === 'where') {
            return (
                <div style={{ width: '100%', display: 'flex' }}>
                    <InputValue value={value} name={name} onChange={this.changeArgValue} />
                    <Popup
                        trigger={<div style={{ margin: 'auto' }}>
                            <Icon size="big" name="info circle" style={{ marginTop: 'auto', marginBottom: 'auto', marginLeft: '5px' }} />
                        </div>}
                        content={<div style={{ minWidth: '280px' }}><span>formatDate(dateToFormat|format)</span><br /><span>formatNumber(numberToFormat|format)</span> </div>}
                    />
                </div>
            );
        }
        return <InputValue value={value} name={name} onChange={this.changeArgValue} />;
    }

    render() {
        const { value,  type } = this.props;
        const {  args } = this.state;
        let elements: any = undefined;
        // prendo le chiavi
        let keysObj: string[] = lodash.keys(value);
        if (args && type ) {
            elements = args.map((desc: ArgumentModel, index: number) => {
                let name: string | undefined = desc.name;
                let description: string = desc.description || '';
                if (name) {
                    let thereIs: boolean = keysObj.find(k => k === name) !== undefined;
                    let val: any = thereIs ? value[name] : '';
                    let inputComponent: any = this.getInputComponent(type, name, val);
                    return (
                        <Table.Row key={'args' + index}>
                            <Table.Cell width="2" textAlign="right" >{name}:</Table.Cell>
                            <Table.Cell>{inputComponent}</Table.Cell>
                            <Table.Cell width="2" textAlign="left">{description}</Table.Cell>
                        </Table.Row>
                    );
                }
                return '';
            });
        }

        if (elements === undefined || elements.length === 0) return null;

        return (
            <Table style={{ width: '100%', marginTop: '0px' }}>
                <Table.Body>
                    {elements}
                </Table.Body>
            </Table>
        );
    }
}


export default conn.connect(SourceItemArgs); 