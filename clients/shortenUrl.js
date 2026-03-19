const axios = require('axios');

const shortenUrl = async (url) => {
  try {
    const { data } = await axios.get(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`
    );
    return data;
  } catch (e) {
    return url;
  }
};

module.exports = shortenUrl;
