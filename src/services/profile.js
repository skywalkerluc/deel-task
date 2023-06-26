const Profile = require('../models/profile');
const Job = require('../models/job');
const { Op, fn, col, literal } = require('sequelize');
const Contract = require('../models/contract');

module.exports = {
    async deposit(req, res) {
        const { id } = req.profile;
        const totalJobs = await Job.sum('price', {
            where: {
                '$Contract.ClientId$': id,
                paid: true,
            },
            include: [
                {
                    model: Contract,
                    as: 'Contract',
                    include: [
                        {
                            model: Profile,
                            as: 'Client',
                        },
                    ],
                },
            ],
        });

        const maxDeposit = totalJobs * 0.25;

        const { depositAmount } = req.body;

        if (depositAmount > maxDeposit) {
            return res
                .status(400)
                .json({ message: 'Deposit amount exceeds the limit' });
        }

        const updatedBalance = req.profile.balance + depositAmount;
        await Profile.update({ balance: updatedBalance }, { where: { id } });

        res.status(200).json({ message: 'Deposit successful' });
    },

    async getBestProfession(req, res) {
        const { start, end } = req.query;

        const profiles = await Profile.findAll({
            attributes: [
                'profession',
                [fn('sum', col('Contractor.Jobs.price')), 'total'],
            ],
            group: ['profession'],
            order: literal('total DESC'),
            where: {
                type: 'contractor',
            },
            include: [
                {
                    model: Contract,
                    attributes: [],
                    as: 'Contractor',
                    include: [
                        {
                            model: Job,
                            as: 'Jobs',
                            attributes: [],
                            where: {
                                paid: true,
                                paymentDate: { [Op.between]: [start, end] },
                            },
                        },
                    ],
                },
            ],
        });
        if (profiles.length === 0) {
            return res.status(406).json({ message: 'Not enough data' }).end();
        }

        res.json({ profession: profiles[0].profession });
    },

    async getBestClients(req, res) {
        const { start, end, limit = 2 } = req.query;

        const profiles = await Profile.findAll({
            attributes: [
                'id',
                [literal("firstName || ' ' || lastName"), 'fullName'],
                [fn('sum', col('price')), 'paid'],
            ],
            where: {
                type: 'client',
            },
            group: [col('Profile.id')],
            order: literal('paid DESC'),
            limit,
            include: [
                {
                    duplicating: false,
                    model: Contract,
                    attributes: [],
                    as: 'Client',
                    required: true,
                    include: [
                        {
                            model: Job,
                            as: 'Jobs',
                            duplicating: false,
                            attributes: [],
                            required: true,
                            where: {
                                paid: true,
                                paymentDate: { [Op.between]: [start, end] },
                            },
                        },
                    ],
                },
            ],
        });
        if (profiles.length === 0) {
            return res.status(406).json({ message: 'Not enough data' }).end();
        }

        res.json(profiles);
    },
};
