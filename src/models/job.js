const { Model, DataTypes } = require('sequelize');

class Job extends Model {
    static init(sequelize) {
        super.init(
            {
                description: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                price: {
                    type: DataTypes.DECIMAL(12, 2),
                    allowNull: false,
                },
                paid: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                },
                paymentDate: {
                    type: DataTypes.DATE,
                },
            },
            { sequelize, modelName: 'Job' }
        );
    }

    static associate(models) {
        this.belongsTo(models.Contract);
    }
}

module.exports = Job;
