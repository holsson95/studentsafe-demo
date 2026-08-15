require('dotenv').config();

module.exports = {
  alma: {
    key: process.env.ALMA_KEY,
    secret: process.env.ALMA_SECRET,
  },
};
