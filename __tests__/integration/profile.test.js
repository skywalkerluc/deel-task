const request = require('supertest');
const app = require('../../src/app');
const Profile = require('../../src/models/profile');
const sequelize = require('../../src/db');
const { clientProfile, contractorProfile, fullSetup } = require('../setup');

describe('Profile service', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
        await fullSetup();
    });

    describe('POST /balances/deposit/:userId', () => {
        it('should deposit money into the profile balance', async () => {
            const headers = { profile_id: clientProfile.id };
            const depositAmount = 50;
            const response = await request(app)
                .post(`/balances/deposit/${clientProfile.id}`)
                .set(headers)
                .send({ depositAmount });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Deposit successful' });

            const updatedProfile = await Profile.findByPk(clientProfile.id);
            expect(updatedProfile.balance).toBe(
                clientProfile.balance + depositAmount
            );
        });

        it('should return 400 if the deposit amount exceeds the limit', async () => {
            const headers = { profile_id: clientProfile.id };
            const depositAmount = 1000;
            const response = await request(app)
                .post(`/balances/deposit/${clientProfile.id}`)
                .set(headers)
                .send({ depositAmount });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                message: 'Deposit amount exceeds the limit',
            });
        });
    });

    describe('GET /admin/best-professions', () => {
        it('should return the best professions based on total paid amount', async () => {
            const headers = { profile_id: clientProfile.id };
            const start = '2022-01-01';
            const end = '2022-12-31';
            const response = await request(app)
                .get('/admin/best-professions')
                .set(headers)
                .query({ start, end });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ profession: 'Programmer' });
        });
    });

    describe('GET /admin/best-clients', () => {
        it('should return the best clients based on total paid amount', async () => {
            const headers = { profile_id: contractorProfile.id };
            const start = '2019-01-01';
            const end = '2022-12-31';
            const limit = 2;
            const response = await request(app)
                .get('/admin/best-clients')
                .set(headers)
                .query({ start, end, limit });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(expect.any(Array));
            expect(response.body.length).toBeLessThanOrEqual(limit);
            expect(response.body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: clientProfile.id,
                        fullName: `${clientProfile.firstName} ${clientProfile.lastName}`,
                        paid: 300,
                    }),
                ])
            );
        });
    });

    afterAll(async () => {
        await sequelize.close();
    });
});
