import * as React from 'react';
import * as reducers from '../../reducers';
import { image, withResult } from '../../actions/proxy';
import { imageRunnableGet, decoratorClear } from '../../actions';
import { addMessage } from '../../actions/indexMsg';
import { appConnector, Link } from 'app-support';
import { Segment, Header, Button, Input, Checkbox, InputOnChangeData, Menu, Label, Form, Grid } from 'semantic-ui-react';
import { Spinner } from '../shared/Spinner';
import { ArgumentModel, FlowItemImagePersisterStateModel, ImageBuildModel } from '../../actions/model';
import { ArgumentValue, ImageBuildDefinition } from 'mglib-faro.webclient/MGLib_FARO.WEBAPI';
import { ResultTableImage } from '../lib/ResultTableImage';
import { MessageObject, TypeMessage } from 'src/actions/modelMsg';
import { getNewModalMessage } from 'src/reducers/messages';
import { FormRunner } from '../shared/FormRunner';
import { HeaderMenuWidget } from '../shared/MenuWidget';
import FlowDropAggregator from '../flow/FlowDropAggregator';
import FlowDropValidator from '../flow/FlowDropValidator';
import { debounce } from 'src/helper';
import { ImageBuildDefinition as IBD } from 'src/actions/faro_api_proxy';

const conn = appConnector<{ id: string }>()(
    (s, p) => ({
        current: reducers.getItem(s, p.id)
    }),
    {
        imageRunnableGet,
        decoratorClear,
        addMessage
    }
);

export interface ImageRunnerState {
    args: any;
    result?: any;
    running: boolean;
    valid: boolean;
    keyslimit: number;
    checkBoxFlag: boolean;
    persisterFlag: boolean;
    persisterBuildStep: string;
    persisterState: FlowItemImagePersisterStateModel | undefined;
    aggregator?: string;
    validator?: string;
}

class ImageRunnerComp extends conn.StatefulCompo<ImageRunnerState> {

    private notPerformed: boolean = true;
    private enablewatchResult: boolean = false;
    private fetchPersisterState: any = undefined;

    constructor(props: any) {
        super(props);
        this.state = {
            args: {}, running: false, checkBoxFlag: false,
            keyslimit: 10, valid: false,
            aggregator: this.props.current?.aggregator?.id,
            validator: this.props.current?.validator?.id,
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
            this.props.imageRunnableGet(this.props.id, this._fetchPersisterState);
        }
    }

    componentDidMount() {
        if (this.props.id) this.props.imageRunnableGet(this.props.id, this._fetchPersisterState);
    }

    onChangePersisterEnabled = () => {
        const persisterFlag = !this.state.persisterFlag;
        this.setState({ ...this.state, persisterFlag });
        if (persisterFlag && this.props.current) this.fetchPersisterState(this.props.current);
    }

    onChangePersisterBuildStep = (event: React.SyntheticEvent<HTMLInputElement>, data: InputOnChangeData) => {
        this.setState({ ...this.state, persisterBuildStep: data.value }, () => {
            if (!this.props.current || !this.state.persisterFlag) return;
            this.fetchPersisterState(this.props.current, data.value);
        });
    }

    updatePersisterState = () => {
        if (!this.props.current || !this.state.persisterFlag) return;
        this.fetchPersisterState(this.props.current);
    }

