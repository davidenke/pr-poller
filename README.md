# pr-poller
Polls given resources and lists pull/merge request status.

## Prerequisites
You need to have Node.Js installed, at least version 12.

Use `nvm` to install `nvm install 12.4.0` or `nvm use 12.4.0`.
The currently needed node version is defined
in the [`.nvmrc`](https://raw.githubusercontent.com/davidenke/pr-poller/master/.nvmrc)
at [the repository](https://github.com/davidenke/pr-poller).

## Installation
Best is to install the module globally using `npm i -g @davidenke/pr-poller`

## Usage 
Simply run the script by pointing to your config using `pr-poller ~/path/to/pr-poller.config.json`.

## Configuration
An example config can be found
in [the repository](https://raw.githubusercontent.com/davidenke/pr-poller/master/example.config.json):
```json
{
  "repositories": [
    "https://davidenke:********@bitbucket.client.com/scm/project/some-repo.git",
    "https://davidenke:********git.zalari.de/other_project/some-other-repo.git",
    "https://davidenke:****************************************@github.com/davidenke/pr-poller.git"
  ]
}
```

Provide every repository you want to monitor by using the URL schema and the git path.

**Note:** GitHub can be accessed using personal access tokens (`github.com > Settings > Developer settings > Personal access tokens`).
Just provide the personal access token as password along with your username.

**Note:** Using emails as usernames requires you to url encode the `@` symbol with `%40`,
e.g. `https://david%40enke.dev:********@github.com/davidenke/pr-poller.git`

**Note:** As the configuration file contains your bare credentials you should keep it a safe place.
At least beneath your user home (`~` or `%HOMEPATH%`).

## Supported APIs
- [x] GitHub public
- [ ] GitHub self hosted (untested, but the API should be the same)
- [x] GitLab self hosted
- [ ] GitLab public (untested, but the API should be the same)
- [x] BitBucket self-hosted
- [ ] BitBucket public (untested, but the API should be the same)
