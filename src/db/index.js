const Sequelize = require('sequelize');
const config = require('config');
const dbConfig = config.get('database');

const connection = new Sequelize({
    dialect: dbConfig.dialect,
    storage: dbConfig.storage,
});

const Job = require('../models/job');
const Profile = require('../models/profile');
const Contract = require('../models/contract');

Job.init(connection);
Profile.init(connection);
Contract.init(connection);

Job.associate(connection.models);
Profile.associate(connection.models);
Contract.associate(connection.models);

module.exports = connection;
