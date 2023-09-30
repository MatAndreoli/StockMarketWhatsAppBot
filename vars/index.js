const { config } = require('dotenv');
config()

const API_URL = process.env.NODE_ENV === 'local' ? 'http://localhost:3000' : process.env.API_URL;

module.exports = { API_URL }
