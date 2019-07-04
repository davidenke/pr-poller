import {Connector} from '../interfaces/connector.interface';

export class GitlabSelfHostedConnector implements Connector {

  static isConnectable = () => false;

  constructor(public url, public project, public repo) {}

  parsePath() {
    return 'wooohooo';
  }

  async getPullRequests() {
    return [{title: this.constructor.name, description: 'asd', reviewers: []}];
  }

}
