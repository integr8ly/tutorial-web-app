const simpleGit = require('simple-git/promise')(__dirname);
const fs = require('fs');

exports.cloneRepo = (repoUrl, targetDir) =>
  new Promise((resolve, reject) => {
    // Ensure directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir);
    }

    simpleGit
      .clone(repoUrl, targetDir, { '--depth': 1 })
      .then(resolve)
      .catch(reject);
  });
