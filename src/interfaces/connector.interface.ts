import {URL} from 'url';
import {PullRequest} from './pull-request.interface';

export interface Connector {

  url: URL;
  project: string;
  repo: string;

  getPullRequests: () => Promise<PullRequest[]>;

}
