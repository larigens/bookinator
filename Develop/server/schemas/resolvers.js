const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models/index.js');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id })
                    .select('-password')
                    .populate('savedBooks');
            }
            throw new AuthenticationError('You need to be logged in!');
        },
    },
    Mutation: {
        login: async (parent, { email, password }) => {
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
                throw new Error(`Failed to login. ${err.message}`);
            }
        },
        addUser: async (parent, { username, email, password }) => {
            try {
                const user = await User.create({ username, email, password });
                const token = signToken(user);
                return { token, user };
            } catch (err) {
                throw new Error(`Failed to add user: ${err.message}`);
            }
        },
        saveBook: async (parent, { bookInput }, context) => {
            if (context.user) {
                try {
                    const user = await User.findOneAndUpdate(
                        { _id: context.user._id, savedBooks: { $not: { $elemMatch: { bookId: bookInput.bookId } } } },
                        { $addToSet: { savedBooks: bookInput } },
                        { new: true, runValidators: true }
                    ).populate('savedBooks');
                    return user;
                } catch (error) {
                    throw new Error(`Failed to save book: ${err.message}`);
                }
            }
            throw new AuthenticationError('You are not logged in!');
        },
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                try {
                    const user = await User.findOneAndUpdate(
                        { _id: context.user._id },
                        { $pull: { savedBooks: { bookId } } },
                        { new: true }
                    ).populate('savedBooks');
                    return user;
                } catch (error) {
                    throw new Error(`Failed to delete book: ${err.message}`);
                }
            }
            throw new AuthenticationError('You are not logged in!');
        },
    },
};

module.exports = resolvers;