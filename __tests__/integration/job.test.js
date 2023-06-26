const request = require('supertest');
const app = require('../../src/app');
const Profile = require('../../src/models/profile');
const Job = require('../../src/models/job');
const sequelize = require('../../src/db');
const {
    activeContract,
    clientProfile,
    contractorProfile,
    unpaidJob,
    fullSetup,
    jobToBePaid,
    unrelatedContractorProfile,
} = require('../setup');

describe('Job service', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
        await fullSetup();
    });

    describe('GET /jobs/unpaid', () => {
        it('should return the unpaid jobs for a user', async () => {
            const headers = { profile_id: clientProfile.id };
            const response = await request(app)
                .get('/jobs/unpaid')
                .set(headers)
                .send();

            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: unpaidJob.id,
                        price: unpaidJob.price,
                        paid: unpaidJob.paid,
                        description: unpaidJob.description,
                        ContractId: activeContract.id,
                    }),
                ])
            );
        });

        it('should return 404 if no unpaid jobs are found', async () => {
            const headers = { profile_id: unrelatedContractorProfile.id };
            const response = await request(app)
                .get('/jobs/unpaid')
                .set(headers)
                .send();

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'No jobs found' });
        });
    });

    describe('POST /jobs/:job_id/pay', () => {
        it('should pay for a job and update the balances', async () => {
            const initialClientState = await Profile.findByPk(clientProfile.id);

            const initialContractorState = await Profile.findByPk(
                contractorProfile.id
            );

            const headers = { profile_id: clientProfile.id };
            const response = await request(app)
                .post(`/jobs/${jobToBePaid.id}/pay`)
                .set(headers)
                .send();

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Payment successful' });

            const job = await Job.findByPk(jobToBePaid.id);
            expect(job.paid).toBe(true);

            const contractor = await Profile.findByPk(contractorProfile.id);
            expect(contractor.balance).toEqual(
                initialContractorState.balance + job.price
            );

            const client = await Profile.findByPk(clientProfile.id);
            expect(client.balance).toEqual(
                initialClientState.balance - job.price
            );
        });

        it('should return 404 if the job does not exist', async () => {
            const headers = { profile_id: clientProfile.id };
            const response = await request(app)
                .post('/jobs/9999/pay')
                .set(headers)
                .send();

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Job not found' });
        });

        it('should return 401 if the job is not associated with the client profile, and therefore, unauthorized to make the payment', async () => {
            const headers = { profile_id: unrelatedContractorProfile.id };
            const response = await request(app)
                .post(`/jobs/${jobToBePaid.id}/pay`)
                .set(headers)
                .send();
            expect(response.status).toBe(401);
            expect(response.body).toEqual({ message: 'Unauthorized' });
        });

        it('should return 400 if the job is already paid', async () => {
            // Mark the job as paid
            await Job.update({ paid: true }, { where: { id: jobToBePaid.id } });

            const headers = { profile_id: clientProfile.id };
            const response = await request(app)
                .post(`/jobs/${jobToBePaid.id}/pay`)
                .set(headers)
                .send();

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: 'Job already paid' });
        });

        it('should return 400 if the client has insufficient balance', async () => {
            // Set the client balance lower than the job price
            await Profile.update(
                { balance: 10 },
                { where: { id: clientProfile.id } }
            );

            const headers = { profile_id: clientProfile.id };
            const response = await request(app)
                .post(`/jobs/${unpaidJob.id}/pay`)
                .set(headers)
                .send();

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: 'Insufficient balance' });
        });
    });

    afterAll(async () => {
        await sequelize.close();
    });
});
