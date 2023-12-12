const { Op } = require("sequelize");
const axios = require("axios");
const { Order, OrderItem, Product, ProductImage, Warehouse } = require("../models");

// Config default axios with rajaongkir
axios.defaults.baseURL = "https://api.rajaongkir.com/starter";
axios.defaults.headers.common["key"] = process.env.RAJAONGKIR_APIKEY;
axios.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";

exports.getOrderCost = async (req, res) => {
  try {
    // Get data from request query params
    const { origin, destination, weight, courier } = req.query;

    const response = await axios.post("/cost", {
      origin,
      destination,
      weight,
      courier,
    });

    return res.status(200).json({
      ok: true,
      message: "Get cost successfully",
      detail: response.data.rajaongkir.results,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
      detail: String(error),
    });
  }
};

exports.paymentProof = async (req, res) => {
  const { id, userId } = req.params;

  try {
    const order = await Order.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!order) {
      return res.status(404).json({
        ok: false,
        message: "Order not found",
      });
    }

    if (req.file) {
      order.paymentProofImage = req.file.filename;
    }

    await order.save();
    return res.status(200).json({
      ok: true,
      message: "Payment proof uploaded successfully",
      detail: order,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
      detail: String(error),
    });
  }
};

// get user order
exports.getOrderLists = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status = "all", page = 1, size = 10, sort = "createdAt", order = "DESC" } = req.query;
    const limit = parseInt(size);
    const offset = (parseInt(page) - 1) * limit;

    const filter = {
      include: [
        {
          model: Order,
          attributes: ["id", "status", "totalPrice", "userId"],
          where: status !== "all" ? { status } : undefined,
        },
        {
          model: Product,
          attributes: ["id", "name", "description", "price", "gender", "weight"],
        },
      ],
      where: {
        "$Order.status$": status !== "all" ? status : { [Op.ne]: null },
      },
      limit: limit,
      offset: offset,
    };

    if (sort) {
      if (sort === "totalPrice") {
        filter.order = [[{ model: Order, as: "Order" }, sort, order]];
      } else {
        filter.order = [[sort, order]];
      }
    }

    if (userId) {
      filter.include[0].where = { userId };
    }

    const orderLists = await OrderItem.findAll(filter);

    if (orderLists.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "No Data matches",
      });
    }

    const orderListsWithImages = await Promise.all(
      orderLists.map(async (orderItem) => {
        const product = orderItem.Product;

        const productImages = await ProductImage.findAll({
          where: { productId: product.id },
          attributes: ["id", "imageUrl"],
        });

        return {
          id: orderItem.id,
          productId: product.id,
          orderId: orderItem.Order.id,
          quantity: orderItem.quantity,
          createdAt: orderItem.createdAt,
          updatedAt: orderItem.updatedAt,
          Order: {
            id: orderItem.Order.id,
            status: orderItem.Order.status,
            totalPrice: orderItem.Order.totalPrice,
            userId: orderItem.Order.userId,
          },
          Product: {
            id: product.id,
            productName: product.name,
            productDescription: product.description,
            productPrice: product.price,
            productGender: product.gender,
            productWeight: product.weight,
            productImages: productImages,
          },
        };
      })
    );

    return res.status(200).json({
      ok: true,
      message: "Get all order successfully",
      detail: orderListsWithImages,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
      detail: String(error),
    });
  }
};

// Get all order lists from all users

exports.getAllOrderLists = async (req, res) => {
  try {
    const { status = "all", page = 1, size = 10, sort = "createdAt", order = "DESC", warehouseId, month} = req.query;
    const limit = parseInt(size);
    const offset = (parseInt(page) - 1) * limit;

    const filter = {
      include: [
        {
          model: Order,
          attributes: ["id", "status", "totalPrice", "userId", "warehouseId"],
          where: status !== "all" ? { status } : undefined,
        },
        {
          model: Product,
          attributes: ["id", "name", "description", "price", "gender", "weight"],
        },
      ],
      where: {
        "$Order.status$": status !== "all" ? status : { [Op.ne]: null },
      },
      limit: limit,
      offset: offset,
    };

    if (sort) {
      if (sort === "totalPrice") {
        filter.order = [[{ model: Order, as: "Order" }, sort, order]];
      } else {
        filter.order = [[sort, order]];
      }
    }

    if (warehouseId) {
      filter.include[0].where = { warehouseId };
    }

    if (month) {
      const monthInt = parseInt(month);

      filter.where = {
        ...filter.where,
        createdAt: {
          [Op.and]: [
            { [Op.gte]: new Date(new Date().getFullYear(), monthInt - 1, 1) },
            { [Op.lte]: new Date(new Date().getFullYear(), monthInt, 0) },
          ],
        },
      };
    }

    const orderLists = await OrderItem.findAll(filter);

    if (orderLists.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "No Data matches",
      });
    }

    const orderListsWithImages = await Promise.all(
      orderLists.map(async (orderItem) => {
        const product = orderItem.Product;

        const warehouse = await Warehouse.findOne({
          where: { id: orderItem.Order.warehouseId },
          attributes: ["id", "name"],
        });

        const productImages = await ProductImage.findAll({
          where: { productId: product.id },
          attributes: ["id", "imageUrl"],
        });

        return {
          id: orderItem.id,
          productId: product.id,
          orderId: orderItem.Order.id,
          quantity: orderItem.quantity,
          createdAt: orderItem.createdAt,
          updatedAt: orderItem.updatedAt,
          Order: {
            id: orderItem.Order.id,
            status: orderItem.Order.status,
            totalPrice: orderItem.Order.totalPrice,
            userId: orderItem.Order.userId,
            warehouse: {
              id: warehouse.id,
              warehouseName: warehouse.name,
            },
          },
          Product: {
            id: product.id,
            productName: product.name,
            productDescription: product.description,
            productPrice: product.price,
            productGender: product.gender,
            productWeight: product.weight,
            productImages: productImages,
          },
          
        };
      })
    );

    return res.status(200).json({
      ok: true,
      message: "Get all order successfully",
      detail: orderListsWithImages,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
      detail: String(error),
    });
  }
}