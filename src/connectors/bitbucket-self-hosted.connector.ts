import fetch, {Headers} from 'node-fetch';
import {Connector} from '../interfaces/connector.interface';

export class BitbucketSelfHostedConnector implements Connector {

  static isConnectable = async ({pathname}) => pathname.startsWith('/scm/');

  constructor(public url, public project, public repo, public group?) {}

  async getPullRequests() {
    // <host>/rest/api/1.0/projects/<project>/repos/<repo>
    const url = `${this.url.origin}/rest/api/1.0/projects/${this.project}/repos/${this.repo}/pull-requests`;
    const headers = new Headers();
    const {username, password} = this.url;
    if (username && password) {
      const credentials = `${username}:${password}`;
      headers.set('Authorization', `Basic ${Buffer.from(credentials).toString('base64')}`);
    }

    const response = await fetch(url, {headers});
    const data = await response.text();

    try {
      const pullRequests = JSON.parse(data);
      if ('values' in pullRequests && Array.isArray(pullRequests.values)) {
        return pullRequests.values.map(({title, description, reviewers}) => {
          return {
            title, description, reviewers: reviewers.map(({status, user}) => ({
              approved: status === 'APPROVED',
              declined: status === 'NEEDS_WORK',
              name: user.displayName,
            })),
          };
        });
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  }

}
