import * as React from 'react';
import * as reducers from '../../reducers';
import { decoratorGet, decoratorUpdate, decoratorClear, cloneItem, registeredEngines } from '../../actions';
import { DecoratorModel, DecoratorSourceType } from '../../actions/model';
import { appConnector, Link } from 'app-support';
import { Segment, Menu, Table } from 'semantic-ui-react';
import { HeaderMenuWidget, dialogMenuWidget } from '../shared/MenuWidget';
import { DecoratorItem } from './DecoratorItem';
import { ConfirmWidget } from '../shared/DialogWidget';
import { JsonEditorGet } from '../shared/JsonEditorGet';
import { TableEditableWidget } from '../shared/EditableWidget';
import { Copy } from '../shared/Copy';
import { DecoratorContentEditor } from './DecoratorContentEditor';


const conn = appConnector<{ id: string, onContinue?: (where: string) => void }>()(
    (s, p) => ({
        current: reducers.getDecorator(s, p.id),
        sourceTypeList: reducers.getDecoratorEngines(s)
    }),
    {
        decoratorGet,
        decoratorClear,
        cloneItem,
        decoratorUpdate,
        registeredEngines
    }
);

export interface DecoratorEditorState {
    current?: DecoratorModel;
    editJSON: boolean;
    modified: boolean;
}

class DecoratorEditor extends conn.StatefulCompo<DecoratorEditorState> {
    args: { [type: number]: any } = {};
    oldtype: any;
    refJsonEditor: JsonEditorGet | null;

    constructor(props: any) {
        super(props);
        this.state = { current: props.current, editJSON: false, modified: false };
        if (props.current) this.updateCurrType(props.current);
    }
    componentDidMount() {
        if (window && window.scrollTo) window.scrollTo(0, 0);
        if (this.state.current === undefined) this.props.decoratorGet(this.props.id);  
        this.props.registeredEngines();
    } 
    getSnapshotBeforeUpdate(prevProps: any, prevState: DecoratorEditorState): any {
        // bisogna rilasciare uno snapshot solo quando effettivamente cambia la props current
        // e non quando passa di qui per via di un refresh dovuto allo state
        let inModified: boolean = prevState.modified !== this.state.modified || this.state.modified;
        let prevType = this.oldtype; 
        let currType = this.props.current && this.props.current.source && this.props.current.source.type;
        if (!inModified && currType && prevType !== currType) {
            this.updateCurrType(this.props.current);
            return { ...this.props.current };
        }
        return null;
    }
    componentDidUpdate(prevProps: any, prevState: DecoratorEditorState, snapshot: any ): void {
        if (snapshot !== null) {
            this.setState({ current: snapshot, modified: false });
        }
    }
   
    componentWillUnmount(): void {
        this.props.decoratorClear(this.props.id);
    }
    updateCurrType = (newItem: any) => {
        let currType = newItem.source && newItem.source.type;
        if (currType !== undefined) {
            this.oldtype = currType;
            if (newItem.source && newItem.source.args) {
                this.args[this.oldtype] = { ...(newItem.source && newItem.source.args) };
            }
        }
    }
    changeState = (newItem: DecoratorModel, modified: boolean = true) => {
        this.updateCurrType(newItem);
        this.setState({ current: newItem, modified });
    }
    onEdit = () => this.setState({ modified: false });

    onCancel = () => {
        this.args = {};
        this.oldtype = undefined;
        let currType = this.props.current && this.props.current.source && this.props.current.source.type;
        if (currType !== undefined)
            this.args[currType] = { ...(this.props.current && this.props.current.source && this.props.current.source.args) };

        this.setState({ current: this.props.current, modified: false });
    }
    
    internalSave = (item: any) => {
        if (item) {
            if (this.props.decoratorUpdate) {
                this.props.decoratorUpdate(item);
            }
            this.setState({...this.state, modified: false});
        }
    }
    onSave = () => {
        const { current, editJSON } = this.state;
        this.internalSave(editJSON ? this.getJSON() : current);
    }
    changeStateJSON = () => {
        const { modified } = this.state;
        let newState: any = {};
        newState.modified = modified;
        newState.editJSON = !this.state.editJSON;
        if (modified) {
            let json: any = this.getJSON();
            if (json) {
                this.updateCurrType(json);
                newState.current = json;
            }
        }
        this.setState({ ...this.state, ...newState });
    }
    getJSON = () => {
        if (this.refJsonEditor) {
            return this.refJsonEditor.getJson();
        }
        return null;
    }
    cloneItem = () => {
        const { current } = this.props;
        if (this.props.cloneItem && this.props.onContinue) {
            let item: DecoratorModel = current as DecoratorModel;
            let clItem: DecoratorModel = {
                name: 'Clone of ' + item.name,
                description: item.description,
                args: [...(item.args || [])],
                fields: [...(item.fields || [])],
                source: { ...(item.source || { type: DecoratorSourceType.WEBAPI }) },
                tags: [...(item.tags || [])]
            };
            this.props.cloneItem(clItem);
            this.props.onContinue('/Decorators');
        }
    }
    render() {
        const { current, editJSON, modified } = this.state;
        if (current) {
            return (
                <DecoratorContentEditor 
                    changeState={this.changeState}
                    changeStateJSON={this.changeStateJSON}
                    current={current}
                    editJSON={editJSON}
                    modified={modified}
                    cloneItem={this.cloneItem}
                    onCancel={this.onCancel}
                    onSave={this.onSave}
                    onRefJsonEditor={(r: JsonEditorGet | null) => this.refJsonEditor = r}
                    sourceTypeList={this.props.sourceTypeList}
                />
            );
        }

        return null;
    }
}

export default conn.connect(DecoratorEditor); 