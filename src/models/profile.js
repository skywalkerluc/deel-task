const { Model, DataTypes } = require('sequelize');

class Profile extends Model {
    static init(sequelize) {
        super.init(
            {
                firstName: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                lastName: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                profession: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                balance: {
                    type: DataTypes.DECIMAL(12, 2),
                },
                type: {
                    type: DataTypes.ENUM('client', 'contractor'),
                },
            },
            { sequelize, modelName: 'Profile' }
        );
    }

    static associate(models) {
        this.hasMany(models.Contract, {
            as: 'Contractor',
            foreignKey: 'ContractorId',
        });
        this.hasMany(models.Contract, {
            as: 'Client',
            foreignKey: 'ClientId',
        });
    }
}

module.exports = Profile;
