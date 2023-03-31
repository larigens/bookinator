const mongoose = require('mongoose');
require("dotenv").config(); // To use environment variables.

mongoose.set('strictQuery', false);

mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_LOCAL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = mongoose.connection;