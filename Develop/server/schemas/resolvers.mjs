import { AuthenticationError } from 'apollo-server-express';
import User from '../models/index.mjs';
import { signToken } from '../utils/auth.mjs';

const resolvers = {
    Query: {
        getSingleUser: async (_, { userId, username }) => {
            try {
                if (userId && username) {
                    throw new Error('Please provide only one of userId or username!');
                } else if (userId) {
                    return await User.findOne({ _id: userId });
                } else if (username) {
                    return await User.findOne({ username });
                } else {
                    throw new Error('Please provide either a userId or a username!');
                }
            } catch (err) {
                throw new Error(`Failed to fetch user: ${err.message}`);
            }
        },
        users: async () => {
            try {
                const users = await User.find();
                return users;
            } catch (err) {
                throw new Error(`Failed to fetch user: ${err.message}`);
            }
        },
        me: async (_, args, context) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id })
                    .select('-password')
                    .populate('savedBooks');
            }
            throw new AuthenticationError('You need to be logged in!');
        },
    },
    Mutation: {
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
                throw new Error(`Failed to login. ${err.message}`);
            }
        },
        createUser: async (_, { input }) => {
            try {
                const { name, email, password } = input;
                const user = await User.create({ name, email, password });
                const token = signToken(user);
                return { token, user };
            } catch (err) {
                throw new Error(`Failed to add user: ${err.message}`);
            }
        },
        saveBook: async (_, { bookInput }, context) => {
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
                    throw new Error(`Failed to delete book: ${err.message}`);
                }
            }
            throw new AuthenticationError('You are not logged in!');
        },
    },
};


export default resolvers