import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
// import { graphql } from 'react-apollo';
import Loading from '../Loading';
import RepositoryList, { REPOSITORY_FRAGMENT } from '../Repository';
import ErrorMessage from '../Error';

const GET_REPOSITORIES_OF_CURRENT_USER = gql`
  query($cursor: String) {
    viewer {
      repositories(
        first: 5
        orderBy: { direction: DESC, field: STARGAZERS }
        after: $cursor
      ) {
        edges {
          node {
            ...repository
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }
  ${REPOSITORY_FRAGMENT}
`;
/* React Apollo executes the query when it is rendered */ 
const Profile = () => 
  <Query 
    query={GET_REPOSITORIES_OF_CURRENT_USER}
    notifyOnNetworkStatusChange={true}
  >
    {({ data, loading, error, fetchMore }) => {

      if (error) {
        return <ErrorMessage error={error} />;
      }
      const { viewer } = data;

      //console.log('process.env', process.env);
      if (loading && !viewer) {
        return <Loading />;
      }

      return (
        <div>
          <RepositoryList 
            repositories={viewer.repositories}
            fetchMore={fetchMore}
            loading={loading}
            entry={'viewer'}
          /> 
        </div>
      );
    }}
  </Query>
/*
 // HOC Paradiam
 const Profile = ({ data, loading, error }) => {
  if (error) {
    return <ErrorMessage error={error} />;
  }
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
 }
export default graphql(GET_REPOSITORIES_OF_CURRENT_USER)(Profile);

*/

export default Profile;