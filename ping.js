const axios = require("axios");

const url = process.env.SERVICE_URL;

const makeRequest = async () => {
  try {
    const response = await axios.get(url);
    console.log(`Request sent to ${url}. Response: ${response.status}`);
  } catch (error) {
    console.error(`Error making request to ${url}: ${error.message}`);
  }
};

module.exports = { makeRequest };
