const fetch = require("node-fetch");
const fs = require("fs");

class GhPort {
  constructor(gh_userName) {
    this.gh_userName = gh_userName;
  }

  baseURL = "https://api.github.com";

  /**
   *
   * @param {string} sort
   * sort the returned repos by create | pushed | updated
   * Default: created
   *
   * @param {string} direction
   * asc | desc
   * Default: desc
   *
   * @param {bool} formatted
   * If true then return only data needed to
   * make cards, else return the entire raw response
   * Default: true
   */
  getAllRepos(sort = "created", direction = "desc", formatted = true) {
    return fetch(this.__buildQueryString(sort, direction), {
      headers: {
        // to return topics
        Accept: "application/vnd.github.mercy-preview+json"
      }
    })
      .then(res => {
        return res.json().then(res => {
          if (res.length > 0 && formatted) {
            return this.__formatRawRepoList(res);
          } else if (res.length && !formatted) {
            return res;
          } else {
            return null;
          }
        });
      })
      .catch(err => err.message);
  }

  getMarkedRepos() {
    return this.getAllRepos().then(res => {
      return res.filter(repo => {
        return repo.topics.includes("ghport");
      });
    });
  }

  __buildQueryString(sort, direction) {
    return `${this.baseURL}/users/${this.gh_userName}/repos${
      sort ? `?sort=${sort}&` : `?sort=created&`
    }${direction ? `direction=${direction}` : `direction=desc`}`;
  }

  __formatRawRepoList(reposRaw) {
    return reposRaw.map(repo => {
      return {
        id: repo.id,
        name: repo.name,
        url: repo.owner.html_url,
        description: repo.description,
        commits: 0,
        sshUrl: repo.ssh_url,
        stars: repo.stargazers_count,
        created: repo.created_at,
        update: repo.updated_at,
        hasPages: repo.has_pages,
        hasIssues: repo.has_issues,
        topics: repo.topics
      };
    });
  }
}

let userGhPort = new GhPort("tylorkolbeck");

/**
 * @returns {array} of all repos
 */
userGhPort
  // getAllRepos([filter[, order[, formatted]]])
  .getAllRepos();

/**
 * @returns {array} of repos marked with the topic ghport
 */
userGhPort
  // getMarkedRepos([filter[, order[, formatted]]])
  .getMarkedRepos();

// .then(res =>
//   fs.writeFile("reposFormatted.json", JSON.stringify(res, null, " "), err =>
//     console.log(err)
//   )
// )
// .catch(err => console.log(err));
