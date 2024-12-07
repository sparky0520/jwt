require("dotenv").config();
const fs = require("fs");
const pg = require("pg");
const url = require("url");

const config = {
  user: process.env.REVOKED_TOKEN_DB_USERNAME,
  password: process.env.REVOKED_TOKEN_DB_PASSWORD,
  host: process.env.REVOKED_TOKEN_DB_HOST,
  port: process.env.REVOKED_TOKEN_DB_PORT,
  database: process.env.REVOKED_TOKEN_DB_NAME,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync("ca.pem").toString(),
  },
};

const client = new pg.Client(config);

module.exports = client;
