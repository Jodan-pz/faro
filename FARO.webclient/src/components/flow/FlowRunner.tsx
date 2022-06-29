import * as React from 'react';
import * as reducers from '../../reducers';
import { flowRunnableGet, flowClear, runFlowDownload } from '../../actions';
import { appConnector, Link } from 'app-support';
import { Segment, Divider, Button, Header, Input, InputOnChangeData, Menu, Grid, Checkbox } from 'semantic-ui-react';

import { Spinner } from '../shared/Spinner';

import { addMessage } from '../../actions/indexMsg';
import { FlowItemRunModel, ArgumentModel, FlowItemImagePersisterStateModel } from '../../actions/model';
import { ArgumentValue, FlowItemRunDefinition } from 'mglib-faro.webclient/MGLib_FARO.WEBAPI';
import { TypeMessage } from 'src/actions/modelMsg';
import { FormRunner } from '../shared/FormRunner';
import { HeaderMenuWidget } from '../shared/MenuWidget';
import { withResult } from 'src/actions/proxy';
import { ImageBuildDefinition } from 'src/actions/faro_api_proxy';
import { debounce } from 'src/helper';

const conn = appConnector<{ id: string }>()(
    (s, p) => ({
        current: reducers.getFlow(s, p.id)
    }),
    {
        flowRunnableGet,
        flowClear,
        addMessage
    }
);

export interface FlowEditorState {
    imageargs: { [key: string]: string };
    writerargs: { [key: string]: string };
    keyslimit: number;
    result?: any;
    yamlResult?: string;
    running: boolean;
    validImage: boolean;
    validWriter: boolean;
    persisterFlag: boolean;
    persisterBuildStep: string;
    persisterState: FlowItemImagePersisterStateModel | undefined;
}

class FlowRunner extends conn.StatefulCompo<FlowEditorState> {

    private notPerformed: boolean = true;
    private fetchPersisterState: any = undefined;

    constructor(props: any) {
        super(props);
        this.state = {
            keyslimit: 10,
            imageargs: {},
            writerargs: {},
            running: false,
            validImage: false,
            validWriter: false,
            persisterFlag: false,
            persisterBuildStep: '',
            persisterState: undefined
        };
        this.notPerformed = true;
        this.fetchPersisterState = debounce(this._fetchPersisterState, 1000);
    }

    componentDidUpdate(prev: any) {
        const prevProps = this.castProps(prev);
        if (this.props.id !== prevProps.id) {
            this.props.flowRunnableGet(this.props.id, this._fetchPersisterState);
        }
    }

    componentDidMount() {
        this.props.flowRunnableGet(this.props.id, this._fetchPersisterState);
    }

    onChangePersisterEnabled = () => {
        const persisterFlag = !this.state.persisterFlag;
        this.setState({ ...this.state, persisterFlag });
        if (persisterFlag) this.fetchPersisterState(this.props.current);
    }

    onChangePersisterBuildStep = (event: React.SyntheticEvent<HTMLInputElement>, data: InputOnChangeData) => {
        this.setState({ ...this.state, persisterBuildStep: data.value }, () => {
            if (!this.props.current || !this.state.persisterFlag) return;
            this.fetchPersisterState(this.props.current, data.value);
        });
    }

    _fetchPersisterState = (flowRunDef: FlowItemRunDefinition | undefined, buildStep?: string) => {
        const getData = async () => {
            const ibd: ImageBuildDefinition = {
                image: { id: flowRunDef?.flow?.image },
                aggregator: { id: flowRunDef?.flow?.aggregator },
                args: flowRunDef?.imageargs,
                persister: {
                    enabled: this.state.persisterFlag,
                    buildstep: buildStep || this.state.persisterBuildStep
                }
            };
            const data = await withResult(fetch(`/api/v1/Image/persisterstate`, {
                method: 'POST',
                'body': JSON.stringify(ibd),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }).then(r => r.json()));
            return data as FlowItemImagePersisterStateModel;
        };
        getData().then(persisterState => this.setState({ persisterState }));
    }


    onChangedWriterArgValue = (key: string, value: string) => {
        this.setState({
            writerargs: { ...this.state.writerargs, [key]: value },
            result: null
        });
    }

    onChangedImageArgValue = (key: string, value: string) => {
        this.setState({
            imageargs: { ...this.state.imageargs, [key]: value }
        });
    }

