import { appConnector } from 'app-support';
import * as React from 'react';
import * as reducers from '../../reducers';
import { aggregatorGet, keysIteratorSearch, decoratorSearch } from '../../actions';
import { FlowModel, ImageModel, WriterModel, DecoratorModel, UNIQUE_KEYSITERATOR, UNIQUE_DECORATOR, ArgumentListKeysIterator, ArgumentListDecorator, KeysIteratorModel, ArgumentModel, LayerDefinitionModel } from 'src/actions/model';
import { Segment, Header, Accordion, SegmentGroup, Icon, SemanticICONS, Label } from 'semantic-ui-react';
import { searchArgumetListKeysIterator, searchArgumetListDecorator, getType, getNameIconFromType, TYPECONST, TYPEEXPR, TYPEKEY, TYPEDEC, DECTAG, getSplitDecorator, getFields, getArgsObjects, EXPRTAG, KEYTAG } from '../Utils';

import * as lodash from 'lodash';
import { JsonEditorWidget } from '../shared/JsonEditorWidget';
interface FlowSummaryProps {
    flow?: FlowModel;
    image?: ImageModel;
    writer?: WriterModel;
}
interface FlowSummaryState {

}
const conn = appConnector<FlowSummaryProps>()(
    (s, p) => ({
        aggregator: reducers.getAggregator(s, p.flow!.aggregator!),
        searchKeys: reducers.getKeysIteratorSearch(s, UNIQUE_KEYSITERATOR),
        searchDecorators: reducers.getDecorators(s, UNIQUE_DECORATOR)
    }),
    {
        aggregatorGet,
        keysIteratorSearch,
        decoratorSearch
    }
);

class FlowSummary extends conn.StatefulCompo<FlowSummaryState> {
    loadkey: boolean = false;
    constructor(props: any) {
        super(props);
    }

    loadAggregator = (idAggregator: string) => {
        if (idAggregator && idAggregator.length > 0) {
            this.props.aggregatorGet(idAggregator);
        }
    }

    componentDidMount() {
        if (this.props.flow && this.props.flow.aggregator) {
            this.loadAggregator(this.props.flow.aggregator);
        }
        if (this.props.image) {
            let argumentA: ArgumentListKeysIterator = searchArgumetListKeysIterator();
            this.props.keysIteratorSearch(argumentA);
            let argumentB: ArgumentListDecorator = searchArgumetListDecorator();
            this.props.decoratorSearch(argumentB);
        }
    }
    componentDidUpdate(prevProps: any, prevState: any): void {
        let currId: string | undefined = this.props.flow && this.props.flow.aggregator;
        let prevId: string | undefined = prevProps.flow && prevProps.flow.aggregator;
        if (currId && currId !== prevId) {
            this.loadAggregator(currId);
        }
        if (this.loadkey) {
            this.loadkey = false;
            let argumentA: ArgumentListKeysIterator = searchArgumetListKeysIterator();
            this.props.keysIteratorSearch(argumentA);
            let argumentB: ArgumentListDecorator = searchArgumetListDecorator();
            this.props.decoratorSearch(argumentB);
        }
    }
    shouldComponentUpdate(nextProps: any, nextState: any): boolean {
        this.loadkey = false;
        if (nextProps.image !== this.props.image) {
            this.loadkey = true;
        }
        return true;
    }
    // ===========================
    toStringKeys(): Array<{ id: string, name: string }> {
        let itemToChoose: Array<{ id: string, name: string }> = [];
        if (this.props.searchKeys && this.props.searchKeys.length > 0) {
            this.props.searchKeys.forEach((value: KeysIteratorModel, index: number) => {
                if (value.name !== undefined) {
                    itemToChoose.push({ id: value.id!, name: value.name });
                }
            });
        }
        return itemToChoose;
    }

