import { faro_webapi as Proxy } from 'mglib-faro.webclient';
import { listenConfiguration } from 'app-support';
import { ConsoleEditor } from 'src/components/shared/items/objectItem/configWriter/ConsoleEditor';
import { SwaggerException } from 'mglib-faro.webclient/MGLib_FARO.WEBAPI';

const URL = '';

let auth = new Proxy.DaveAuthorizationClient(URL);
let health = new Proxy.DaveHealthClient(URL);

let decorator = new Proxy.DecoratorClient(URL);
let image = new Proxy.ImageClient(URL);
let aggregator = new Proxy.AggregatorClient(URL);
let validator = new Proxy.ValidatorClient(URL);
let keysIterator = new Proxy.KeysIteratorClient(URL);
let writer = new Proxy.WriterClient(URL);
let flow = new Proxy.FlowClient(URL);
let source = new Proxy.SourceDefinitionClient(URL);
let redis = new Proxy.RedisCacheClient(URL);
let engine = new Proxy.EngineRegistrationClient(URL);

listenConfiguration((c: { REACT_APP_SERVICE_URI: string }) => {
    auth = new Proxy.DaveAuthorizationClient(c.REACT_APP_SERVICE_URI || URL);
    health = new Proxy.DaveHealthClient(c.REACT_APP_SERVICE_URI || URL);
    decorator = new Proxy.DecoratorClient(c.REACT_APP_SERVICE_URI || URL);
    image = new Proxy.ImageClient(c.REACT_APP_SERVICE_URI || URL);
    aggregator = new Proxy.AggregatorClient(c.REACT_APP_SERVICE_URI || URL);
    validator = new Proxy.ValidatorClient(c.REACT_APP_SERVICE_URI || URL);
    keysIterator = new Proxy.KeysIteratorClient(c.REACT_APP_SERVICE_URI || URL);
    writer = new Proxy.WriterClient(c.REACT_APP_SERVICE_URI || URL);
    flow = new Proxy.FlowClient(c.REACT_APP_SERVICE_URI || URL);
    source = new Proxy.SourceDefinitionClient(c.REACT_APP_SERVICE_URI || URL);
    redis = new Proxy.RedisCacheClient(c.REACT_APP_SERVICE_URI || URL);
    engine = new Proxy.EngineRegistrationClient(c.REACT_APP_SERVICE_URI || URL);
    //  trash = new Proxy.EngineRegistrationClient(c.REACT_APP_SERVICE_URI || URL);
});



export interface IWrappedServiceResult<T> {
    IsYodaServiceResult: boolean;
    Status: boolean;
    Result: T;
    Errors: any[];
}

export const promiseClientConfiguratioGet = async () => {
    try {
        await auth.logon();
    } catch (err) {
        if (SwaggerException.isSwaggerException(err)) {
            if (err.status === 404) {
                const version = require('../../package.json').version;
                return { EnvironmentName: 'Local', Version: version };
            }
        }
        return undefined;
    }
    const healthResult = await health.get();
    if (healthResult) {
        return { EnvironmentName: healthResult.WorkspaceSettings.EnvironmentName, Version: healthResult.Application.Version };
    }
    return undefined;
};

// Promise<Stream | null>

export const withResult = <T>(promise: Promise<Partial<IWrappedServiceResult<T> | null>>) => promise
    .then(r => {
        if (r && (r.IsYodaServiceResult || (r as any).IsWrappedResult) && (!r.Status || (r.Errors && r.Errors.length))) {
            throw r.Errors;
        }
        return r;
    })
    .then(r => {
        return r && r.Result;
    })
    .then(r => r || undefined);


export {
    Proxy,
    auth,
    health,
    decorator,
    image,
    aggregator,
    keysIterator,
    writer,
    flow,
    validator,
    source,
    redis,
    engine
    // trash
};