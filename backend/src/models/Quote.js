const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Service = require('./Service');

const Quote = sequelize.define('Quote', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  addressType: {
    type: DataTypes.ENUM('estate', 'house'),
    allowNull: false
  },
  preferredDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  timeBlock: {
    type: DataTypes.ENUM('morning', 'midday', 'afternoon'),
    allowNull: true
  },
  specialInstructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  callOutFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 300.00,
    validate: {
      min: 0
    }
  },
  totalWithCallOut: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('sent_to_whatsapp', 'pending', 'booked', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'sent_to_whatsapp'
  },
  jobCard: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: null
  },
  paymentStatus: {
    type: DataTypes.ENUM('unpaid', 'paid'),
    allowNull: false,
    defaultValue: 'unpaid'
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true
  },
  customerEmail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  billableClientId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  billableQuoteId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  billableInvoiceId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'quotes',
  timestamps: true,
  updatedAt: false
});

// Define associations
Quote.hasMany(Service, {
  foreignKey: 'quoteId',
  as: 'services',
  onDelete: 'CASCADE'
});

Service.belongsTo(Quote, {
  foreignKey: 'quoteId',
  as: 'quote'
});

module.exports = Quote;