    getLayerElement = (val: any, typ: string, index: number) => {
        if (typ === TYPEDEC) {
            const { searchDecorators } = this.props;
            let decorator: string = '';
            if (typeof (val) === 'string') {
                decorator = val.split(DECTAG)[1];
            } else {
                decorator = val.decorator ? val.decorator : '';
            }
            let objSplit: any = getSplitDecorator(decorator);
            let headDecorator: any = '';
            if (searchDecorators) {
                let decObj: DecoratorModel | undefined = searchDecorators.find((element: DecoratorModel) => {
                    return element.id === objSplit.id;
                });
                if (decObj) {
                    headDecorator = (
                        <Label style={{ width: '100%', backgroundColor: '#eff0f7' }} >
                            <Label.Detail>{'Decorator: ' + decObj.name}</Label.Detail>
                            <Label.Detail>{'Output: ' + objSplit.field}</Label.Detail>
                        </Label>
                    );
                }
            }
            let args: any = val.args || {};
            let listArgs: any[] = [];
            for (const keyArg in args) {
                if (args.hasOwnProperty(keyArg)) {
                    const element = args[keyArg];
                    listArgs.push(
                        <Label key={'d-' + keyArg} style={{ width: '100%', backgroundColor: '#f7efef', marginTop: '2px' }} >
                            <Label.Detail>{keyArg} : </Label.Detail>
                            <Label.Detail>{element}</Label.Detail>
                        </Label>
                    );
                }
            }
            return (
                <SegmentGroup key={'seg-' + index}>
                    <Segment>
                        {headDecorator}
                    </Segment>
                    {listArgs.length > 0 && <Segment>
                        <div>ARGUMENTS</div>
                        {listArgs}
                    </Segment>}
                </SegmentGroup>);

        } else if (typ === TYPEEXPR) {
            let exp: string = (val as string).split(EXPRTAG)[1];
            return (
                <Segment>
                    {EXPRTAG} {exp}
                </Segment>
            );
        } else if (typ === TYPEKEY) {
            let kkk: string = (val as string).split(KEYTAG)[1];
            return (
                <Segment>
                    {KEYTAG} {kkk}
                </Segment>
            );
        } else if (typ === TYPECONST) {
            return (
                <Segment>
                    Const: {val === null ? 'null' : val.toString()}
                </Segment>
            );
        }
        return '';
    }
    getImageLayers = (image: ImageModel) => {
        const { layers } = image;
        if (layers && layers.length > 0) {
            let layerAccordion = layers.map((layer: LayerDefinitionModel, index: number) => {

                if (layer.name) {
                    let items: Array<any> = layer.items!;
                    let itemsContent: any[] = items.map((item: any, indx: number) => {
                        let key: string | undefined = lodash.findKey(item, (el: any) => true);
                        let val: any = item[key!];
                        let typ: string = getType(val);
                        let icon: string = getNameIconFromType(typ);

                        let layElement: any = this.getLayerElement(val, typ, indx);
                        let tit: any = <Label key={'lab' + indx} style={{ width: '90%', backgroundColor: '#dde5dc' }} icon={icon} content={key} />;
                        return { key: 'IMAGE-ITEM-' + indx, title: { content: tit }, content: { content: layElement } };
                    });

                    return { key: 'IMAGE-LAYER-' + Math.random() * 100, title: layer.name, content: { content: <Accordion.Accordion panels={itemsContent} /> } };
                }

                return <div key={index} />;
            });

            return { key: 'IMAGE-LAYER', title: 'LAYERS', content: { content: <Accordion.Accordion panels={layerAccordion} /> } };
        }
        return null;
    }
    getImageKeys = (image: ImageModel) => {
        const { keys } = image;
        if (keys) {
            let tostr = this.toStringKeys();
            let keysContent: any = keys.map((k, i) => {
                let key: any = tostr.find(t => t.id === k.keyid);
                if (key && key.name) {
                    return (<div key={'k' + i}>{key.name}</div>);
                }
                return '';
            });
            return { key: 'IMAGE-KEYS', title: 'KEYS', content: { content: <div>{keysContent}</div> } };
        }
        return null;
    }
    getObjImage = () => {
        const { image } = this.props;
        if (image) {
            let keysObj: any = this.getImageKeys(image);
            let layersObj: any = this.getImageLayers(image);
            let imageContent: any = image ? (
                <div key={'divimg'}>
                    {keysObj && <Accordion.Accordion panels={[keysObj]} />}
                    {layersObj && <Accordion.Accordion panels={[layersObj]} />}
                </div>) : '';
            let imgName: string = image ? 'IMAGE: ' + image.name : '';
            return { key: 'IMAGE', title: imgName, content: { content: imageContent } };
        }
        return null;
    }
    getObjAggregator = () => {
        const { aggregator } = this.props;
        /*
        if (aggregator) {
            if (aggregator.fields) {
                let list = aggregator.fields.map((field: AggregatorFieldModel, indx: number) => {
                    let func = AggregatorFunction[field.function];
                    let typ: string = getType(field.name);
                    let icon: string = getNameIconFromType(typ);
                    let nm: string = field.name || '';
                    if (typ === TYPEDEC) nm = nm.split(DECTAG)[1];
                    else if (typ === TYPEEXPR) nm = nm.split(EXPRTAG)[1];
                    else if (typ === TYPEKEY) nm = nm.split(KEYTAG)[1];
                    return (
                        <Label key={'agg-' + indx} style={{ width: '100%', backgroundColor: '#dde5dc', margin: '4px' }} >
                            <Icon name={icon as SemanticICONS} />
                            <Label.Detail>{'Name: ' + nm}</Label.Detail>
                            <Label.Detail>{'Function: ' + func}</Label.Detail>
                        </Label>

                    );
                });
                let element = (<div>{list}</div>);
                return { key: 'AGGREGATOR', title: 'AGGREGATOR ' + aggregator.name, content: { content: element } };
            }
        }
        */
        return null;
    }
    getObjWriter = () => {
        const { writer } = this.props;
        if (writer) {
            let kind: string = writer.kind || '';
            let args: any[] = [];
            if (writer.args) {
                args = writer.args.map((arg: ArgumentModel, indx: number) => {
                    return (
                        <Label key={'arg-' + indx} style={{ width: '100%', backgroundColor: '#dde5dc', margin: '4px' }} >
                            <Label.Detail>{'Name: ' + arg.name}</Label.Detail>
                            <Label.Detail>{'Description: ' + arg.description}</Label.Detail>
                        </Label>);
                });
            }
            let config: any = null;
            if (writer.config) {
                config = (<JsonEditorWidget key={'config'} name={'config'} item={writer.config} disabled={true} />);
            }
            let element = (
                <div key={'div'}>
                    <div>{'Kind: ' + kind}</div>
                    {args.length > 0 && <Accordion.Accordion panels={[{ key: 'WRITER-ARGS', title: 'ARGUMENTS', content: { content: <div >{args}</div> } }]} />}
                    {config && <Accordion.Accordion panels={[{ key: 'WRITER-CONFIG', title: 'CONFIG', content: { content: <div style={{ height: '400px', overflowY: 'auto', overflowX: 'auto' }}>{config}</div> } }]} />}
                </div>);
            return { key: 'WRITTER', title: 'WRITTER ' + writer.name, content: { content: element } };
        }
        return null;
    }
    render() {

        let img: any = this.getObjImage();

        let aggr: any = this.getObjAggregator();

        let wrt: any = this.getObjWriter();

        return (
            <div >
                <Header content={'SUMMARY'} />
                <div style={{ display: 'flex' }}>
                    {img && <Accordion style={{ width: '50%' }} panels={[img]} styled />}
                    {aggr && <Accordion style={{ width: '50%' }} panels={[aggr]} styled />}
                    {wrt && <Accordion style={{ width: '50%' }} panels={[wrt]} styled />}
                </div>
            </div>);
    }
}

export default conn.connect(FlowSummary);