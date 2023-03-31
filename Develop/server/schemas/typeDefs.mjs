import gql from 'graphql-tag';

const typeDefs = gql`
type Book {
    bookId: ID!
    authors: [String]
    description: String!
    title: String!
    image: String
    link: String
  }
  
type User {
    _id: ID!
    username: String!
    email: String!
    bookCount: Int
    savedBooks: [Book]
}
  
input BookInput {
    bookId: String!
    authors: [String]
    description: String!
    title: String!
    image: String
    link: String
}
  
input UserInput {
    username: String!
    email: String!
    password: String!
}
  
type Auth {
    token: ID!
    user: User!
}  

type Query {
    getSingleUser(userId: ID!): User
    users: [User]
    me: User
}
  
type Mutation {
    login(email: String!, password: String!): Auth
    createUser(input: UserInput!): Auth
    saveBook(bookInput: BookInput!): User
    deleteBook(bookId: ID!): User
}  
`
export default typeDefs;
