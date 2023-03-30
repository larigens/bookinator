import { gql } from '@apollo/client';

// Get the logged in user's info
export const GET_ME = gql`
  query me {
    me {
      _id
      username
      email
      savedBooks {
        bookId
        authors
        description
        title
        image
        link
      }
      bookCount
    }
  }
`;

// Search Google Books API
export const SEARCH_GOOGLE_BOOKS = gql`
  query searchGoogleBooks($query: String!) {
    searchGoogleBooks(query: $query) {
      items {
        id
        volumeInfo {
          authors
          description
          title
          imageLinks {
            thumbnail
          }
          infoLink
        }
      }
    }
  }
`;


// make a search to google books api
// https://www.googleapis.com/books/v1/volumes?q=harry+potter
export const searchGoogleBooks = (query) => {
    return fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
  };
