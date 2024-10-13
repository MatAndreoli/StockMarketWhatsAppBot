const axios = require('axios');

const getFiis = async (fiis) => {
    const result = await axios.get(
      `https://stockmarketfunction.azurewebsites.net/api/fiis?fiis=${fiis}`
    );

    return result.data;
};

module.exports = getFiis;
