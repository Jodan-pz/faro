import * as React from 'react';
import * as reducers from '../reducers';
import { appConnector } from 'app-support';
import { Icon } from 'semantic-ui-react';

const conn = appConnector<any | { icon: string, circular?: boolean, onClick?: () => void }>()(
  (s) => ({ loading: reducers.getLoading(s), }), {});


export const AppLoader = conn.PureCompo((props) => {
  const handlerClick = (event: any) => !props.loading && props.onClick && props.onClick();
  if (props.loading) {
    return <Icon name="spinner" circular={props.circular} inverted={props.circular} loading />;
  }
  return <img src='/faro.png' alt='FARO' style={{ width: 40 }} onClick={handlerClick} />
  // return <Icon name={props.icon} circular={props.circular} inverted={props.circular} onClick={handlerClick} link={props.onClick !== undefined} />;
});