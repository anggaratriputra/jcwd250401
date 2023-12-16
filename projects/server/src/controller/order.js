const { Sequelize, Op } = require("sequelize");
const axios = require("axios");
const fs = require("fs").promises;

const { isAfter, differenceInMinutes } = require("date-fns");

const { Address, Order, OrderItem, Product, ProductImage, Warehouse, Shipment, Cart, CartItem, User, Mutation, WarehouseAddress, Journal, sequelize } = require("../models");

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

    order.status = "waiting-for-confirmation";
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

    order.status = "waiting-for-payment";

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

const getProductStock = async (products) => {
  return await Promise.all(
    products.map(async (item) => {
      try {
        const product = await Product.findOne({
          where: { id: item.productId },
          attributes: ["id", "price"],
        });

        if (!product) {
          console.error(`Product not found for productId ${item.productId}`);
          throw new Error(`Product not found for productId ${item.productId}`);
        }

        const warehouses = await Warehouse.findAll();

        const mutations = await Promise.all(
          warehouses.map(async (warehouse) => {
            try {
              const latestMutation = await Mutation.findOne({
                attributes: ["stock"],
                where: {
                  productId: product.id,
                  warehouseId: warehouse.id,
                },
                order: [["createdAt", "DESC"]],
                limit: 1,
              });

              return {
                warehouseId: warehouse.id,
                warehouseName: warehouse.name,
                totalStock: latestMutation ? latestMutation.stock : 0,
              };
            } catch (mutationError) {
              console.error(`Error in getProductStock for productId ${product.id} and warehouseId ${warehouse.id}:`, mutationError);
              throw mutationError;
            }
          })
        );

        // Calculate the total stock from all warehouses
        const totalStockAllWarehouses = mutations.reduce((total, mutation) => total + mutation.totalStock, 0);

        return {
          ...product.toJSON(),
          Mutations: mutations || [],
          totalStockAllWarehouses: totalStockAllWarehouses || 0,
        };
      } catch (error) {
        console.error(`Error in getProductStock for productId ${item.productId}:`, error);
        throw error; // Rethrow the error to be caught by the caller
      }
    })
  );
};

exports.createOrder = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { addressId, warehouseId, productOnCart, shippingCost, paymentBy } = req.body;

    // Calculate product stock
    const productStock = await getProductStock(productOnCart);

    // Check if the quantity in the order is sufficient based on available stock
    const insufficientStockProducts = [];
    for (const item of productOnCart) {
      const product = productStock.find((p) => p.id === item.productId);
      const totalStockForProduct = product ? product.totalStockAllWarehouses : 0;

      if (item.quantity > totalStockForProduct) {
        insufficientStockProducts.push({
          productId: item.productId,
          productName: product.name,
          requestedQuantity: item.quantity,
          availableStock: totalStockForProduct,
        });

        // updating cartItem quantity

        const cartItem = await CartItem.findOne({
          where: { productId: item.productId, cartId: item.cartId },
        });

        await cartItem.update({ quantity: totalStockForProduct });
      }
    }

    if (insufficientStockProducts.length > 0) {
      return res.status(400).json({
        ok: false,
        message: "Insufficient stock for some products in the order, redirecting you to the cart page",
      });
    }

    // If there is sufficient stock, continue with order creation

    const order = await Order.create({
      userId,
      warehouseId,
      paymentBy,
      status: "unpaid",
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
      addressId,
    });

    // Update shipmentId in Order table
    await order.update({ shipmentId: shipment.id });

    // Delete cart
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

    if (!orders || orders.length === 0) {
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

exports.automaticCancelUnpaidOrder = async (req, res) => {
  try {
    // Fetch unpaid orders
    const orders = await Order.findAll({
      where: {
        status: "unpaid",
      },
    });

    // Check if there are no unpaid orders
    if (!orders.length) {
      return console.log("No unpaid orders found");
    }

    const now = Date.now();

    // Filter orders that need to be canceled (created more than 24 hours ago)
    const ordersToCancel = orders.filter((order) => {
      const orderCreatedAt = new Date(order.createdAt).getTime();
      const diffInMinutes = differenceInMinutes(now, orderCreatedAt);

      return diffInMinutes >= 24 * 60; // 24 hours in minutes
    });

    // Check if there are no orders to cancel
    if (ordersToCancel.length === 0) {
      return console.log("No expire orders to cancel");
    }

    // Update the status of orders to 'cancelled'
    await Promise.all(
      ordersToCancel.map(async (order) => {
        // Ensure order is not undefined before updating
        if (order && order.update) {
          await order.update({ status: "cancelled" });
        }
      })
    );
    return console.log("Unpaid expired orders cancelled successfully");
  } catch (error) {
    console.error(error);
  }
};

// Function to find the nearest warehouse using Haversine formula
function findNearestWarehouse(sourceLatitude, sourceLongitude, warehouses, requiredStock) {
  const earthRadius = 6371; // Radius of the earth in km

  // Helper function to convert degrees to radians
  function toRad(degrees) {
    return (degrees * Math.PI) / 180;
  }

  let nearestWarehouse = null;
  let minDistance = Infinity;
  for (const warehouse of warehouses) {
    const { latitude, longitude } = warehouse.WarehouseAddress;
    const { stock } = warehouse.Mutations[0] || { stock: 0 };

    // Haversine formula (menentukan jarak antara dua titik pada permukaan bola)
    const dLat = toRad(latitude - sourceLatitude); // Calculate the difference in latitude in radians
    const dLon = toRad(longitude - sourceLongitude); // Calculate the difference in longitude in radians

    // Variable to calculate the distance
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) + // kuadrat setengah jarak lingkaran besar sepanjang garis lintang
      Math.cos(toRad(sourceLatitude)) * Math.cos(toRad(latitude)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); // kuadrat setengah jarak lingkaran sepanjang garis bujur

    const centralAngle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // Menghitung sudut sentral antara dua titik pada lingkaran besar
    const distance = earthRadius * centralAngle; // Menghitung jarak antara dua titik pada permukaan bola

    if (stock >= requiredStock && distance < minDistance) {
      // check if the stock is greater than or equal to the required stock
      minDistance = distance;
      nearestWarehouse = warehouse;
    }
  }

  return nearestWarehouse;
}

