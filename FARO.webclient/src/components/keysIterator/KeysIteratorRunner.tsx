import * as React from 'react';
import * as reducers from '../../reducers';
import { keysIterator } from '../../actions/proxy';
import { appConnector, Link } from 'app-support';
import { keysIteratorGet, setCacheRunArg } from '../../actions';
import { Segment, Header, Form, Button, Menu, Icon, Input, InputOnChangeData } from 'semantic-ui-react';
import { Spinner } from '../shared/Spinner';
import { ResultTableView } from '../lib/ResultTableView';
import { ArgumentModel, KeysIteratorRunDefinitionModel } from '../../actions/model';
import { addMessage } from '../../actions/indexMsg';
import { MessageObject, TypeMessage } from 'src/actions/modelMsg';
import { getNewModalMessage } from 'src/reducers/messages';
import { FormRunner } from '../shared/FormRunner';
import { HeaderMenuWidget } from '../shared/MenuWidget';

const conn = appConnector<{ id: string }>()(
    (s, p) => ({
        current: reducers.getKeysIterator(s, p.id),
    }),
    {
        keysIteratorGet,
        addMessage
    }
);

export interface KeysIteratorRunnerState {
    args: any;
    keyslimit: number;
    result?: any;
    running: boolean;
    valid: boolean;
}

class KeysIteratorRunnerComp extends conn.StatefulCompo<KeysIteratorRunnerState> {

    private notPerformed: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = { args: {}, running: false, keyslimit: 10, valid: false };
        this.notPerformed = true;
    }

    componentDidUpdate(prev: any) {
        const prevProps = this.castProps(prev);
        if (this.props.id !== prevProps.id) {
            this.props.keysIteratorGet(this.props.id);
        }

    }

    componentDidMount() {
        this.props.keysIteratorGet(this.props.id);
    }



    onChangedArgValue = (key: string, value: any) => {
        this.setState({
            ...this.state,
            args: { ...this.state.args, [key]: value }
        });
    }
    refreshTitle = (title: any) => {
        if (document && document.title) {
            document.title = title;
        }
    }
    onRun = () => {
        const { current } = this.props;
        this.notPerformed = false;
        this.setState({ ...this.state.args, result: undefined, running: true }, () => {
            let runModel: KeysIteratorRunDefinitionModel = { keyslimit: this.state.keyslimit };
            runModel.args = [];
            for (const key in this.state.args) {
                if (this.state.args.hasOwnProperty(key)) {
                    const element = this.state.args[key];
                    runModel.args.push({ name: key, value: element, optional: false });
                }
            }
            this.refreshTitle('RUN KEYS: ' + current!.name);
            keysIterator.run(this.props.id, runModel).then(res => {
                this.refreshTitle('FARO');
                this.setState({
                    result: res,
                    running: false
                });
            }).catch(err => {
                this.refreshTitle('FARO');
                this.setState({
                    result: {
                        ERROR: err
                    },
                    running: false
                });
            });
        });
    }

    render() {
        const { args, result, running, valid } = this.state;
        const { current } = this.props;
        if (result && !result.Status && result.Errors && result.Errors.length > 0) {
            let Errors: Array<any> = result.Errors || [];
            let message: MessageObject = getNewModalMessage(TypeMessage.Error, false, Errors[0].Message, 'Sorry, there were some errors');
            message.actions = [{
                action: () => {
                    this.notPerformed = true;
                    this.setState({ ...this.state, result: null, args: {} });
                }
            }];
            this.props.addMessage(message);
        } else if (current && current.name) {
            let currargs: ArgumentModel[] = current.args || [];
            let btnDisabled: boolean = currargs.length > 0 ? !valid : false;
            return (
                <React.Fragment>
                    <HeaderMenuWidget header="KEYS ITERATOR" icon="play" disabled={false}>
                        <Menu.Item as={Link} to={`/KeysIterator/${current.id}/edit`} icon="edit" content="Edit" />
                    </HeaderMenuWidget>
                    <Segment>
                        <Spinner message="Running" loading={running} />
                        <Header>{current.name} - run playground</Header>

                        <FormRunner
                            argumentsModel={currargs}
                            showCacheArgs={this.notPerformed}
                            valuesArgs={args}
                            onValid={(isValid: boolean) => {
                                if (isValid !== this.state.valid) {
                                    this.setState({ ...this.state, valid: isValid });
                                }
                            }}
                            onChangedArgValue={this.onChangedArgValue}
                        />

                        <Segment>
                            <Header size="small">Preview limit rows</Header>
                            <Input type="number" defaultValue={this.state.keyslimit} onChange={((event: React.SyntheticEvent<HTMLInputElement>, data: InputOnChangeData) => this.setState({ ...this.state, keyslimit: parseInt(data.value, 10) }))} />
                        </Segment>

                        <Button disabled={btnDisabled} style={{ marginTop: '5px' }} content="Run" icon="play" onClick={this.onRun} />

                        {result && <ResultTableView data={result} />}


                    </Segment>
                </React.Fragment >
            );
        }

        return null;
    }

}

export const KeysIteratorRunner = conn.connect(KeysIteratorRunnerComp);