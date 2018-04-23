const environment = process.env.NODE_ENV || 'development';
const knex = require('knex');
const config = require('../knexfile')[environment];
module.exports = knex(config);
