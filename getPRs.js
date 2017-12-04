const winston = require('winston');
const GraphQLV4 = require('./main');

const github = new GraphQLV4({
  token: process.env.TOKEN,
  userAgent: process.env.userAgent,
});

winston.configure({
  level: 'info',
  transports: [
    new (winston.transports.File)({ filename: 'testLog.log' }),
  ],
});

const listOfPRs = [];
const listOfCommits = [];
const query = ` {
organization(login: "ramda") {
  repository(name: "ramda") {
      pullRequests(first:50, states: [OPEN]) {
        ...prDetails
      }
    }
  }
}

 fragment prDetails on PullRequestConnection {
  totalCount
  edges {
    node {
      title
      changedFiles
      createdAt
      commits(last: 50) {
        nodes {
          resourcePath
          commit {
            messageHeadline
            committedDate
          }
        }
      }
    }
  }
}`;
 
github.queryApi(query, null) 
  .then((res) => {
    const len = res.data.organization.repository.pullRequests.edges.length;

    for (let index = 0; index < len - 1; index = index+1) {
      listOfPRs.push(res.data.organization.repository.pullRequests.edges[index]);
      listOfCommits.push(
            res.data.organization.repository.pullRequests.edges[index].node.commits.nodes.length);
    }
    for (let i = 0; i < listOfPRs.length; i = i+1) {
      const cnt = listOfPRs[i].node.commits.nodes.length;
      for (let j = 0; j < cnt; j = j+1) {
        listOfCommits.push(listOfPRs[i].node.commits.nodes[j].commit);
      }
    }
    winston.info(listOfPRs);
    //winston.info(JSON.stringify(listOfCommits));
  }).catch((err) => {
    winston.info(err);
  });
