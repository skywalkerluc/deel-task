const express = require('express');
const { getProfile } = require('./middleware/getProfile');

const ContractService = require('./services/contract');
const JobService = require('./services/job');
const ProfileService = require('./services/profile');

const routes = express.Router();

routes.get('/contracts/:id', getProfile, ContractService.get);
routes.get('/contracts', getProfile, ContractService.getFromProfile);

routes.get('/jobs/unpaid', getProfile, JobService.getUnpaid);
routes.post('/jobs/:job_id/pay', getProfile, JobService.pay);

routes.post('/balances/deposit/:userId', getProfile, ProfileService.deposit);

routes.get('/admin/best-professions', ProfileService.getBestProfession);
routes.get('/admin/best-clients', ProfileService.getBestClients);

module.exports = routes;
