const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models'); // Import user model
const { signToken } = require('../utils/auth'); // Import sign token function from auth.

const resolvers = {
    Query: {
        // Get a single user by user ID or username
        getSingleUser: async (_, { userId, username }) => {
            try {
                if (userId) {
                    return await User.findOne({ _id: userId });
                } else if (username) {
                    return await User.findOne({ username });
                } else {
                    throw new Error('Please provide either a userId or a username!');
                }
            } catch (err) {
                console.log(err);
                throw new Error('Failed to fetch user.');
            }
        },

        // Get all users
        users: async () => {
            try {
                const users = await User.find();
                return users;
            } catch (err) {
                console.log(err);
                throw new Error('Failed to fetch users.');
            }
        },

        // Get the authenticated user
        me: async (_, args, context) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id });
            }
            throw new AuthenticationError('You need to be logged in!');
        },
    },

    Mutation: {
        // Login a user
        login: async (_, { email, password }) => {
            try {
                const user = await User.findOne({ email });
                if (!user) {
                    throw new AuthenticationError('Invalid email or password!');
                }
                const correctPw = await user.isCorrectPassword(password);
                if (!correctPw) {
                    throw new AuthenticationError('Invalid email or password!');
                }
                const token = signToken(user);
                return { token, user };
            } catch (err) {
                console.log(err);
                throw new Error('Failed to login.');
            }
        },

        // Create a new user
        createUser: async (_, { input }) => {
            try {
                const user = await User.create(input);
                const token = signToken(user);
                return { token, user };
            } catch (err) {
                console.log(err);
                throw new Error('Failed to add user.');
            }
        },

        // Save a book to the user's savedBooks array
        saveBook: async (_, { input }, context) => {
            if (context.user) {
                try {
                    const user = await User.findOneAndUpdate(
                        { _id: context.user._id },
                        { $addToSet: { savedBooks: input } },
                        { new: true, runValidators: true }
                    ).populate('savedBooks');
                    return user;
                } catch (error) {
                    console.error(error);
                    throw new Error('Failed to save book');
                }
            }
            throw new AuthenticationError('You are not logged in!');
        },

        // Delete a book from the user's savedBooks array
        deleteBook: async (_, { bookId }, context) => {
            if (context.user) {
                try {
                    const user = await User.findOneAndUpdate(
                        { _id: context.user._id },
                        { $pull: { savedBooks: { bookId } } },
                        { new: true }
                    ).populate('savedBooks');
                    return user;
                } catch (error) {
                    console.error(error);
                    throw new Error('Failed to delete book');
                }
            }
            throw new AuthenticationError('You are not logged in!');
        },
    },
};

module.exports = resolvers;
