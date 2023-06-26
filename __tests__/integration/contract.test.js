const request = require('supertest');
const app = require('../../src/app');
const sequelize = require('../../src/db');
const {
    activeContract,
    clientProfile,
    contractorProfile,
    setupProfiles,
    setupContracts,
} = require('../setup');

describe('Contract service', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
        await setupProfiles();
        await setupContracts();
    });

    describe('GET', () => {
        it('when hitting the middleware with a non-existing profile', async () => {
            const headers = { profile_id: 9999 };
            const { id } = activeContract;
            const response = await request(app)
                .get(`/contracts/${id}`)
                .set(headers)
                .send();
            expect(response.status).toBe(401);
        });

        it('when requesting with no headers', async () => {
            const { id } = activeContract;
            const response = await request(app).get(`/contracts/${id}`).send();
            expect(response.status).toBe(401);
        });

        it('when getting a contract using the contractor profile as header, should return the expected model', async () => {
            await setupProfiles();
            await setupContracts();
            const headers = { profile_id: contractorProfile.id };
            const { id } = activeContract;
            const response = await request(app)
                .get(`/contracts/${id}`)
                .set(headers)
                .send();
            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    ClientId: activeContract.ClientId,
                    ContractorId: activeContract.ContractorId,
                    id: activeContract.id,
                    status: activeContract.status,
                    terms: activeContract.terms,
                })
            );
        });

        it('when getting a contract using the client profile as header, should return the expected model', async () => {
            const headers = { profile_id: clientProfile.id };
            const { id } = activeContract;
            const response = await request(app)
                .get(`/contracts/${id}`)
                .set(headers)
                .send();
            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    ClientId: activeContract.ClientId,
                    ContractorId: activeContract.ContractorId,
                    id: id,
                    status: activeContract.status,
                    terms: activeContract.terms,
                })
            );
        });

        it('when trying to fetch a non-existing record, should return 404', async () => {
            const headers = { profile_id: clientProfile.id };
            const contractId = 9999;
            const response = await request(app)
                .get(`/contracts/${contractId}`)
                .set(headers)
                .send();
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Contract not found' });
        });
    });

    describe('GET FROM PROFILE (non-terminated)', () => {
        it('when hitting the middleware with a non-existing profile', async () => {
            const headers = { profile_id: 9999 };
            const response = await request(app)
                .get('/contracts/')
                .set(headers)
                .send();
            expect(response.status).toBe(401);
        });

        it('when getting contracts from profile using client profile, should return the expected model', async () => {
            const headers = { profile_id: clientProfile.id };
            const response = await request(app)
                .get('/contracts/')
                .set(headers)
                .send();
            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: activeContract.id,
                        terms: activeContract.terms,
                        status: activeContract.status,
                        ContractorId: activeContract.ContractorId,
                        ClientId: activeContract.ClientId,
                    }),
                ])
            );
        });

        it('when getting contracts from profile using contractor profile, should return the expected model', async () => {
            const headers = { profile_id: contractorProfile.id };
            const response = await request(app)
                .get('/contracts/')
                .set(headers)
                .send();
            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: activeContract.id,
                        terms: activeContract.terms,
                        status: activeContract.status,
                        ContractorId: activeContract.ContractorId,
                        ClientId: activeContract.ClientId,
                    }),
                ])
            );
        });
    });

    afterAll(async () => {
        await sequelize.close();
    });
});
