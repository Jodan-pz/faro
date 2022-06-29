import * as React from 'react';
import * as reducers from '../../reducers';
import { appConnector, Link } from 'app-support';
import { setCacheRunArg } from '../../actions';
import { Segment, Form, Button } from 'semantic-ui-react';
import { ArgumentModel } from 'src/actions/model';

interface FormRunnerProps {
    onChangedArgValue: (name: string, value: any) => void;
    onValid: (isValidForm: boolean) => void;
    showCacheArgs: boolean;
    argumentsModel: ArgumentModel[];
    valuesArgs: any;
}

const conn = appConnector<FormRunnerProps>()(
    (s, p) => ({
        cacheRunArgs: reducers.getCacheRunArgs(s)
    }),
    {
        setCacheRunArg
    }
);



class FormRunnerComp extends conn.StatefulCompo<{}> {
    validArgs: { [name: string]: boolean };
    isValidForm: boolean;
    oldIsValidForm: boolean;
    constructor(props: any) {
        super(props);
        this.isValidForm = false;
        this.oldIsValidForm = false;
        this.validArgs = {};
    }
    componentDidMount(): void {
        this.props.onValid(this.isValidForm);
    }
    componentDidUpdate(): void {
        this.checkValid();
    }
    checkValid = () => {
        if (this.isValidForm !== this.oldIsValidForm) {
            this.oldIsValidForm = this.isValidForm;
            this.props.onValid(this.isValidForm);
        }
    }
    onChangedArgValue = (name: string, value: string) => {
        this.props.setCacheRunArg({ argName: name, argValue: value });
        const { argumentsModel } = this.props;
        let arg: ArgumentModel | undefined = argumentsModel.find(arg => arg.name === name);
        if (arg) {
            this.validArgs[name] = !arg.optional ? (value !== undefined && value !== null && value.length > 0) : true;
            this.props.onChangedArgValue(name, value);
        }
    }
    getIsValid = () => {
        const { argumentsModel } = this.props;
        let isValidForm: boolean = true;
        argumentsModel.forEach(element => {
            if (isValidForm && !element.optional) {
                isValidForm = this.validArgs[element.name!];
            }
        });
        return isValidForm;
    }
    render() {
        const { argumentsModel, cacheRunArgs, valuesArgs, showCacheArgs } = this.props;

        this.oldIsValidForm = this.isValidForm;
        this.isValidForm = this.getIsValid();

        let style: React.CSSProperties = this.isValidForm ? { backgroundColor: '#f6fff4' } : {};
        return (
            <Segment style={style}>
                <Form>
                    {argumentsModel.map((arg, ix) => {

                        let nm: string = arg.name! || '';
                        let nameParam: string = nm! + (arg.description ? ' - ( ' + arg.description + ' )' : '');

                        return arg.name && <Form.Input
                            required={!arg.optional}
                            // width={12}
                            key={ix}
                            label={nameParam}
                            value={valuesArgs[nm] || ''}
                            onChange={(a, b) => this.onChangedArgValue(nm, b.value)}
                        >
                            <input />
                            {showCacheArgs && cacheRunArgs[nm] && cacheRunArgs[nm] !== valuesArgs[nm] &&
                                <Button size="mini" style={{ marginLeft: 10, width: '40%' }} onClick={() => this.onChangedArgValue(nm, cacheRunArgs[nm])}>
                                    use last used value: {cacheRunArgs[arg.name]}
                                </Button>}
                        </Form.Input>;
                    })}
                </Form>
            </Segment>);
    }
}

export const FormRunner = conn.connect(FormRunnerComp);