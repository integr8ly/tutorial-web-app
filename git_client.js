const simpleGit = require('simple-git/promise')(__dirname);
const path = require('path');
const url = require('url');
const fs = require('fs');

function getRepoName(repoUrl) {
  const parsed = url.parse(repoUrl);
  return path.basename(parsed.path);
}

exports.cloneRepo = (repoUrl, targetDir) =>
  new Promise((resolve, reject) => {
    // Ensure directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir);
    }

    const repoName = getRepoName(repoUrl);
    const clonePath = path.join(targetDir, repoName);

    simpleGit
      .clone(repoUrl, clonePath, { '--depth': 1 })
      .then(() => resolve(clonePath))
      .catch(reject);
  });
