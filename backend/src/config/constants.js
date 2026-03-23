require('dotenv').config();

module.exports = {
  CALL_OUT_FEE: parseFloat(process.env.CALL_OUT_FEE) || 300.00
};
