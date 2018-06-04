import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import Loading from '../Loading';
import RepositoryList from '../Repository';

const GET_REPOSITORIES_OF_CURRENT_USER = gql`
  {
    viewer {
      repositories(
        first: 5
        orderBy: { direction: DESC, field: STARGAZERS }
      ) {
        edges {
          node {
            id
            name
            url
            descriptionHTML
            primaryLanguage {
              name
            }
            owner {
              login
              url
            }
            stargazers {
              totalCount
            }
            viewerHasStarred
            watchers {
              totalCount
            }
            viewerSubscription
          }
        }
      }
    }
  }
`;
/* React Apollo executes the query when it is rendered */ 
const Profile = () => 
  <Query query={GET_REPOSITORIES_OF_CURRENT_USER}>
    {({ data, loading }) => {
      const { viewer } = data;

    //console.log('process.env', process.env);
    if (loading || !viewer) {
      return <Loading />;
    }

    return (
      <div>
        <RepositoryList 
          repositories={viewer.repositories}
        />  
      </div>
    ); 
  }}
  </Query>

export default Profile;