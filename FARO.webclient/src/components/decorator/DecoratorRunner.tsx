import * as React from 'react';
import * as reducers from '../../reducers';
import { decoratorGet, decoratorClear } from '../../actions';
import { appConnector, Link } from 'app-support';
import { Segment, Form, Divider, Button, Header, Icon, Menu } from 'semantic-ui-react';
import { decorator } from '../../actions/proxy';
import * as YAML from 'yamljs';
import { Spinner } from '../shared/Spinner';
import { ResultTableView } from '../lib/ResultTableView';
import { addMessage } from '../../actions/indexMsg';
import { ArgumentModel } from 'src/actions/model';
import { MessageObject, TypeMessage } from 'src/actions/modelMsg';
import { getNewModalMessage } from 'src/reducers/messages';
import { FormRunner } from '../shared/FormRunner';
import { HeaderMenuWidget } from '../shared/MenuWidget';

const conn = appConnector<{ id: string }>()(
    (s, p) => ({
        current: reducers.getDecorator(s, p.id)
    }),
    {
        decoratorGet,
        decoratorClear,
        addMessage
    }
);

export interface DecoratorEditorState {
    args: { [key: string]: string };
    result?: any;
    yamlResult?: string;
    running: boolean;
    valid: boolean;
}

class DecoratorRunner extends conn.StatefulCompo<DecoratorEditorState> {

    private notPerformed: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = { args: {}, running: false, valid: false };
        this.notPerformed = true;
    }
    componentDidUpdate(prev: any) {
        const prevProps = this.castProps(prev);
        if (this.props.id !== prevProps.id) {
            this.props.decoratorGet(this.props.id);
        }

    }
    componentDidMount() {
        this.props.decoratorGet(this.props.id);
    }

    onChangedArgValue = (key: string, value: string) => {
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
        const {current} = this.props;
        this.notPerformed = false;
        this.refreshTitle('RUN DEC: ' + current!.name);
        this.setState({ ...this.state.args, result: undefined, running: true }, () => {
            let args: { [key: string]: string } = {};
            for (const key in this.state.args) {
                if (this.state.args.hasOwnProperty(key)) {
                    args[key] = this.state.args[key];
                }
            }
            decorator.run(this.props.id, args).then(res => {
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
        } else if (current) {
            let currargs: ArgumentModel[] = current.args || [];
            let btnDisabled: boolean = currargs.length > 0 ? !valid : false;
            return (
                <React.Fragment>
                    <HeaderMenuWidget header="DECORATOR" icon="play" disabled={false}>
                        <Menu.Item as={Link} to={`/Decorators/${current.id}/edit`} icon="edit" content="Edit" />
                    </HeaderMenuWidget> 
                    <Segment>
                        <Spinner message="Running" loading={running} />
                        <Header>{current.name} - run playground</Header>
                        <Segment>

                            {currargs.length > 0 && <FormRunner
                                key={'frunner'}
                                argumentsModel={currargs}
                                showCacheArgs={this.notPerformed}
                                valuesArgs={args}
                                onValid={(isValid: boolean) => {
                                    if (isValid !== this.state.valid) {
                                        this.setState({ ...this.state, valid: isValid });
                                    }
                                }}
                                onChangedArgValue={this.onChangedArgValue}
                            />}

                            {currargs.length === 0 && <div>Arguments empty</div>}
                        </Segment>
                        <Divider />
                        <Button disabled={btnDisabled} content="Run" icon="play" onClick={this.onRun} />

                        {result && <ResultTableView data={result} />}

                    </Segment>
                </React.Fragment >
            );
        }

        return null;
    }
}

export default conn.connect(DecoratorRunner);
