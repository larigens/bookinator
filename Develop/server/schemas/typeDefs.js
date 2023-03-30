const { gql } = require('apollo-server-express');

const typeDefs = gql`
type Book {
    bookId: String
    authors: [String]
    description: String
    title: String
    image: String
    link: String
  }
  
type User {
    _id: ID!
    username: String!
    email: String!
    password: String!
    savedBooks: [Book]!
    bookCount: Int!
}
  
type Auth {
    token: ID!
    user: User
}
  
input BookInput {
    bookId: String!
    authors: [String]
    description: String
    title: String
    image: String
    link: String
}
  
input UserInput {
    username: String!
    email: String!
    password: String!
}
  
type Query {
    getSingleUser(userId: ID!): User
    users: [User]
    me: User
}
  
type Mutation {
    login(email: String!, password: String!): Auth
    createUser(input: UserInput!): Auth
    saveBook(input: BookInput!): User
    deleteBook(bookId: String!): User
}  
`
module.exports = typeDefs;