    validate = () => {
        let itemRun: FlowItemRunModel = { ...this.props.current } as FlowItemRunModel;
        if (itemRun.imageargs) {
            itemRun.imageargs.forEach((val: ArgumentValue, indx: number) => {
                if (this.state.imageargs[val.name || ''] !== undefined) {
                    val.value = this.state.imageargs[val.name || ''];
                }
            });
        }
        return null;
    }
    refreshTitle = (title: any) => {
        if (document && document.title) {
            document.title = title;
        }
    }
    performRun = () => {
        this.notPerformed = false;
        this.setState({ ...this.state, result: undefined, running: true }, () => {
            let itemRun: FlowItemRunModel = { ...this.props.current } as FlowItemRunModel;

            itemRun.keyslimit = this.state.keyslimit;
            itemRun.persister = {
                enabled: this.state.persisterFlag,
                buildstep: this.state.persisterBuildStep
            };

            if (itemRun.imageargs) {
                itemRun.imageargs.forEach((val: ArgumentValue, indx: number) => {
                    if (this.state.imageargs[val.name || ''] !== undefined) {
                        val.value = this.state.imageargs[val.name || ''];
                    }
                });
            }
            if (itemRun.writerargs) {
                itemRun.writerargs.forEach((val: ArgumentValue, indx: number) => {
                    if (this.state.writerargs[val.name || ''] !== undefined) {
                        val.value = this.state.writerargs[val.name || ''];
                    }
                });
            }
            this.refreshTitle('RUN FLOW: ' + itemRun.flow!.name);
            runFlowDownload({
                flowItemRun: itemRun, callBack: (res: any) => {
                    if (!res.result && res.error) {
                        this.refreshTitle('FARO');
                        this.props.addMessage({
                            actions: [{
                                action: () => {
                                    this.setState({
                                        ...this.state,
                                        running: false
                                    });
                                }
                            }],
                            id: 'error-run',
                            modal: true,
                            stackable: false,
                            timed: false,
                            title: 'Run Error',
                            typeMessage: TypeMessage.Error,
                            message: res.error
                        });
                    } else {
                        this.refreshTitle('FARO');
                        this.setState({
                            ...this.state,
                            running: false
                        });
                    }

                }
            });
        });
    }

    onRun = () => {
        let valid: any = this.validate();
        if (valid === null) {
            this.performRun();
        } else {
            // 
        }
    }

    render() {
        const { imageargs, writerargs, persisterState, running, validImage, validWriter, persisterFlag, persisterBuildStep } = this.state;
        const { current } = this.props;

        if (!current) return null;

        const keysPreviewLimitDisabled = persisterFlag && !persisterState?.IsNew;

        let currimageargs: ArgumentModel[] = current.imageargs || [];
        let currwriterargs: ArgumentModel[] = current.writerargs || [];

        let isValidImg: boolean = currimageargs.length > 0 ? validImage : true;
        let isValidWrt: boolean = currwriterargs.length > 0 ? validWriter : true;
        let disableBtn: boolean = !(isValidImg && isValidWrt);
        // content="Edit" to={`${root}/${data.id}/edit`} icon="edit" basic color="green"

        return (
            <React.Fragment>
                <HeaderMenuWidget header="FLOW" icon="play" disabled={false}>
                    <Menu.Item as={Link} to={`/Flows/${current.flow!.id}/edit`} icon="edit" content="Edit" />
                    <Menu.Item as={Link} to={`/Flows/${current.flow!.id}/validate`} icon="certificate" content="Check" color="orange" />
                </HeaderMenuWidget>
                <Segment>
                    <Spinner message="Running" loading={running} />
                    <Header>{current.flow ? current.flow.name : ''} - run playground</Header>

                    <Segment>
                        <Header size="small">Image arguments</Header>

                        {currimageargs.length > 0 && <FormRunner
                            argumentsModel={currimageargs}
                            showCacheArgs={this.notPerformed}
                            valuesArgs={imageargs}
                            onValid={(isValid: boolean) => {
                                this.setState({ validImage: isValid });
                            }}
                            onChangedArgValue={this.onChangedImageArgValue}
                        />}

                        {currimageargs.length === 0 && <div>Empty</div>}

                    </Segment>

                    <Segment>
                        <Header size="small">Writer arguments</Header>

                        {currwriterargs.length > 0 && <FormRunner
                            argumentsModel={currwriterargs}
                            showCacheArgs={this.notPerformed}
                            valuesArgs={writerargs}
                            onValid={(isValid: boolean) => {
                                this.setState({ validWriter: isValid });
                            }}
                            onChangedArgValue={this.onChangedWriterArgValue}
                        />}

                        {currwriterargs.length === 0 && <div>Empty</div>}
                    </Segment>

                    {/* <Segment>
                            <Header size="small">Preview limit rows</Header>
                            <Input type="number" defaultValue={current.keyslimit || this.state.keyslimit} onChange={((event: React.SyntheticEvent<HTMLInputElement>, data: InputOnChangeData) => this.setState({ ...this.state, keyslimit: parseInt(data.value, 10) }))} />
                        </Segment> */}

                    <Segment>
                        <Grid columns="two">
                            <Grid.Column>
                                <Grid columns="two">
                                    <Header size="tiny" block>Persister</Header>
                                    <Grid.Column>
                                        <Header size="tiny">Enable</Header>
                                        <Checkbox id="persisterFlag" toggle checked={persisterFlag} onChange={this.onChangePersisterEnabled} />
                                    </Grid.Column>
                                    <Grid.Column>
                                        <Header size="tiny">Build step</Header>
                                        <Input type="text" defaultValue={persisterBuildStep} onChange={this.onChangePersisterBuildStep} />
                                    </Grid.Column>
                                </Grid>
                            </Grid.Column>
                            <Grid.Column>
                                <Header disabled={keysPreviewLimitDisabled} size="tiny">Preview limit rows</Header>
                                <Input disabled={keysPreviewLimitDisabled} type="number" defaultValue={current.keyslimit || this.state.keyslimit} onChange={((event: React.SyntheticEvent<HTMLInputElement>, data: InputOnChangeData) => this.setState({ ...this.state, keyslimit: parseInt(data && data.value ? data.value : '10', 10) }))} />
                            </Grid.Column>
                        </Grid>
                    </Segment>

                    <Divider />
                    <Button disabled={disableBtn} content="Run" icon="play" onClick={this.onRun} />
                </Segment>
            </React.Fragment >
        );
    }
}

export default conn.connect(FlowRunner);