import {URL} from 'url';
import {Connector} from '../interfaces/connector.interface';

export type ConnectorFactory =
  { isConnectable: (url: URL, project: string, repo: string, group?: string) => Promise<boolean>; }
  & (new (url: URL, project: string, repo: string, group?: string) => Connector);
