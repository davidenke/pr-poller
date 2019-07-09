import Timeout = NodeJS.Timeout;
import chalk from 'chalk';
import {relative, resolve} from 'path';
import {URL} from 'url';

import {BitbucketSelfHostedConnector} from './connectors/bitbucket-self-hosted.connector';
import {GithubCommunityConnector} from './connectors/github-community.connector';
import {GitlabSelfHostedConnector} from './connectors/gitlab-self-hosted.connector';
import {VoidConnector} from './connectors/void.connector';
import {Connector} from './interfaces/connector.interface';
import {PullRequest} from './interfaces/pull-request.interface';
import {ConnectorFactory} from './types/connector-factory.type';

interface Config {
  repositories: string[];
}

interface PullRequestGroup {
  project: string;
  repo: string;
  items: PullRequest[];
}

// given arguments for the executable
let timer: Timeout;
const {argv, cwd} = process;
const processArgs = argv.slice(2);
const configPathOrUrl = processArgs.shift();

// we need the config
if (!configPathOrUrl) {
  console.error(chalk.red('No config or url provided!'));
  process.exit(1);
}

const findConnector = async (url: URL): Promise<Connector> => {
  const {pathname} = url;
  const slugs = pathname.match(/\/((?:\/?[\w-_]+)+)\.git$/i);

  if (!slugs || slugs.length < 1) {
    console.error(chalk.red('Either project or repository can be retrieved from path:'), pathname);
    return Promise.reject();
  }

  const [repo, project, group] = slugs[1]
    .split('/')
    .reverse();
  const connectors: ConnectorFactory[] = [
    GithubCommunityConnector,
    BitbucketSelfHostedConnector,
    GitlabSelfHostedConnector,
    VoidConnector,
  ];

  // find matching connector
  // tslint:disable-next-line:no-non-null-assertion
  for await (const connector of connectors) {
    if (await connector.isConnectable(url, project, repo, group)) {
      return new connector(url, project, repo, group);
    }
  }

  // we always have a connector even if it's void
  return new VoidConnector(url, project, repo, group);
};

const loadConfig = async (path: string): Promise<Config> => {
  try {
    const config = await import(`${path}`);
    return config.default;
  } catch (error) {
    console.error(chalk.red('No config found at given path:'), path);
    return Promise.reject(error);
  }
};

const parseConfig = async (path: string): Promise<Connector[]> => {
  // prepare repository store
  const accounts = new Set<Connector>();

  // check if given path is an url
  if (path.startsWith('http') || path.endsWith('.git')) {
    accounts.add(await findConnector(new URL(path)));
  }

  // if not, this must be a path to a config
  // tslint:disable-next-line:one-line
  else {
    const configPath = relative(resolve(__filename, '../'), resolve(cwd(), path));
    const {repositories} = await loadConfig(configPath);
    for await (const url of repositories) {
      accounts.add(await findConnector(new URL(url)));
    }
  }

  // sort the entries
  const sorted = Array.from(accounts);
  sorted.sort((a, b) => `${a.project}/${a.repo}`.localeCompare(`${b.project}/${b.repo}`));

  return sorted;
};

const updatePullRequests = async (accounts: Connector[]): Promise<PullRequestGroup[]> => {
  return await accounts.reduce(async (all, account) => {
    const {project, repo} = account;
    const group = {project, repo, items: await account.getPullRequests()};
    (await all).push(group);
    return all;
  }, Promise.resolve([] as PullRequestGroup[]));
};

const showPullRequests = async (pullRequests: PullRequestGroup[]) => {
  // clear current output
  console.clear();
  process.stdout.write('\x1b[2J');

  // log new output
  const lb = '\n\r';
  const legend = [
    chalk.grey('no reviewers'),
    chalk.white('not reviewed'),
    chalk.red('declined'),
    chalk.green('approved'),
  ].join(chalk.gray(' | '));
  const log = pullRequests
    .map(({project, repo, items}) => chalk.grey(`${project}/${repo} (${items.length})`)
      + chalk.grey(items.length ? `:${lb}` : '')
      + items
        .map(({title, reviewers}) => {
          const hasApproval = reviewers.some(({approved}) => approved);
          const hasDecline = reviewers.some(({declined}) => declined);

          let color;
          if (!hasApproval && !hasDecline) {
            color = chalk.white;
          } else if (hasApproval && !hasDecline) {
            color = chalk.green;
          } else if (hasDecline) {
            color = chalk.red;
          } else {
            color = chalk.grey;
          }

          return `${chalk.gray('+')} ${color(title)}`;
        })
        .join(lb),
    )
    .filter(joined => joined !== '')
    .join(lb)
    + `${lb}${legend}`;

  console.log(log);
};

const stopTimer = () => {
  if (timer) {
    clearInterval(timer);
  }
};

const startTimer = async <T extends Connector[]>(accounts: T, wait: number, run: (connectors: T) => void) => {
  // run immediately
  run(accounts);

  // then wait and repeat
  stopTimer();
  timer = setInterval(() => run(accounts), wait * 1000);
};

// clear the interval
process.on('exit', () => stopTimer());

// tslint:disable-next-line:no-non-null-assertion
parseConfig(configPathOrUrl!)
  .then(accounts => startTimer(accounts, 10, connectors => {
      updatePullRequests(connectors)
        .then(pullRequests => showPullRequests(pullRequests));
    },
  ))
  .catch(error => {
    console.error(chalk.grey(error));
    process.exit();
  });
