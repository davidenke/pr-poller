import chalk from 'chalk';
import fetch, {Headers} from 'node-fetch';
import {Connector} from '../interfaces/connector.interface';

export class GithubCommunityConnector implements Connector {

  static isConnectable = ({href}) => href.startsWith('https://github.com');

  constructor(public url, public project, public repo) {}

  async getPullRequests() {
    // https://github.com/repos/<owner>/<repo>
    const url = `https://api.github.com/repos/${this.project}/${this.repo}/pulls`;
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
      if (Array.isArray(pullRequests)) {
        return pullRequests.map(({title, description}) => ({title, description, reviewers: []}));
      } else {
        console.error(chalk.red(data));
        return [];
      }
    } catch (error) {
      console.error(chalk.red(error));
      return [];
    }
  }

}