// Function to update the source warehouse stock
async function updateSourceWarehouseStock(productId, warehouseId, destinationWarehouseId, quantity, sourceWarehouseAdminId) {
  const t = await sequelize.transaction();
  try {
    // get the latest mutation from the source warehouse in order to get the stock
    const findLatestMutationSourceWarehouse = await Mutation.findOne({
      where: {
        productId,
        warehouseId,
        status: "success",
      },
      order: [["createdAt", "DESC"]],
      limit: 1,
      transaction: t,
    });

    const destinationWarehouseData = await Warehouse.findOne({
      where: {
        id: destinationWarehouseId,
      },
      attributes: ["name"],
      transaction: t,
    });

    let sourceWarehouseStock = findLatestMutationSourceWarehouse.stock || 0;
    let newStock = sourceWarehouseStock + quantity;

    // update the source warehouse stock by creating a new mutation
    const mutation = await Mutation.create(
      {
        productId,
        warehouseId,
        destinationWarehouseId,
        previousStock: sourceWarehouseStock,
        mutationQuantity: quantity,
        mutationType: "add",
        adminId: sourceWarehouseAdminId,
        stock: newStock,
        status: "success",
        isManual: false,
        description: `Auto request, get new stock automatically from ${destinationWarehouseData.name}.`,
      },
      {
        transaction: t,
      }
    );

    await Journal.create(
      {
        mutationId: mutation.id,
        productId,
        warehouseId,
        destinationWarehouseId,
        previousStock: sourceWarehouseStock,
        mutationQuantity: quantity,
        mutationType: "add",
        adminId: sourceWarehouseAdminId,
        stock: newStock,
        status: "success",
        isManual: false,
        description: `Auto request, get new stock automatically from ${destinationWarehouseData.name}.`,
      },
      {
        transaction: t,
      }
    );

    await t.commit();
    return mutation;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

exports.confirmPaymentProofUser = async (req, res) => {
  const t = await sequelize.transaction();
  const { orderId, productId } = req.body;

  try {
    const orderItem = await OrderItem.findOne({
      where: {
        orderId,
      },
      include: [
        {
          model: Order,
          where: {
            status: "waiting-for-confirmation",
          },
          include: [
            {
              model: Warehouse,
              include: [
                {
                  model: Mutation,
                  where: {
                    status: "success",
                    productId,
                  },
                  order: [["createdAt", "DESC"]],
                  limit: 1,
                },
                {
                  model: WarehouseAddress,
                  attributes: ["latitude", "longitude"],
                },
              ],
            },
          ],
        },
      ],
      transaction: t,
    });

    if (!orderItem) {
      await t.rollback();
      return res.status(404).json({
        ok: false,
        message: "Order not found",
        detail: "Order with status waiting-for-confirmation not found",
      });
    }

    orderItem.Order.status = "processed";
    await orderItem.Order.save({ transaction: t });

    const stockProductAtCurrentWarehouse = orderItem.Order.Warehouse.Mutations[0].stock;
    const warehouselatitude = orderItem.Order.Warehouse.WarehouseAddress.latitude;
    const warehouseLongitude = orderItem.Order.Warehouse.WarehouseAddress.longitude;
    const orderQuantity = orderItem.quantity;
    const requiredStock = orderQuantity - stockProductAtCurrentWarehouse;
    const sourceWarehouseName = orderItem.Order.Warehouse.name;
    const sourceWarehouseId = orderItem.Order.Warehouse.id;
    const sourceWarehouseAdminId = orderItem.Order.Warehouse.adminId;

    const allWarehouses = await Warehouse.findAll({
      attributes: ["id", "name", "warehouseAddressId"],
      include: [
        {
          model: WarehouseAddress,
          attributes: ["street", "city", "province", "latitude", "longitude"],
        },
        {
          model: Mutation,
          attributes: ["id", "stock"],
          where: {
            status: "success",
            productId,
          },
          order: [["createdAt", "DESC"]],
          limit: 1,
        },
      ],
      transaction: t,
    });

    if (orderItem.Order.status === "processed") {
      if (orderQuantity > stockProductAtCurrentWarehouse) {
        // insufficient stock
        const nearestWarehouse = findNearestWarehouse(warehouselatitude, warehouseLongitude, allWarehouses, orderQuantity);

        if (!nearestWarehouse) {
          await t.rollback();
          return res.status(404).json({
            ok: false,
            message: "Nearest warehouse with sufficient stock not found",
          });
        }

        // Create mutation for update stock at source warehouse
        const newMutationForSourceWarehouse = await updateSourceWarehouseStock(productId, sourceWarehouseId, nearestWarehouse.id, requiredStock, sourceWarehouseAdminId);

        // Create mutation for update stock at destination warehouse
        let currentDestinationWarehouseStock = nearestWarehouse.Mutations[0].stock;

        const newMutationForDestinationWarehouse = await Mutation.create(
          {
            productId,
            warehouseId: nearestWarehouse.id,
            destinationWarehouseId: nearestWarehouse.id,
            mutationQuantity: requiredStock,
            previousStock: currentDestinationWarehouseStock,
            mutationType: "subtract",
            adminId: sourceWarehouseAdminId,
            stock: (currentDestinationWarehouseStock -= requiredStock),
            status: "success",
            isManual: false,
            description: `Auto request, stock subtracted automatically to ${sourceWarehouseName} for user order.`,
          },
          { transaction: t }
        );

        await Journal.create(
          {
            productId,
            warehouseId: nearestWarehouse.id,
            destinationWarehouseId: nearestWarehouse.id,
            mutationId: newMutationForDestinationWarehouse.id,
            mutationQuantity: requiredStock,
            previousStock: newMutationForDestinationWarehouse.previousStock,
            mutationType: "subtract",
            adminId: sourceWarehouseAdminId,
            stock: newMutationForDestinationWarehouse.stock,
            status: "success",
            isManual: false,
            description: `Auto request, stock subtracted automatically to ${sourceWarehouseName} for user order.`,
          },
          { transaction: t }
        );

        await t.commit();
        return res.status(200).json({
          ok: true,
          message: "Payment proof confirmed successfully",
          detail: {
            orderItem,
            newMutationForSourceWarehouse,
          },
        });
      }
      // sufficient stock
      // Create mutation for update stock at source warehouse
      const newMutationForSourceWarehouse = await Mutation.create(
        {
          productId,
          warehouseId: sourceWarehouseId,
          destinationWarehouseId: sourceWarehouseId,
          mutationQuantity: orderQuantity,
          previousStock: stockProductAtCurrentWarehouse,
          mutationType: "subtract",
          adminId: sourceWarehouseAdminId,
          stock: stockProductAtCurrentWarehouse - orderQuantity,
          status: "success",
          isManual: false,
          description: "Auto request, stock subtracted automatically for user order.",
        },
        { transaction: t }
      );

      await Journal.create(
        {
          mutationId: newMutationForSourceWarehouse.id,
          productId,
          warehouseId: sourceWarehouseId,
          destinationWarehouseId: sourceWarehouseId,
          mutationId: newMutationForSourceWarehouse.id,
          mutationQuantity: orderQuantity,
          previousStock: stockProductAtCurrentWarehouse,
          mutationType: "subtract",
          adminId: sourceWarehouseAdminId,
          stock: stockProductAtCurrentWarehouse - orderQuantity,
          status: "success",
          isManual: false,
          description: "Auto request, stock subtracted automatically for user order.",
        },
        { transaction: t }
      );

      await t.commit();
      return res.status(200).json({
        ok: true,
        message: "Payment proof confirmed successfully",
        detail: {
          orderItem,
          newMutationForSourceWarehouse,
        },
      });
    }
  } catch (error) {
    console.error(error);
    await t.rollback();
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};
