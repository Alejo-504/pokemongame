const axios = require("axios");
const restApi = "https://pokemonapirest-dev-gxsb.3.us-1.fl0.io";

function updateDataUser(newData, token, ID_USER) {
  axios.post(restApi + "api/logged/update/" + ID_USER, newData, {
    headers: {
      "auth-token": token,
    },
  });
}
module.exports = { updateDataUser };
