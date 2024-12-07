const client = require("./connectDB");

function checkTokenRevoked(token) {
  client.connect(function (err) {
    if (err) throw err;
    client.query(
      `select * from revokedtokens where token=${token}`,
      [],
      function (err, result) {
        if (err) throw err;
        if (result.rowCount > 0) {
          return true;
        } else {
          return false;
        }
      }
    );
  });
}

module.exports = checkTokenRevoked;
