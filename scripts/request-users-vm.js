
const https = require('https');


const { VMs } = require("./VMs");
const axios = require('axios');
const windowsQuery = 'user_info_output'

const getUsersVM = async (hostname, query = 'script_Sockets') => {
  try {
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://prometheus-serverslv-test-part3.partdp.ir:9090/api/v1/query?query=${query}{host="${hostname}"}`,
      headers: {
        'Authorization': 'Basic YWRtaW46ajlQUUVxSXNoOG5VVDF0NQ=='
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    };

    let response = await axios.request(config)
    return response.data
  } catch (error) {
    console.error(`${hostname}: ${error}`)
  }
}

module.exports = {
  getUsersVM
}