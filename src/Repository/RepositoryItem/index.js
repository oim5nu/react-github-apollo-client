import React from 'react';
import REPOSITORY_FRAGMENT from '../fragments';
import Link from '../../Link';
import Button from '../../Button';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import '../style.css';

const STAR_REPOSITORY = gql`
  mutation($id: ID!) {
    addStar(input: { starrableId: $id }) {
      starrable {
        id
        viewerHasStarred
      }
    }
  }
`;

const UNSTAR_REPOSITORY = gql`
  mutation($id: ID!) {
    removeStar(input: { starrableId: $id}) {
      starrable {
        id
        viewerHasStarred
      }
    }
  }
`;

const updateAddStar = (
  client, 
  { data: { addStar: { starrable: { id } } } }, // mutationResult
) => { 
  // respository from cache
  const repository = client.readFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
  });

  // update count of stargazers of repository
  const totalCount = repository.stargazers.totalCount + 1;

  // write repository back to cache
  client.writeFragment({
    id: `Repository: ${id}`,
    fragment: REPOSITORY_FRAGMENT,
    data: {
      ...repository,
      stargazers: {
        ...repository.stargazers,
        totalCount,
      },
    },
  });
};

const WATCH_REPOSITORY = gql`
  mutation($id: ID!, $viewerSubscription: SubscriptionState!) {
    updateSubscription(
      input: { subscribableId: $id, state: $viewerSubscription }
    ) {
      subscribable {
        id
        viewerSubscription
      }
    }
  }
`;

const VIEWER_SUBSCRIPTIONS = {
  SUBSCRIBED: 'SUBSCRIBED',
  UNSUBSCRIBED: 'UNSUBSCRIBED',
};

const isWatch = viewerSubscription =>
  viewerSubscription === VIEWER_SUBSCRIPTIONS.SUBSCRIBED;

const updateWatch = (
  client,
  {
    data: {
      updateSubscription: {
        subscribable: { id, viewerSubscription },
      },
    },
  },
) => {
  const repository = client.readFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
  });

  let { totalCount } = repository.watchers;
  totalCount = 
    viewerSubscription === VIEWER_SUBSCRIPTIONS.SUBSCRIBED
      ? totalCount + 1
      : totalCount - 1;
  
  client.writeFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
    data: {
      ...repository,
      watchers: {
        ...repository.watchers,
        totalCount,
      },
    },
  });
};

const variablesForWatch = (id, viewerSubscription) => {
  return {id, 
    viewerSubscription: 
      isWatch(viewerSubscription)
        ? VIEWER_SUBSCRIPTIONS.UNSUBSCRIBED
        : VIEWER_SUBSCRIPTIONS.SUBSCRIBED,
  };
};

const optimisticResponseForWatch = (id, viewerSubscription) => {
  return {
    updateSubscription: {
      __typename: 'Mutation',
      subscribable: {
        __typename: 'Repository',
        id,
        viewerSubscription: isWatch(viewerSubscription)
          ? VIEWER_SUBSCRIPTIONS.UNSUBSCRIBED
          : VIEWER_SUBSCRIPTIONS.SUBSCRIBED,
      },
    },
  };
};

const RepositoryItem = ({
  id,
  name,
  url,
  descriptionHTML,
  primaryLanguage,
  owner,
  stargazers,
  watchers,
  viewerSubscription,
  viewerHasStarred,
}) => (
  <div>
    <div className="RepositoryItem-title">
      <h2>
        <Link href={url}>{name}</Link>
      </h2>
      <div>
        {!viewerHasStarred ? (
          <Mutation 
            mutation={STAR_REPOSITORY} 
            variables={{id}}
            update={updateAddStar}
          >
            {(addStar, { data, loading, error }) => (
              <Button
                className={'RepositoryItem-title-action'}
                onClick={addStar}
              >
                {stargazers.totalCount} Star   
              </Button>
            )}  
          </Mutation>
        ) : (
          <span>
            <Mutation mutation={UNSTAR_REPOSITORY} variables={{id}}>
              {(removeStar, { data, loading, error }) => (
                <Button
                  className={'RepositoryItem-title-action'}
                  onClick={removeStar}
                >
                  {stargazers.totalCount} UnStar  
                </Button>
              )}
            </Mutation>
          </span>
        )}
        <div>
            <Mutation 
              mutation={WATCH_REPOSITORY} 
              variables={variablesForWatch(id, viewerSubscription)}
              optimisticResponse={optimisticResponseForWatch(id, viewerSubscription)}
              update={updateWatch}
              >
              {(updateSubscription, {data, loading, error}) => (
                <Button
                  className={'RepositoryItem-title-action'}
                  onClick={updateSubscription}
                >
                  {watchers.totalCount} {'  '}
                  { isWatch(viewerSubscription) ? 'Unwatch' : 'Watch'}
                </Button>    
              )}
            </Mutation>
        </div>  
      </div>
    </div>
    <div className="RepositoryItem-description">
      <div
        className="RepositoryItem-description-info"
        dangerouslySetInnerHTML={{__html: descriptionHTML}}
      />
      <div className="RepositoryItem-description-details">
        <div>
          {primaryLanguage && (
            <span>Language: {primaryLanguage.name}</span>
          )}
        </div>
        <div>
          {owner && (
            <span>
              Owner: <a href={owner.url}>{owner.login}</a>
            </span>  
          )}
        </div>  
      </div>
    </div>
  </div>
);

export default RepositoryItem;