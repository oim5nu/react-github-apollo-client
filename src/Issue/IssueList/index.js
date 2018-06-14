import React from 'react';
import { Query, ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';

import IssueItem from '../IssueItem';
import Loading from '../../Loading';
import ErrorMessage from '../../Error';
import { ButtonUnobtrusive } from '../../Button';
import { withState } from 'recompose';
import './style.css';

//import Issues from './IssueList';

const GET_ISSUES_OF_REPOSITORY = gql`
  query(
    $repositoryOwner: String!, 
    $repositoryName: String!,
    $issueState: IssueState!
  ) {
    repository(name: $repositoryName, owner: $repositoryOwner) {
      issues(first: 5, states: [$issueState]) {
        edges {
          node {
            id
            number
            state
            title
            url
            bodyHTML
          }
        }
      }
    }
  }
`;

const ISSUE_STATES = {
  NONE: 'NONE',
  OPEN: 'OPEN',
  CLOSED: 'CLOSED'
};

const TRANSITION_LABELS = {
  [ISSUE_STATES.NONE]: 'Show Open Issues',
  [ISSUE_STATES.OPEN]: 'Show Closed Issues',
  [ISSUE_STATES.CLOSED]: 'Hide Issues',
};

const TRANSITION_STATE = {
  [ISSUE_STATES.NONE]: ISSUE_STATES.OPEN,
  [ISSUE_STATES.OPEN]: ISSUE_STATES.CLOSED,
  [ISSUE_STATES.CLOSED]: ISSUE_STATES.NONE,
};

const isShow = issueState => issueState !== ISSUE_STATES.NONE;

/*
class Issues extends Component {
  state = {
    issueState: ISSUE_STATES.NONE,
  };

  onChangeIssueState = nextIssueState => {
    this.setState({ issueState: nextIssueState });
  };
  render() {
    const { issueState } = this.state;
    const { repositoryOwner, repositoryName } = this.props;

    return (
      <div className="Issues">
        <ButtonUnobtrusive
          onClick={() =>
            this.onChangeIssueState(TRANSITION_STATE[issueState])
          }
        >
          {TRANSITION_LABELS[issueState]}
        </ButtonUnobtrusive>
        {isShow(issueState) && (
          <Query 
            query={GET_ISSUES_OF_REPOSITORY}
            variables={{
              repositoryOwner,
              repositoryName,
            }}
          >
            {( {data, loading, error }) => {
              if(error) {
                return <ErrorMessage error={error} />;
              }

              const { repository } = data;

              if (loading && !repository) {
                return <Loading />;
              }

              const filteredRepository = {
                issues: {
                  edges: repository.issues.edges.filter(
                    issue => issue.node.state === issueState,
                  ),
                },
              };

              if (!filteredRepository.issues.edges.length) {
                return <div className="IssueList">No issues ...</div>;
              }

              return <IssueList issues={filteredRepository.issues} />;
            }} 
          </Query>)
        }         
      </div>
    )
  }
}
*/
const IssueList = ({ issues }) => (
  <div className="IssueList">
    {issues.edges.map(( {node }) => (
      <IssueItem key={node.id} issue={node} />
    ))}
  </div>
);

const prefetchIssues = (
  client,
  repositoryOwner,
  repositoryName,
  issueState,
) => {
  const nextIssueState = TRANSITION_STATE[issueState];

  if (isShow(nextIssueState)) {
    client.query({
      query: GET_ISSUES_OF_REPOSITORY,
      variables: {
        repositoryOwner,
        repositoryName,
        issueState: nextIssueState,
      },
    });
  }
};

const IssueFilter = ({ 
  repositoryOwner,
  repositoryName,
  issueState, 
  onChangeIssueState }) => (
  <ApolloConsumer>
    { client => (
      <ButtonUnobtrusive
        onClick={() => 
          onChangeIssueState(TRANSITION_STATE[issueState])
        }
        onMouseOver={() => prefetchIssues(
          client,
          repositoryOwner,
          repositoryName,
          issueState,
        )}
      >
        {TRANSITION_LABELS[issueState]}
      </ButtonUnobtrusive>
    )} 
  </ApolloConsumer>
);

const Issues = ({ 
  repositoryOwner, 
  repositoryName, 
  issueState, 
  onChangeIssueState 
}) => (
  <div className="Issues">
    <IssueFilter
      repositoryOwner={repositoryOwner}
      repositoryName={repositoryName}
      issueState={issueState}
      onChangeIssueState={onChangeIssueState}
    />
    {isShow(issueState) && (
      <Query 
        query={GET_ISSUES_OF_REPOSITORY}
        variables={{
          repositoryOwner,
          repositoryName,
          issueState,
        }}
      >
        {( {data, loading, error }) => {
          if(error) {
            return <ErrorMessage error={error} />;
          }

          const { repository } = data;

          if (loading && !repository) {
            return <Loading />;
          }

          const filteredRepository = {
            issues: {
              edges: repository.issues.edges.filter(
                issue => issue.node.state === issueState,
              ),
            },
          };

          if (!filteredRepository.issues.edges.length) {
            return <div className="IssueList">No issues ...</div>;
          }

          return <IssueList issues={filteredRepository.issues} />;
        }} 
      </Query>)
    }         
  </div> 
);

export default withState(
  'issueState', 
  'onChangeIssueState', 
  ISSUE_STATES.NONE
)(Issues);