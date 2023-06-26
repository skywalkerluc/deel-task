const Profile = require('../src/models/profile');
const Contract = require('../src/models/contract');
const Job = require('../src/models/job');

const clientProfile = {
    id: 1,
    firstName: 'Harry',
    lastName: 'Potter',
    profession: 'Wizard',
    balance: 1150,
    type: 'client',
};

const unrelatedContractorProfile = {
    id: 8,
    firstName: 'Jon',
    lastName: 'Jones',
    profession: 'Fighter',
    balance: 1120,
    type: 'contractor',
};

const contractorProfile = {
    id: 6,
    firstName: 'Linus',
    lastName: 'Torvalds',
    profession: 'Programmer',
    balance: 1214,
    type: 'contractor',
};

const activeContract = {
    id: 2,
    terms: 'bla bla bla',
    status: 'in_progress',
    ClientId: 1,
    ContractorId: 6,
};

const terminatedContract = {
    id: 4,
    terms: 'random-terms',
    status: 'terminated',
    ClientId: 1,
    ContractorId: 6,
};

const unpaidJob = {
    id: 3,
    price: 100,
    description: 'work',
    paid: false,
    ContractId: 2,
};

const jobToBePaid = {
    id: 4,
    price: 200,
    description: 'work',
    paid: false,
    ContractId: 2,
};

const alreadyPaidJob = {
    id: 10,
    price: 300,
    description: 'work',
    paymentDate: '2020-08-15T19:11:26.737Z',
    paid: true,
    ContractId: 2,
};

const fullSetup = async () => {
    await Profile.sync({ force: true });
    await Contract.sync({ force: true });
    await Job.sync({ force: true });

    await Profile.create(clientProfile);
    await Profile.create(contractorProfile);
    await Profile.create(unrelatedContractorProfile);
    await Contract.create(activeContract);
    await Contract.create(terminatedContract);
    await Job.create(unpaidJob);
    await Job.create(jobToBePaid);
    await Job.create(alreadyPaidJob);
};

const setupProfiles = async () => {
    await Profile.sync({ force: true });
    await Profile.create(clientProfile);
    await Profile.create(contractorProfile);
    await Profile.create(unrelatedContractorProfile);
};

const setupContracts = async () => {
    await Contract.sync({ force: true });
    await Contract.create(activeContract);
    await Contract.create(terminatedContract);
};

module.exports = {
    clientProfile,
    contractorProfile,
    activeContract,
    terminatedContract,
    unpaidJob,
    jobToBePaid,
    unrelatedContractorProfile,
    setupProfiles,
    fullSetup,
    setupContracts,
};
