import { WriterDefinition } from 'mglib-faro.webclient/MGLib_FARO.WEBAPI';
import { ItemValue } from 'src/actions/model';

export interface ConfigWriterProps extends ItemValue<any> {
    definition: WriterDefinition;
}
