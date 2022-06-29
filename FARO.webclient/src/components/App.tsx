import { appConnector, Link } from 'app-support';
import * as React from 'react';
import { Route, RouteComponentProps, withRouter } from 'react-router';
import { Feed, Loader, Menu, Modal } from 'semantic-ui-react';
import { UNIQUE_AGGREGATOR, UNIQUE_DECORATOR, UNIQUE_FLOW, UNIQUE_IMAGE, UNIQUE_KEYSITERATOR, UNIQUE_VALIDATOR, UNIQUE_WRITER } from 'src/actions/model';
import { alertAdd, clientConfiguratioGet } from '../actions';
import { getClientConfiguration } from '../reducers';
import AdminContainer from './admin/AdminContainer';
import AggregatorEditor from './agregators/AggregatorEditor';
import { AggregatorList } from './agregators/AggregatorList';
import { AggregatorNewItem } from './agregators/AggregatorNewItem';
import AggregatorUsage from './agregators/AggregatorUsage';
import { AppLoader } from './AppLoader';
import DecoratorEditor from './decorator/DecoratorEditor';
import { DecoratorList } from './decorator/DecoratorList';
import { DecoratorNewItem } from './decorator/DecoratorNewItem';
import DecoratorRunner from './decorator/DecoratorRunner';
import DecoratorUsage from './decorator/DecoratorUsage';
import FlowEditor from './flow/FlowEditor';
import { FlowList } from './flow/FlowList';
import { FlowNewItem } from './flow/FlowNewItem';
import FlowRunner from './flow/FlowRunner';
import FlowValidate from './flow/FlowValidate';
import { ImageContainerEditor } from './image/ImageContainerEditor';
import { ImageList } from './image/ImageList';
import { ImageNewItem } from './image/ImageNewItem';
import { ImageRunner } from './image/ImageRunner';
import ImageUsage from './image/ImageUsage';
import ImageValidate from './image/ImageValidate';
import KeysIteratorEditor from './keysIterator/KeysIteratorEditor';
import { KeysIteratorList } from './keysIterator/KeysIteratorList';
import { KeysIteratorNewItem } from './keysIterator/KeysIteratorNewItem';
import { KeysIteratorRunner } from './keysIterator/KeysIteratorRunner';
import KeysIteratorUsage from './keysIterator/KeysIteratorUsage';
import { AlarmError, ManagerMessage } from './ManagerMessage';
import { searchBase } from './Utils';
import ValidatorEditor from './validators/ValidatorEditor';
import { ValidatorList } from './validators/ValidatorList';
import { ValidatorNewItem } from './validators/ValidatorNewItem';
import ValidatorUsage from './validators/ValidatorUsage';
import WriterEditor from './writer/WriterEditor';
import { WriterList } from './writer/WriterList';
import { WriterNewItem } from './writer/WriterNewItem';
import WriterUsage from './writer/WriterUsage';


interface Props extends RouteComponentProps<{}> {
  basic?: boolean;
  className?: string;
}
type Position = { x: number, y: number };

const conn = appConnector<Props>()(
  (s) => ({
    clientConfig: getClientConfiguration(s)

  }),
  {
    clientConfiguratioGet,
    alertAdd
  }
);

class App extends conn.StatefulCompo<any> {

  componentDidMount() {
    this.props.clientConfiguratioGet();
  }
  getScrollPosition = (el: any): Position => {
    return {
      x: el.pageXOffset !== undefined ? el.pageXOffset : el.scrollLeft,
      y: el.pageYOffset !== undefined ? el.pageYOffset : el.scrollTop
    };
  }
  getSnapshotBeforeUpdate = (prevProps: any, prevState: any) => {
    let pos: Position = this.getScrollPosition(window);
    if (pos.y >= 100 || pos.x >= 100) {
      return pos.y;
    }
    return null;
  }

  componentDidUpdate(prevProps: any, prevState: any, snapshot: any) {
    if (snapshot !== null) {
      window.scrollTo(0, 0);
    }
  }

