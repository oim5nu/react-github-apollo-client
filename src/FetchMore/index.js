import React from 'react';
import Loading from '../Loading';
import { ButtonUnobtrusive } from '../Button';
import './style.css';
/* tell Apollo Client how to merge the previous result with new */
/*
{loading ? (
  <Loading />
) : (
  repositories.pageInfo.hasNextPage && (
    <button 
      type="button"
      onClick={() =>
        fetchMore({
          variables: {
            cursor: repositories.pageInfo.endCursor,
          },
          updateQuery, 
        })
      }
    >
      More repositories
    </button>
  )
)}
*/

const FetchMore = ({
  loading,
  hasNextPage,
  variables,
  updateQuery,
  fetchMore,
  children,
}) => (
  <div className="FetchMore">
    { loading ? (
      <Loading />
    ) : (
      hasNextPage && (
      <ButtonUnobtrusive
        type="button"
        className="FetchMore-button"
        onClick={() => fetchMore({ variables, updateQuery })}
      >
        More {children}
      </ButtonUnobtrusive>)
    )}
  </div>
);

export default FetchMore;