import fetch from 'node-fetch';
import {Connector} from '../interfaces/connector.interface';

export class GitlabSelfHostedConnector implements Connector {

  static async isConnectable({origin, username}) {
    const checkUrl = `${origin}/api/v4/version?private_token=${username}`;
    try {
      const response = await fetch(checkUrl);
      return 'version' in await response.json();
    } catch (error) {
      return false;
    }
  }

  constructor(public url, public project, public repo, public group?) {}

  async getPullRequests() {
    // <host>/rest/api/v4/<project>/<repo>
    const groupName = this.group || this.project;
    const {origin, username} = this.url;
    try {
      const groupsUrl = `${origin}/api/v4/groups?min_access_level=10&private_token=${username}`;
      const groupsResponse = await fetch(groupsUrl);
      const groups = await groupsResponse.json() as any[];
      const groupId = groups.find(({path}) => path === groupName).id;

      const pullRequestsUrl = `${origin}/api/v4/groups/${groupId}/merge_requests?private_token=${username}`;
      const pullRequestsResponse = await fetch(pullRequestsUrl);
      const pullRequests = await pullRequestsResponse.json() as any[];

      return pullRequests.map(({title, description, assignee, merge_status}) => {
        return {title, description, reviewers: [{
          name: assignee.name,
          approved: merge_status === 'can_be_merged',
          declined: merge_status === 'cannot_be_merged'
        }]};
      });
    } catch (error) {
      return [];
    }
  }

}
