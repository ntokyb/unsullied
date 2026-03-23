const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  category: {
    type: DataTypes.ENUM('cleaning', 'pest-control'),
    allowNull: false
  },
  quoteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'quotes',  // Use table name instead of model name
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'services',
  timestamps: false
});

module.exports = Service;
