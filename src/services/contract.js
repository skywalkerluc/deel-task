const { Op } = require('sequelize');
const Contract = require('../models/contract');

module.exports = {
    async get(req, res) {
        const { id } = req.params;
        const { id: restrictedId } = req.profile;
        const contract = await Contract.findOne({
            where: {
                id,
                [Op.or]: [
                    { ContractorId: restrictedId },
                    { ClientId: restrictedId },
                ],
            },
        });
        if (!contract)
            return res.status(404).json({ message: 'Contract not found' });
        res.json(contract);
    },

    async getFromProfile(req, res) {
        const { id } = req.profile;
        const contracts = await Contract.findAll({
            where: {
                [Op.or]: [{ ContractorId: id }, { ClientId: id }],
                status: { [Op.ne]: 'terminated' },
            },
        });

        if (contracts.length === 0) {
            return res.status(404).json({ message: 'No contracts found' });
        }
        res.json(contracts);
    },
};
