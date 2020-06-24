const { Octokit } = require('@octokit/core');
const createPullRequest = require('octokit-create-pull-request');
const fs = require('fs');
const uuid = require('firost/lib/uuid');

const MyOctokit = Octokit.plugin(createPullRequest);

const octokit = new MyOctokit({
  auth: process.env.GITHUB_TOKEN,
});

(async function () {
  const realAsBase64 = fs.readFileSync('./tmp/real.png', {
    encoding: 'base64',
  });
  const portraitAsBase64 = fs.readFileSync('./tmp/portrait.png', {
    encoding: 'base64',
  });

  const owner = 'pixelastic';
  const repo = 'npcs';

  const randomName = uuid();
  const username = 'pixelastic';
  const head = `submission/${username}-${randomName}`;
  const title = `New portrait from ${username}`;
  const commit = `feat(submission): Adding new images from ${username}`;
  const baseAssetUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${head}`;
  const realPath = `src/assets/real/${randomName}.png`;
  const portraitPath = `src/assets/portrait/${randomName}.png`;
  const body = `
A new submission has been entered by @${username}:

![Original picture](${baseAssetUrl}/${realPath})
![Generated portrait](${baseAssetUrl}/${portraitPath})
`;

  // Returns a normal Octokit PR response
  // See https://octokit.github.io/rest.js/#octokit-routes-pulls-create
  const response = await octokit.createPullRequest({
    owner,
    repo,
    head,
    title,
    body,
    changes: {
      files: {
        [realPath]: {
          content: realAsBase64,
          encoding: 'base64',
        },
        [portraitPath]: {
          content: portraitAsBase64,
          encoding: 'base64',
        },
      },
      commit,
    },
  });
  const prUrl = response.data.html_url;
  console.info(prUrl);
})();
