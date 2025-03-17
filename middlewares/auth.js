require('dotenv').config();
const { withAuth } = require('@clerk/clerk-sdk-node');

const authMiddleware = (req, res, next) => {
    withAuth({
      apiKey: process.env.CLERK_SECRET_KEY, 
      apiPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    })(req, res, next);
  };
  
  module.exports = authMiddleware;
  