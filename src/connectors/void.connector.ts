import {Connector} from '../interfaces/connector.interface';

export class VoidConnector implements Connector {
  static isConnectable = async () => true;
  constructor(public url, public project, public repo, public group?) {}
  parsePath = () => this.url.href;
  getPullRequests = async () => [];
}
