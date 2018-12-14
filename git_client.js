const simpleGit = require('simple-git/promise')(__dirname);
const path = require('path');
const url = require('url');
const fs = require('fs');

function getRepoName(repoUrl) {
  const parsed = url.parse(repoUrl);
  return path.basename(parsed.path);
}

/**
 * Retrieve the base git repo URL from a provided URL.
 * 
 * A URL could contain a hash, which we're interpreting as a branch/tag separator,
 * we shouldn't include this.
 **/
function cleanupRepoUrl(repoUrl) {
  const parsed = url.parse(repoUrl);
  return `${parsed.protocol}//${parsed.host}${parsed.path}`;
}

/**
 * Retrieve the options for the clone, given the URL.
 * 
 * If the URL has a hash at the end of it then this is used as the branch name.
 */
function getCloneOptionsForRepo(repoUrl) {
  let cloneOptions = [ '--depth', 1, '--single-branch' ];
  const parsed = url.parse(repoUrl);
  if (!!parsed.hash) {
    // From experimenting, parsed.hash starts with a hash symbol. Just in case.
    const branchName = parsed.hash[0] === '#' ? parsed.hash.substring(1) : parsed.hash;
    cloneOptions = cloneOptions.concat(['--branch', branchName]);
  }
  return cloneOptions;
}

exports.cloneRepo = (repoUrl, targetDir) =>
  new Promise((resolve, reject) => {
    // Ensure directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir);
    }

    const repoName = getRepoName(repoUrl);
    const clonePath = path.join(targetDir, repoName);
    const cleanRepoUrl = cleanupRepoUrl(repoUrl);
    const cloneOpts = getCloneOptionsForRepo(repoUrl);
  
    simpleGit
      // Disable terminal prompts, so Git does not prompt for username/password on a clone.
      .clone(cleanRepoUrl, clonePath, cloneOpts)
      .then(() => resolve(clonePath))
      .catch(reject);
  });
