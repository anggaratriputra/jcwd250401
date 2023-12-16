'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Order.belongsTo(models.User, {
        foreignKey: 'userId',
      });
      Order.belongsTo(models.Shipment, {
        foreignKey: 'shipmentId',
      });
      Order.belongsTo(models.Warehouse, {
        foreignKey: 'warehouseId',
      });
      Order.belongsToMany(models.Product, {
        through: 'OrderItems',
        foreignKey: 'orderId',
      });
      Order.hasMany(models.OrderItem, {
        foreignKey: 'orderId',
      });
    }
  }
  Order.init({
    totalPrice: DataTypes.INTEGER,
    paymentProofImage: DataTypes.STRING,
    paymentBy: DataTypes.ENUM('MANDIRI', 'BCA', 'BNI'),
    userId: DataTypes.INTEGER,
    shipmentId: DataTypes.INTEGER,
    status: DataTypes.STRING,
    warehouseId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};