  onAdd = (id: number, url: string) => {
    const { history } = this.props;
    history.push(`${url}/${id}`);
  }
  onDel = (url: string) => {
    this.props.history.replace(url);
  }

  onExit = (where: string) => {
    const { history } = this.props;
    history.push(where);
  }
  onContinue = (where: string) => {
    const { history } = this.props;
    history.push(`${where}/new`);
  }

  onEdit = (where: string, id: string) => {
    const { history } = this.props;
    history.push(`${where}/${id}/edit`);
  }

  getArgumentFilter = () => {
    const { history } = this.props;
    if (history.location.search) {
      let src: string = history.location.search.replace('?', '');
      let split: Array<string> = src.split('&');
      let argumentFilter: any = { ...searchBase };
      split.forEach((el: string) => {
        let kv: Array<string> = el.split('=');
        if (kv.length === 2) {
          argumentFilter[kv[0]] = kv[1];
        }
      });
      return argumentFilter;
    }
    return {};
  }

  startupMessage = (message: string = 'Loading') => (
    <Modal dimmer="inverted" closeOnDimmerClick={false} open basic centered size="fullscreen">
      <Loader active indeterminate size="huge">{message}</Loader>
    </Modal>
  )



  render() {
    const { clientConfig, match, basic = false, className } = this.props;

    if (!clientConfig) return this.startupMessage('FARO is warming up...');

    const matchUrl = (match.url === '/' ? match.url : match.url + '/');

    const FLOW = { matchlist: `${matchUrl}Flows`, matchitem: `${matchUrl}Flows/:id` };
    const AGGREGATOR = { matchlist: `${matchUrl}Aggregators`, matchitem: `${matchUrl}Aggregators/:id` };
    const VALIDATOR = { matchlist: `${matchUrl}Validators`, matchitem: `${matchUrl}Validators/:id` };
    const WRITER = { matchlist: `${matchUrl}Writers`, matchitem: `${matchUrl}Writers/:id` };
    const DECORATOR = { matchlist: `${matchUrl}Decorators`, matchitem: `${matchUrl}Decorators/:id` };
    const IMAGE = { matchlist: `${matchUrl}Images`, matchitem: `${matchUrl}Images/:id` };
    const KEYSITERATOR = { matchlist: `${matchUrl}KeysIterator`, matchitem: `${matchUrl}KeysIterator/:id` };
    const ADMIN = { matchitem: `${matchUrl}Admin` };

    const envName: string = (clientConfig.EnvironmentName) || '';
    const version = (clientConfig.Version) || '';

    const menuItems: any[] = [
      { text: 'ADMIN', linkTo: ADMIN.matchitem, icon: 'group', innewline: true },
      { text: 'KEYS ITERATORS', linkTo: KEYSITERATOR.matchlist, icon: 'group', innewline: true },
      { text: 'DECORATORS', linkTo: DECORATOR.matchlist, icon: 'group', innewline: true },
      { text: 'IMAGES', linkTo: IMAGE.matchlist, icon: 'group', innewline: true },
      { text: 'VALIDATORS', linkTo: VALIDATOR.matchlist, icon: 'group', innewline: true },
      { text: 'AGGREGATORS', linkTo: AGGREGATOR.matchlist, icon: 'group', innewline: true },
      { text: 'WRITERS', linkTo: WRITER.matchlist, icon: 'group', innewline: true },
      { text: 'FLOWS', linkTo: FLOW.matchlist, icon: 'group', innewline: true }
    ];

    let color: string = '0042FF'; // envName.toUpperCase() === 'DEVELOPMENT' ? '#008f00' : (envName.toUpperCase() === 'NUBES' ? '#0042FF' : '#FFC900' );
    return (
      <div className={`app ${envName} ${className}`} style={{ height: '100vh', width: '100%' }}>

        <Menu fixed="top" size="small" className={`${className || ''} titlemenu widget`} >
          <Menu.Menu position="left">
            <Feed size={basic ? 'small' : 'large'}>
              <Feed.Event>

                <Feed.Label icon={<AppLoader icon="setting" circular={!basic} />} />

                <Feed.Content>
                  <Feed.Summary>
                    <a style={{ color: color }}>FARO<small>{clientConfig ? ` on ${envName}, v. ${version}` : ''}</small></a>
                  </Feed.Summary>
                </Feed.Content>

                <Feed.Content>
                  <Feed.Summary>
                    <AlarmError />
                  </Feed.Summary>
                </Feed.Content>

              </Feed.Event>
            </ Feed>
          </Menu.Menu>

          <Menu.Menu position="right">

            {menuItems.map((v: any, i: any) => {
              // this.props.location.pathname === v.linkTo
              let active: boolean = this.props.location.pathname.split('/')[1] === v.linkTo.split('/')[1];
              return (
                <Menu.Item key={i} name={v.linkTo} color="green" active={active} to={v.linkTo || ''} as={Link} >{v.text || v.key}</Menu.Item>
              );
            })}
          </Menu.Menu>
        </Menu>

        <ManagerMessage
          flyingPosition={{ horizontal: 'left', vertical: 40 }}
          deafultMessage={
            {
              '551': [{
                name: 'RECONNECT', action: (idMessage: string, data?: any) => {
                  this.props.clientConfiguratioGet();
                }
              }],
              '554': [{
                name: 'RELOAD', action: (idMessage: string, data?: any) => {
                  if (document !== null && document.location !== null) document.location.reload();
                }
              }]
            }
          }
        />

        <div style={{ padding: '5px 5px 0px 5px', marginTop: '40px' }}>

          {/* ========================= ADMIN =========================*/}
          <Route exact path={ADMIN.matchitem} component={(p: RouteComponentProps<any>) => <AdminContainer />} />

          {/* ========================= AGGREGATOR =========================*/}
          <Route
            exact
            path={AGGREGATOR.matchlist}
            component={(p: RouteComponentProps<any>) =>
              <AggregatorList
                defaultParms={this.getArgumentFilter()}
                uniqueId={UNIQUE_AGGREGATOR}
                historyAction={p.history.action}
                root={AGGREGATOR.matchlist}
              />}
          />
          <Route
            exact
            path={`${AGGREGATOR.matchitem}/edit`}
            component={(p: RouteComponentProps<any>) =>
              <AggregatorEditor
                onEdit={(where: string, id: string) => this.onEdit(where, id)}
                id={p.match.params.id}
              />}
          />

          <Route
            exact
            path={`${AGGREGATOR.matchlist}/new`}
            component={(p: RouteComponentProps<any>) =>
              <AggregatorNewItem
                onEdit={(id: string) => this.onEdit('/Aggregators', id)}
                onExit={(id: string) => this.onExit('/Aggregators')}
                onContinue={(id: string) => this.onContinue('/Aggregators')}
              />}
          />
          <Route
            exact
            path={`${AGGREGATOR.matchlist}/Usage/:id`}
            component={(p: RouteComponentProps<any>) =>
              <AggregatorUsage id={p.match.params.id} />}
          />

          {/* ========================= VALIDATORS =========================*/}
          <Route
            exact
            path={VALIDATOR.matchlist}
            component={(p: RouteComponentProps<any>) =>
              <ValidatorList
                defaultParms={this.getArgumentFilter()}
                uniqueId={UNIQUE_VALIDATOR}
                historyAction={p.history.action}
                root={VALIDATOR.matchlist}
              />}
          />
          <Route
            exact
            path={`${VALIDATOR.matchitem}/edit`}
            component={(p: RouteComponentProps<any>) =>
              <ValidatorEditor
                onEdit={(where: string, id: string) => this.onEdit(where, id)}
                id={p.match.params.id}
              />}
          />
          <Route
            exact
            path={`${VALIDATOR.matchlist}/new`}
            component={(p: RouteComponentProps<any>) =>
              <ValidatorNewItem
                onEdit={(id: string) => this.onEdit('/Validators', id)}
                onExit={(id: string) => this.onExit('/Validators')}
                onContinue={(id: string) => this.onContinue('/Validators')}
              />}
          />
          <Route
            exact
            path={`${VALIDATOR.matchlist}/Usage/:id`}
            component={(p: RouteComponentProps<any>) => <ValidatorUsage id={p.match.params.id} />}
          />

          {/* ========================= FLOW =========================*/}
          <Route
            exact
            path={FLOW.matchlist}
            component={(p: RouteComponentProps<any>) =>
              <FlowList
                onContinue={(where: string) => this.onContinue(where)}
                defaultParms={this.getArgumentFilter()}
                uniqueId={UNIQUE_FLOW}
                historyAction={p.history.action}
                root={FLOW.matchlist}
              />}
          />
          <Route
            exact
            path={`${FLOW.matchitem}/edit`}
            component={(p: RouteComponentProps<any>) =>
              <FlowEditor
                onContinue={(where: string) => this.onContinue(where)}
                onEdit={(where: string, id: string) => this.onEdit(where, id)}
                id={p.match.params.id}
              />}
          />
          <Route
            exact
            path={`${FLOW.matchitem}/run`}
            component={(p: RouteComponentProps<any>) =>
              <FlowRunner
                id={p.match.params.id}
              />}
          />
          <Route
            exact
            path={`${FLOW.matchitem}/validate`}
            component={(p: RouteComponentProps<any>) =>
              <FlowValidate
                id={p.match.params.id}
              />}
          />
          <Route
            exact
            path={`${FLOW.matchlist}/new`}
            component={(p: RouteComponentProps<any>) =>
              <FlowNewItem
                onEdit={(id: string) => this.onEdit('/Flows', id)}
                onExit={(id: string) => this.onExit('/Flows')}
                onContinue={(id: string) => this.onContinue('/Flows')}
              />}
          />

          {/* ========================= WRITER =========================*/}
          <Route
            exact
            path={WRITER.matchlist}
            component={(p: RouteComponentProps<any>) =>
              <WriterList
                onContinue={(where: string) => this.onContinue(where)}
                uniqueId={UNIQUE_WRITER}
                historyAction={p.history.action}
                root={WRITER.matchlist}
              />}
          />
          <Route
            exact
            path={`${WRITER.matchitem}/edit`}
            component={(p: RouteComponentProps<any>) =>
              <WriterEditor
                onContinue={(where: string) => this.onContinue(where)}
                id={p.match.params.id}
              />}
          />
          <Route
            exact
            path={`${WRITER.matchlist}/new`}
            component={(p: RouteComponentProps<any>) => <WriterNewItem onEdit={(id: string) => this.onEdit('/Writers', id)} onExit={(id: string) => this.onExit('/Writers')} onContinue={(id: string) => this.onContinue('/Writers')} />}
          />
          <Route
            exact
            path={`${WRITER.matchlist}/Usage/:id`}
            component={(p: RouteComponentProps<any>) =>
              <WriterUsage
                onEdit={(id: string) => this.onEdit('/Writers', id)}
                id={p.match.params.id}
              />}
          />
          {/* ========================= KEYSITERATOR =========================*/}
          <Route
            exact
            path={KEYSITERATOR.matchlist}
            component={(p: RouteComponentProps<any>) =>
              <KeysIteratorList
                defaultParms={this.getArgumentFilter()}
                onContinue={(where: string) => this.onContinue(where)}
                uniqueId={UNIQUE_KEYSITERATOR}
                historyAction={p.history.action}
                root={KEYSITERATOR.matchlist}
              />}
          />
          <Route
            exact
            path={`${KEYSITERATOR.matchitem}/edit`}
            component={(p: RouteComponentProps<any>) =>
              <KeysIteratorEditor
                onContinue={(where: string) => this.onContinue(where)}
                id={p.match.params.id}
              />}
          />
          <Route
            exact
            path={`${KEYSITERATOR.matchitem}/run`}
            component={(p: RouteComponentProps<any>) =>
              <KeysIteratorRunner
                id={p.match.params.id}
              />}
          />
          <Route
            exact
            path={`${KEYSITERATOR.matchlist}/new`}
            component={(p: RouteComponentProps<any>) =>
              <KeysIteratorNewItem
                onEdit={(id: string) => this.onEdit('/KeysIterator', id)}
                onExit={(id: string) => this.onExit('/KeysIterator')}
                onContinue={(id: string) => this.onContinue('/KeysIterator')}
              />}
          />
          <Route
            exact
            path={`${KEYSITERATOR.matchlist}/Usage/:id`}
            component={(p: RouteComponentProps<any>) =>
              <KeysIteratorUsage
                onEdit={(id: string) => this.onEdit('/KeysIterator', id)}
                id={p.match.params.id}
              />}
          />
          {/* ========================= DECORATOR =========================*/}
          <Route
            exact
            path={DECORATOR.matchlist}
            component={(p: RouteComponentProps<any>) =>
              <DecoratorList
                defaultParms={this.getArgumentFilter()}
                onContinue={(where: string) => this.onContinue(where)}
                uniqueId={UNIQUE_DECORATOR}
                historyAction={p.history.action}
                root={DECORATOR.matchlist}
              />}
          />
          <Route
            exact
            path={`${DECORATOR.matchitem}/edit`}
            component={(p: RouteComponentProps<any>) =>
              <DecoratorEditor
                onContinue={(where: string) => this.onContinue(where)}
                id={p.match.params.id}
              />}
          />
          <Route
            exact
            path={`${DECORATOR.matchitem}/run`}
            component={(p: RouteComponentProps<any>) =>
              <DecoratorRunner
                id={p.match.params.id}
              />}
          />
          <Route
            exact
            path={`${DECORATOR.matchlist}/new`}
            component={(p: RouteComponentProps<any>) =>
              <DecoratorNewItem
                onEdit={(id: string) => this.onEdit('/Decorators', id)}
                onExit={(id: string) => this.onExit('/Decorators')}
                onContinue={(id: string) => this.onContinue('/Decorators')}
              />}
          />
          <Route
            exact
            path={`${DECORATOR.matchlist}/Usage/:id`}
            component={(p: RouteComponentProps<any>) =>
              <DecoratorUsage
                onEdit={(id: string) => this.onEdit('/Decorators', id)}
                id={p.match.params.id}
              />}
          />
          {/* ========================= IMAGE =========================*/}
          <Route
            exact
            path={IMAGE.matchlist}
            component={(p: RouteComponentProps<any>) =>
              <ImageList
                defaultParms={this.getArgumentFilter()}
                onContinue={(where: string) => this.onContinue(where)}
                uniqueId={UNIQUE_IMAGE}
                historyAction={p.history.action}
                root={IMAGE.matchlist}
              />}
          />
          <Route
            exact
            path={`${IMAGE.matchitem}/edit`}
            component={(p: RouteComponentProps<any>) =>
              <ImageContainerEditor
                onEdit={(where: string, id: string) => this.onEdit(where, id)}
                onContinue={(where: string) => this.onContinue(where)}
                id={p.match.params.id}
              />}
          />
          <Route
            exact
            path={`${IMAGE.matchitem}/run`}
            component={(p: RouteComponentProps<any>) =>
              <ImageRunner
                id={p.match.params.id}
              />}
          />
          <Route
            exact
            path={`${IMAGE.matchitem}/validate`}
            component={(p: RouteComponentProps<any>) =>
              <ImageValidate
                id={p.match.params.id}
              />}
          />
          <Route
            exact
            path={`${IMAGE.matchlist}/new`}
            component={(p: RouteComponentProps<any>) =>
              <ImageNewItem
                onEdit={(id: string) => this.onEdit('/Images', id)}
                onExit={(id: string) => this.onExit('/Images')}
                onContinue={(id: string) => this.onContinue('/Images')}
              />}
          />

          <Route
            exact
            path={`${IMAGE.matchlist}/Usage/:id`}
            component={(p: RouteComponentProps<any>) =>
              <ImageUsage
                onEdit={(id: string) => this.onEdit('/Images', id)}
                id={p.match.params.id}
              />}
          />
        </div>
      </div>
    );
  }
}

const AppConnected = conn.connect(App);
const AppConnectedWithRouter = withRouter(AppConnected);

export default AppConnectedWithRouter;