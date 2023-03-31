import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const secret = process.env.JWT_SECRET;
const expiration = '2h';

export const authMiddleware = ({ req }) => {
  // Allows token to be sent via req.body, req.query, or headers
  let token = req.body.token || req.query.token || req.headers.authorization;
  // We split the token string into an array and return actual token
  if (req.headers.authorization) {
    token = token.split(' ').pop().trim();
  }
  // Checks if the token is included in the request body, query parameters, or authorization headers.
  if (!token) {
    return req; // Returns the original request object.
  }

  // If token can be verified, add the decoded user's data to the request so it can be accessed in the resolver.
  try {
    const { data } = jwt.verify(token, secret, { maxAge: expiration });
    req.user = data;
  } catch (err) {
    console.log('Invalid token:', err.message);
  }

  // Return the request object so it can be passed to the resolver as `context`
  return req;
};

export const signToken = ({ username, email, _id }) => {
  // Takes in an object with user data.
  const payload = { username, email, _id };
  return jwt.sign({ data: payload }, secret, { expiresIn: expiration }); // Returns a new JWT that includes that data in the payload.
};
