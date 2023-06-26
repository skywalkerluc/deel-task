const { Model, DataTypes } = require('sequelize');

class Contract extends Model {
    static init(sequelize) {
        super.init(
            {
                terms: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                status: {
                    type: DataTypes.ENUM('new', 'in_progress', 'terminated'),
                },
            },
            { sequelize, modelName: 'Contract' }
        );
    }

    static associate(models) {
        this.belongsTo(models.Profile, {
            as: 'Contractor',
        });
        this.belongsTo(models.Profile, {
            as: 'Client',
        });
        this.hasMany(models.Job, { as: 'Jobs', foreignKey: 'ContractId' });
    }
}

module.exports = Contract;
