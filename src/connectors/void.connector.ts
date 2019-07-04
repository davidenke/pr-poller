import {Connector} from '../interfaces/connector.interface';

export class VoidConnector implements Connector {
  static isConnectable = () => true;
  constructor(public url, public project, public repo) {}
  parsePath = () => this.url.href;
  getPullRequests = async () => [];
}
