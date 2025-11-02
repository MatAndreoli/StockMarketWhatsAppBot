const axios = require('axios');
const { azureFunctionUrl } = require('../settings.js');

const getFiis = async (fiis) => {
    const result = await axios.get(
      `${azureFunctionUrl}/api/fiis?fiis=${fiis}`
    );

    return result.data;
};

module.exports = getFiis;
