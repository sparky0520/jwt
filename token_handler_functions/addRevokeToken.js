const client = require("./connectDB");

function addRevokeToken(token) {
  client.connect(function (err) {
    if (err) throw err;
    client.query(
      `insert into revokedtokens(token) values(${token})`,
      [],
      function (err, result) {
        if (err) throw err;

        console.log(result);
        client.end(function (err) {
          if (err) throw err;
        });
      }
    );
  });
}

module.exports = addRevokeToken;