    _fetchPersisterStatPromise = (ibd: IBD) => {
        return withResult(fetch(`/api/v1/Image/persisterstate`, {
            method: 'POST',
            'body': JSON.stringify(ibd),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then(r => r.json())) as Promise<FlowItemImagePersisterStateModel>;
    }

    _fetchPersisterState = (imageBuildDef: ImageBuildDefinition | undefined, buildStep?: string) => {
        const persister = {
            enabled: this.state.persisterFlag,
            buildstep: buildStep || this.state.persisterBuildStep
        };
        const aggregator = this.props.current?.availableaggregators?.find(aggr => aggr.id === this.state.aggregator);
        const validator = this.props.current?.availablevalidators?.find(val => val.id === this.state.validator);
        const getData = async () => {
            const ibd: IBD = (
                {
                    ...imageBuildDef,
                    persister,
                    aggregator,
                    validator
                });
            return this._fetchPersisterStatPromise(ibd);
        };
        getData().then(persisterState => this.setState({ persisterState }));
    }

    onChangedArgValue = (key: string, value: string) => {
        this.setState({
            ...this.state,
            args: { ...this.state.args, [key]: value },
        }, this.updatePersisterState);
    }

    refreshTitle = (title: any) => {
        if (document && document.title) {
            document.title = title;
        }
    }

    performRun = () => {
        let builder: ImageBuildModel = { ...this.props.current };
        builder.keyslimit = this.state.keyslimit;
        builder.enablewatch = this.state.checkBoxFlag;
        builder.persister = {
            enabled: this.state.persisterFlag,
            buildstep: this.state.persisterBuildStep
        };
        builder.aggregator = this.props.current?.availableaggregators?.find(aggr => aggr.id === this.state.aggregator);
        builder.validator = this.props.current?.availablevalidators?.find(val => val.id === this.state.validator);
        this.enablewatchResult = this.state.checkBoxFlag;
        if (builder.args) {
            builder.args.forEach((val: ArgumentValue, indx: number) => {
                if (this.state.args[val.name || ''] !== undefined) {
                    val.value = this.state.args[val.name || ''];
                }
            });
        }

        this.refreshTitle('BUILD IMG: ' + builder.image!.name);

        image.build(builder as ImageBuildDefinition).then(res => {
            this._fetchPersisterStatPromise(builder).then((persisterState) => {
                this.setState({
                    result: res,
                    running: false,
                    persisterState
                }, () => {
                    this.refreshTitle('FARO');
                });
            });

        }).catch(err => {
            this.setState({
                result: err,
                running: false
            }, () => {
                this.refreshTitle('FARO');
            });
        });

    }

    onRun = () => {
        if (this.props.current !== undefined) {
            this.notPerformed = false;
            this.setState({ ...this.state.args, result: undefined, running: true }, this.performRun);
        }
    }

    readError = (result: any) => {

        if (result && !result.Status && result.Errors && result.Errors.length > 0) {
            let Errors: Array<any> = result.Errors || [];
            return getNewModalMessage(TypeMessage.Error, false, Errors[0].Message, 'Sorry, there were some errors');
        } else if (result && result.isSwaggerException) {
            return getNewModalMessage(TypeMessage.Error, false, result.ERROR.message, 'Sorry, there were some errors');
        }

        return null;
    }

    render() {
        const { args, result, running, checkBoxFlag, persisterFlag, persisterBuildStep, persisterState, valid } = this.state;
        const { current } = this.props;
        let message: MessageObject | null = this.readError(result);

        // console.log(persisterState, current);

        const keysPreviewLimitDisabled = persisterFlag && !persisterState?.IsNew;
        const imageWatchEnabled = !persisterFlag || (current?.image?.layers?.length && persisterState) && (
            persisterState.IsNew ||
            (
                (persisterState.LayerStepRequested && persisterState.LayerStepName &&
                    persisterState.Layers?.indexOf(persisterState.LayerStepName) !== -1) ||
                !persisterState.RowsExists
            )
        );
        const validatorEnabled = !persisterFlag || persisterState && (
            persisterState.IsNew ||
            (
                (persisterState.LayerStepRequested || persisterState.RowStepRequested) ||
                !persisterState.LayerStepRequested &&
                !persisterState.RowStepRequested &&
                !persisterState.AggregationStepRequested
                && !persisterState.AggregationExists
            ) || persisterState.AggregationStepRequested
        );

        if (message !== null) {
            message.actions = [{
                action: () => {
                    this.notPerformed = true;
                    this.setState({ ...this.state, result: null, args: {} });
                }
            }];
            this.props.addMessage(message);
        } else if (current && current.image && current.image.name) {

            let styleSegment: React.CSSProperties = {
                maxHeight: '350px',
                overflowY: 'auto',
                minWidth: '50%'
            };
            let currargs: ArgumentModel[] = current.args || [];
            let btnDisabled: boolean = currargs.length > 0 ? !valid : false;

            return (

                <Segment.Group>
                    <HeaderMenuWidget header="IMAGE" icon="cogs" disabled={false}>
                        <Menu.Item as={Link} to={`/Images/${current.image!.id}/edit`} icon="edit" content="Edit" />
                        <Menu.Item as={Link} to={`/Images/${current.image!.id}/validate`} icon="certificate" content="Check" color="orange" />
                    </HeaderMenuWidget>
                    <Segment>
                        <Header> {current.image.name} - build</Header>
                        <Spinner message="Running" loading={running} />
                    </Segment>

                    {/*TOP*/}
                    <Segment.Group>

                        <Segment.Group horizontal>
                            {/*LEFT*/}
                            <Segment style={styleSegment}>
                                {currargs.length > 0 && <FormRunner
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

                            {/*RIGHT*/}
                            <Segment style={{ minHeight: '200px', paddingRight: 10 }}>
                                <Grid columns="two" divided="vertically" >
                                    <Header size="tiny" block>Persister</Header>
                                    <Grid.Row>
                                        <Grid.Column>
                                            <Header size="tiny">Enable</Header>
                                            <Checkbox id="persisterFlag" toggle checked={persisterFlag} onChange={this.onChangePersisterEnabled} />
                                        </Grid.Column>
                                        <Grid.Column>
                                            <Header size="tiny">Build step</Header>
                                            <Input type="text" defaultValue={persisterBuildStep} onChange={this.onChangePersisterBuildStep} />
                                        </Grid.Column>
                                    </Grid.Row>
                                    <Grid.Row>
                                        <Grid.Column>
                                            <Header disabled={keysPreviewLimitDisabled} size="tiny">Preview limit rows</Header>
                                            <Input disabled={keysPreviewLimitDisabled} type="number" defaultValue={current.keyslimit || this.state.keyslimit} onChange={((event: React.SyntheticEvent<HTMLInputElement>, data: InputOnChangeData) => this.setState({ ...this.state, keyslimit: parseInt(data && data.value ? data.value : '10', 10) }))} />
                                        </Grid.Column>
                                        <Grid.Column>
                                            <Header disabled={!imageWatchEnabled} size="tiny">Enable Watch</Header>
                                            <Checkbox disabled={!imageWatchEnabled} id="checkBoxFlag" toggle checked={checkBoxFlag} onChange={() => this.setState({ ...this.state, checkBoxFlag: !this.state.checkBoxFlag })} />
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </Segment>

                        </Segment.Group>

                        <Segment>
                            <Grid columns="two" divided>
                                <Grid.Row>
                                    {current.availablevalidators &&
                                        <Grid.Column>
                                            <Header disabled={!validatorEnabled} size="tiny">Validator</Header>
                                            <FlowDropValidator
                                                disabled={!validatorEnabled}
                                                validators={current.availablevalidators}
                                                validator={this.state.validator}
                                                onChange={(newValue: string) => {
                                                    this.setState({ ...this.state, validator: newValue });
                                                }}
                                            />
                                        </Grid.Column>
                                    }
                                    {current.availableaggregators &&
                                        <Grid.Column>
                                            <Header size="tiny">Aggregator</Header>
                                            <FlowDropAggregator
                                                aggregators={current.availableaggregators}
                                                aggregator={this.state.aggregator}
                                                onChange={(newValue: string) => {
                                                    this.setState({ ...this.state, aggregator: newValue }, this.updatePersisterState);
                                                }}
                                            />
                                        </Grid.Column>
                                    }
                                </Grid.Row>
                            </Grid>
                        </Segment>

                        <Segment>
                            <Button disabled={btnDisabled} content="Build" icon="cogs" onClick={this.onRun} />
                        </Segment>

                    </Segment.Group>

                    {/*BOTTOM*/}
                    {result && <Segment compact>
                        <ResultTableImage key={'result'} enablewatch={imageWatchEnabled === true && this.enablewatchResult} data={result} adderMessage={(message: any) => this.props.addMessage(message)} />
                    </Segment>}

                </Segment.Group>

            );
        }

        return null;
    }
}

export const ImageRunner = conn.connect(ImageRunnerComp);
