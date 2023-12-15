const { Sequelize, Op } = require("sequelize");
const axios = require("axios");
const fs = require("fs").promises;
const { Address, Order, OrderItem, Product, ProductImage, Warehouse, Shipment, Cart, CartItem, User, sequelize } = require("../models");

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
  const t = await sequelize.transaction();

  try {
    const order = await Order.findOne({
      where: {
        id,
        userId,
      },
      transaction: t,
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({
        ok: false,
        message: "Order not found",
      });
    }

    if (req.file) {
      order.paymentProofImage = req.file.filename;
    } else {
      await t.rollback();
      return res.status(400).json({
        ok: false,
        message: "Payment proof image is required",
      });
    }

    order.status = "waiting-for-payment-confirmation";
    await order.save({ transaction: t });
    await t.commit();

    return res.status(200).json({
      ok: true,
      message: "Payment proof uploaded successfully",
      detail: order,
    });
  } catch (error) {
    await t.rollback();
    console.error(error);

    if (req.file) {
      const filePath = `../public/${req.file.filename}`;
      await fs.unlink(filePath); // Delete file from public folder
    }
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
      detail: String(error),
    });
  }
};

exports.rejectPayment = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findOne({
      where: {
        id,
      },
    });

    if (!order) {
      return res.status(404).json({
        ok: false,
        message: "Order not found",
      });
    }

    order.status = "payment-rejected";

    await order.save();

    return res.status(200).json({
      ok: true,
      message: "Payment rejected successfully",
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

exports.confirmPayment = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findOne({
      where: {
        id,
      },
    });

    if (!order) {
      return res.status(404).json({
        ok: false,
        message: "Order not found",
      });
    }

    order.status = "processed";

    await order.save();
    return res.status(200).json({
      ok: true,
      message: "Payment confirmed successfully",
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


// Get all order lists from all users
exports.getAllOrderLists = async (req, res) => {
  try {
    const { status = "all", page = 1, size = 10, sort = "createdAt", order = "DESC", warehouseId, month } = req.query;
    const limit = parseInt(size);
    const offset = (parseInt(page) - 1) * limit;

    const filter = {
      include: [
        {
          model: Order,
          attributes: ["id", "status", "paymentProofImage", "totalPrice", "userId", "warehouseId", "shipmentId", "createdAt", "updatedAt"],
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
          [Op.and]: [{ [Op.gte]: new Date(new Date().getFullYear(), monthInt - 1, 1) }, { [Op.lte]: new Date(new Date().getFullYear(), monthInt, 0) }],
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

        const shipment = await Shipment.findOne({
          where: { id: orderItem.Order.shipmentId },
          attributes: ["id", "name", "cost", "addressId"],
        });

        const address = await Address.findOne({
          where: { id: shipment.addressId },
          attributes: ["id", "firstName", "lastName", "phoneNumber", "street", "city", "province", "district", "subDistrict"],
        });

        const user = await User.findOne({
          where: { id: orderItem.Order.userId },
          attributes: ["id", "username", "firstName", "lastName"],
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
          paymentProofImage: orderItem.Order.paymentProofImage,
          Order: {
            id: orderItem.Order.id,
            status: orderItem.Order.status,
            totalPrice: orderItem.Order.totalPrice,
            user: {
              id: user.id,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
            },
            warehouse: {
              id: warehouse.id,
              warehouseName: warehouse.name,
            },
            shipment: {
              id: shipment.id,
              shipmentName: shipment.name,
              shipmentCost: shipment.cost,
              address: {
                id: address.id,
                firstName: address.firstName,
                lastName: address.lastName,
                phoneNumber: address.phoneNumber,
                street: address.street,
                city: address.city,
                province: address.province,
                district: address.district,
                subDistrict: address.subDistrict,
              },
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
};

// create order

exports.createOrder = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { addressId, warehouseId, productOnCart, shippingCost, paymentBy } = req.body;

    const order = await Order.create({
      userId,
      warehouseId,
      paymentBy,
      status: "waiting-for-payment",
    });

    const orderItems = await Promise.all(
      productOnCart.map(async (item) => {
        const product = await Product.findOne({
          where: { id: item.productId },
          attributes: ["id", "price"],
        });

        return {
          orderId: order.id,
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        };
      })
    );

    await OrderItem.bulkCreate(orderItems);

    // Calculate the total price of all products
    const totalProductPrice = orderItems.reduce((acc, item) => acc + item.quantity * item.price, 0);

    // Access the shipping cost directly from the array
    const shippingCostValue = shippingCost[1];

    // Calculate the total order price by adding the total product price and the shipping cost
    const totalOrderPrice = totalProductPrice + shippingCostValue;

    // Update the totalPrice column in the Order table
    await order.update({ totalPrice: totalOrderPrice });

    // Create shipment

    const shipment = await Shipment.create({
      name: shippingCost[0], // Accessing the shipping method directly
      cost: shippingCost[1], // Accessing the cost directly
      addressId: addressId,
    });

    // Update shipmentId in Order table
    await order.update({ shipmentId: shipment.id });

    // delete cart
    const cartIdsToDelete = productOnCart.map((item) => item.cartId);

    await CartItem.destroy({
      where: { cartId: cartIdsToDelete },
    });

    await Cart.destroy({
      where: { userId },
    });

    return res.status(201).json({
      ok: true,
      message: "Order created successfully",
      detail: { order, orderItems, shipment },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
      detail: String(error),
    });
  }
};

exports.getOrderLists = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { status = "all", page = 1, size = 10, sort } = req.query;
    const limit = parseInt(size);
    const offset = (parseInt(page) - 1) * limit;

    const orderFilter = {
      attributes: ["id", "status", "totalPrice", "userId", "createdAt", "updatedAt"],
      where: status !== "all" ? { status } : undefined,
      include: [
        {
          model: OrderItem,
          attributes: ["id", "quantity", "createdAt", "updatedAt"],
          include: [
            {
              model: Product,
              attributes: ["id", "name", "description", "price", "gender", "weight"],
              include: [
                {
                  model: ProductImage,
                  as: "productImages",
                  attributes: ["id", "imageUrl"],
                },
              ],
            },
          ],
        },
      ],
    };

    if (userId) {
      orderFilter.where = { ...orderFilter.where, userId };
    }

    const orders = await Order.findAll(orderFilter);

    if (orders.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "No Data matches",
      });
    }

    // Create an array for grouped order lists
    let groupedOrderListsWithImages = [];

    orders.forEach((order) => {
      const orderId = order.id;
      const existingOrder = groupedOrderListsWithImages.find((groupedOrder) => groupedOrder.orderId === orderId);

      if (!existingOrder) {
        const newOrder = {
          orderId,
          totalPrice: order.totalPrice,
          status: order.status,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          totalQuantity: 0,
          Products: [],
        };

        order.OrderItems.forEach((orderItem) => {
          const product = orderItem.Product;
          const productImages = product.productImages.map((image) => ({
            id: image.id,
            imageUrl: image.imageUrl,
          }));

          newOrder.Products.push({
            orderItemId: orderItem.id,
            productId: product.id,
            quantity: orderItem.quantity,
            createdAt: orderItem.createdAt,
            updatedAt: orderItem.updatedAt,
            Product: {
              id: product.id,
              productName: product.name,
              productPrice: product.price,
              productGender: product.gender,
              productImages: productImages,
            },
          });

          newOrder.totalQuantity += orderItem.quantity;
        });

        groupedOrderListsWithImages.push(newOrder);
      } else {
        // Order already exists, update information
        order.OrderItems.forEach((orderItem) => {
          const product = orderItem.Product;
          const productImages = product.productImages.map((image) => ({
            id: image.id,
            imageUrl: image.imageUrl,
          }));

          const existingProduct = existingOrder.Products.find((p) => p.productId === product.id);

          if (!existingProduct) {
            // Product doesn't exist in the order, add it
            existingOrder.Products.push({
              orderItemId: orderItem.id,
              productId: product.id,
              quantity: orderItem.quantity,
              createdAt: orderItem.createdAt,
              updatedAt: orderItem.updatedAt,
              Product: {
                id: product.id,
                productName: product.name,
                productPrice: product.price,
                productGender: product.gender,
                productImages: productImages,
              },
            });

            existingOrder.totalQuantity += orderItem.quantity;
          } else {
            // Product already exists in the order, update quantity
            existingProduct.quantity += orderItem.quantity;
            existingOrder.totalQuantity += orderItem.quantity;
          }
        });
      }
    });

    // Sorting the array
    if (sort) {
      groupedOrderListsWithImages.sort((a, b) => {
        if (sort === "date-asc") {
          return new Date(a.updatedAt) - new Date(b.updatedAt);
        } else if (sort === "date-desc") {
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        } else if (sort === "price-asc") {
          return a.totalPrice - b.totalPrice;
        } else if (sort === "price-desc") {
          return b.totalPrice - a.totalPrice;
        } else {
          return 0;
        }
      });
    }

    const totalUniqueOrders = orders.length;

    const totalPages = Math.ceil(totalUniqueOrders / limit);

    const paginationInfo = {
      totalRecords: totalUniqueOrders,
      totalPages: totalPages,
      currentPage: parseInt(page),
    };

    return res.status(200).json({
      ok: true,
      message: "Get all order successfully",
      detail: Object.values(groupedOrderListsWithImages),
      pagination: paginationInfo,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
      detail: String(error),
    });
  }
};
