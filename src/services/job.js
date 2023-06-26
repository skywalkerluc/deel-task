const { Op } = require('sequelize');
const connection = require('../db');
const Job = require('../models/job');
const Contract = require('../models/contract');
const Profile = require('../models/profile');

module.exports = {
    async getUnpaid(req, res) {
        const { id } = req.profile;
        const activeUnpaidJobsForUser = await Job.findAll({
            include: [
                {
                    model: Contract,
                    where: {
                        [Op.or]: [{ ContractorId: id }, { ClientId: id }],
                        status: {
                            [Op.ne]: 'terminated',
                        },
                    },
                },
            ],
            where: {
                paid: false,
            },
        });

        if (activeUnpaidJobsForUser.length === 0) {
            return res.status(404).json({ message: 'No jobs found' });
        }
        res.json(activeUnpaidJobsForUser);
    },

    async pay(req, res) {
        const { job_id } = req.params;
        const { id } = req.profile;

        const job = await Job.findByPk(job_id, {
            include: [
                {
                    model: Contract,
                    as: 'Contract',
                    include: [
                        { model: Profile, as: 'Contractor' },
                        { model: Profile, as: 'Client' },
                    ],
                },
            ],
        });

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.Contract.ClientId !== id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (job.paid) {
            return res.status(400).json({ message: 'Job already paid' });
        }

        if (job.price > job.Contract.Client.balance) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        const transaction = await connection.transaction();

        try {
            const updatedContractorBalance =
                job.Contract.Contractor.balance + job.price;

            const updatedClientBalance =
                job.Contract.Client.balance - job.price;

            await Profile.update(
                { balance: updatedContractorBalance },
                {
                    where: { id: job.Contract.ContractorId },
                    transaction,
                }
            );

            await Profile.update(
                { balance: updatedClientBalance },
                {
                    where: { id: job.Contract.ClientId },
                    transaction,
                }
            );

            await Job.update(
                { paid: true, paymentDate: new Date() },
                {
                    where: { id: job_id },
                    transaction,
                }
            );

            await transaction.commit();

            res.status(200).json({ message: 'Payment successful' });
        } catch (error) {
            await transaction.rollback();
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
};
