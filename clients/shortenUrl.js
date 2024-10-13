const axios = require('axios');

const shortenUrl = async (url) => {
  try {
    const shortenUrlApi = 'https://smolurl.com/api/links';
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
    const {
      data: {
        data: { short_url },
      },
    } = await axios.post(shortenUrlApi, { url }, { headers });
    return short_url;
  } catch (e) {
    return url;
  }
};

module.exports = shortenUrl;
