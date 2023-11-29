const { Product, ProductImage, ProductCategory, Category, Mutation, Warehouse, sequelize } = require("../models");
const { Op } = require("sequelize");

exports.handleAddProduct = async (req, res) => {
  const { productName, productPrice, productDescription, productGender, productMainCategory, productSubCategory } = req.body;

  try {
    const existingProduct = await Product.findOne({
      where: {
        name: productName,
      },
    });

    if (existingProduct) {
      // Check if the existing product has the same gender
      if (existingProduct.gender === (productGender || "Unisex")) {
        return res.status(404).json({
          ok: false,
          msg: "Product with the same name and gender already exists",
        });
      }
    }

    const images = req.files; // Assuming you use 'files' for multiple file uploads

    if (!images || images.length === 0) {
      return res.status(400).json({
        ok: false,
        msg: "No images uploaded",
      });
    }

    const gender = productGender || "Unisex";

    // Create the product
    const product = await Product.create({
      name: productName,
      price: productPrice,
      description: productDescription,
      gender: gender,
    });

    console.log(req.files);
    // Handle multiple images

    // Prepare the array of objects to be inserted
    const imageObjects = images.map((image) => {
      return {
        productId: product.id,
        imageUrl: image.filename, // Using the filename generated by Multer
      };
    });

    // Use bulkCreate to insert multiple records at once
    const productImages = await ProductImage.bulkCreate(imageObjects);

    // Create ProductCategory records
    const mainCategoryInstance = await Category.findOne({
      where: { name: productMainCategory },
    });

    console.log(mainCategoryInstance);

    const subCategoryInstance = await Category.findOne({
      where: { name: productSubCategory, parentCategoryId: mainCategoryInstance.id },
    });

    if (!mainCategoryInstance || !subCategoryInstance) {
      return res.status(404).json({
        ok: false,
        msg: "Main category or subcategory not found",
      });
    }

    await ProductCategory.bulkCreate(
      [
        { productId: product.id, categoryId: mainCategoryInstance.id },
        { productId: product.id, categoryId: subCategoryInstance.id },
      ],
      {
        fields: ["productId", "categoryId"], // Specify the fields to include in the bulkCreate operation
      }
    );

    const genderCode = gender === "Men" ? "001" : gender === "Women" ? "002" : "003";
    const subCategoryId = subCategoryInstance.id < 10 ? `0${subCategoryInstance.id}` : subCategoryInstance.id;
    const sku = `${mainCategoryInstance.id}${subCategoryId}${genderCode}${product.id}`;

    // Update product with SKU using save()
    product.sku = sku;
    await product.save();

    return res.status(201).json({
      ok: true,
      msg: "Product, images, and ProductCategory records added successfully",
      product: product,
      images: productImages,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: "Internal server error",
    });
  }
};

exports.handleUpdateProduct = async (req, res) => {
  const { productName, productPrice, productDescription, productGender, productMainCategory, productSubCategory } = req.body;
  const { productId } = req.params;

  try {
    // Check if the product exists
    const existingProduct = await Product.findByPk(productId);

    if (!existingProduct) {
      return res.status(404).json({
        ok: false,
        msg: "Product not found",
      });
    }

    const images = req.files; // Assuming you use 'files' for multiple file uploads

    if (!images || images.length === 0) {
      return res.status(400).json({
        ok: false,
        msg: "No images uploaded",
      });
    }

    // Destroy all existing product images
    await ProductImage.destroy({
      where: {
        productId: existingProduct.id,
      },
    });

    // Update product details
    existingProduct.name = productName;
    existingProduct.price = productPrice;
    existingProduct.description = productDescription;
    existingProduct.gender = productGender || "Unisex";

    // Save the updated product
    await existingProduct.save();

    // Handle multiple images

    if (images && images.length > 0) {
      // Prepare the array of objects to be inserted
      const imageObjects = images.map((image) => {
        return {
          productId: existingProduct.id,
          imageUrl: image.filename, // Using the filename generated by Multer
        };
      });

      // Use bulkCreate to insert multiple records at once
      const productImages = await ProductImage.bulkCreate(imageObjects);
    }

    // Update product categories
    const mainCategoryInstance = await Category.findOne({
      where: { name: productMainCategory },
    });

    const subCategoryInstance = await Category.findOne({
      where: { name: productSubCategory, parentCategoryId: mainCategoryInstance.id },
    });

    if (!mainCategoryInstance || !subCategoryInstance) {
      return res.status(404).json({
        ok: false,
        msg: "Main category or subcategory not found",
      });
    }

    // Delete existing product category records
    await ProductCategory.destroy({
      where: {
        productId: existingProduct.id,
      },
    });

    // Create new product category records
    await ProductCategory.bulkCreate(
      [
        { productId: existingProduct.id, categoryId: mainCategoryInstance.id },
        { productId: existingProduct.id, categoryId: subCategoryInstance.id },
      ],
      {
        fields: ["productId", "categoryId"], // Specify the fields to include in the bulkCreate operation
      }
    );

    return res.status(200).json({
      ok: true,
      msg: "Product updated successfully",
      product: existingProduct,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: "Internal server error",
    });
  }
};

// exports.handleGetAllProducts = async (req, res) => {
//   const limit = parseInt(req.query.limit) || 100;
//   const page = parseInt(req.query.page) || 1;
//   const sort = req.query.sort;
//   const category = req.query.category;
//   const search = req.query.search;
//   const filterBy = req.query.filterBy;
//   const isArchived = req.query.isArchived || false;
//   const isEmptyStock = req.query.isEmptyStock || false;

//   try {
//     const filter = {
//       include: [{ model: Mutation, attributes: ["stock"], order: [["createdAt", "DESC"]], limit: 1 }],
//       where: {},
//     };

//     // Apply search query filter using Sequelize's Op.like
//     if (search) {
//       filter.where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }, { sku: { [Op.like]: `%${search}%` } }];
//     }

//     // Include sorting options
//     if (sort) {
//       if (sort === "alphabetical-asc") {
//         filter.order = [["name", "ASC"]];
//       } else if (sort === "alphabetical-desc") {
//         filter.order = [["name", "DESC"]];
//       } else if (sort === "date-asc") {
//         filter.order = [["updatedAt", "ASC"]];
//       } else if (sort === "date-desc") {
//         filter.order = [["updatedAt", "DESC"]];
//       } else if (sort === "price-asc") {
//         filter.order = [["price", "ASC"]];
//       } else if (sort === "price-desc") {
//         filter.order = [["price", "DESC"]];
//       }
//     }

//     if (filterBy && filterBy.toLowerCase() !== "all genders") {
//       if (filterBy.toLowerCase() === "men") {
//         filter.where.gender = "Men";
//       } else if (filterBy.toLowerCase() === "women") {
//         filter.where.gender = "Women";
//       } else if (filterBy.toLowerCase() === "unisex") {
//         filter.where.gender = "Unisex";
//       }
//     }

//     // Add condition for isArchived
//     if (isArchived === "true") {
//       filter.where.isArchived = true;
//     } else {
//       filter.where.isArchived = false;
//     }

//     // Include category filter
//     if (category && category !== "All") {
//       filter.include = [
//         { model: ProductImage, as: "productImages" },
//         {
//           model: Category,
//           as: "Categories",
//           through: { model: ProductCategory, attributes: [] },
//           attributes: ["id", "name"],
//           where: { name: category }, // Filter categories based on the queried category
//         },
//       ];
//     } else {
//       // Include without category filter
//       filter.include = [
//         { model: ProductImage, as: "productImages" },
//         {
//           model: Category,
//           as: "Categories",
//           through: { model: ProductCategory, attributes: [] },
//           attributes: ["id", "name"],
//         },
//       ];
//     }

//     // Retrieve products without pagination to get the total count
//     // const totalData = await Product.count({
//     //   ...filter,
//     //   distinct: true, // Add this line to ensure distinct counts
//     //   col: "id",
//     // });

//     // Query to fetch products with primary details
//     const products = await Product.findAll({
//       where: filter.where,
//       include: filter.include,
//       order: filter.order,
//       limit,
//       offset: (page - 1) * limit,
//     });

//     if (!products || products.length === 0) {
//       return res.status(404).json({
//         ok: false,
//         message: "No products found!",
//       });
//     }

//     // Extract product IDs for the next query
//     const productIds = products.map((product) => product.id);

//     // Query to fetch all categories associated with the products
//     const allCategories = await ProductCategory.findAll({
//       where: { productId: productIds },
//       include: [{ model: Category, as: "Category", attributes: ["id", "name"] }],
//     });

//     // Organize categories by product ID for efficient mapping
//     const categoriesByProductId = {};
//     allCategories.forEach((productCategory) => {
//       const { productId, Category } = productCategory;
//       if (!categoriesByProductId[productId]) {
//         categoriesByProductId[productId] = [];
//       }
//       categoriesByProductId[productId].push(Category);
//     });

//     // Map categories to the corresponding products
//     products.forEach((product) => {
//       const productId = product.id;
//       product.dataValues.categories = categoriesByProductId[productId] || [];
//       delete product.dataValues.Categories; // Remove unnecessary attribute
//     });

//     const productStock = await Promise.all(
//       products.map(async (product) => {
//         const warehouses = await Warehouse.findAll();

//         const mutations = await Promise.all(
//           warehouses.map(async (warehouse) => {
//             const latestMutation = await Mutation.findOne({
//               attributes: ["stock"],
//               where: {
//                 productId: product.id,
//                 warehouseId: warehouse.id,
//               },
//               order: [["createdAt", "DESC"]],
//               limit: 1,
//             });

//             return {
//               warehouseId: warehouse.id,
//               warehouseName: warehouse.name,
//               totalStock: latestMutation ? latestMutation.stock : 0,
//             };
//           })
//         );

//         // Calculate the total stock from all warehouses
//         const totalStockAllWarehouses = mutations.reduce((total, mutation) => total + mutation.totalStock, 0);

//         if (isEmptyStock) {
//           // Show only products with totalStockAllWarehouses === 0 when isEmptyStock is true
//           if (totalStockAllWarehouses === 0) {
//             return {
//               ...product.toJSON(),
//               Mutations: mutations || [],
//               totalStockAllWarehouses: totalStockAllWarehouses || 0,
//             };
//           } else {
//             return null; // Exclude products with totalStockAllWarehouses > 0 when isEmptyStock is true
//           }
//         } else {
//           // Show only products with totalStockAllWarehouses > 0 when isEmptyStock is false
//           if (totalStockAllWarehouses > 0) {
//             return {
//               ...product.toJSON(),
//               Mutations: mutations || [],
//               totalStockAllWarehouses: totalStockAllWarehouses || 0,
//             };
//           } else {
//             return null; // Exclude products with totalStockAllWarehouses === 0 when isEmptyStock is false
//           }
//         }
//       })

//     );

//     // Remove null values from the productStock array
//     const filteredProductStock = productStock.filter((product) => product !== null);
//     const totalData = filteredProductStock.length;

//     // Send the response
//     res.status(200).json({
//       ok: true,
//       pagination: {
//         totalData,
//         page,
//       },
//       details: filteredProductStock,
//     });
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     res.status(500).json({
//       ok: false,
//       message: "Internal server error",
//     });
//   }
// };

exports.handleUnarchiveProduct = async (req, res) => {
  const productId = req.params.productId; // Assuming you're passing the product ID in the request parameters

  try {
    // Find the product by ID
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: "Product not found",
      });
    }

    // Update the product to mark it as unarchived
    await product.update({ isArchived: false });

    res.status(200).json({
      ok: true,
      message: "Product unarchived successfully",
      product: product, // You can customize the response as needed
    });
  } catch (error) {
    console.error("Error unarchiving product:", error);
    res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

exports.handleArchiveProduct = async (req, res) => {
  const productId = req.params.productId; // Assuming you're passing the product ID in the request parameters

  try {
    // Find the product by ID
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: "Product not found",
      });
    }

    // Update the product to mark it as archived
    await product.update({ isArchived: true });

    res.status(200).json({
      ok: true,
      message: "Product archived successfully",
      product: product, // You can customize the response as needed
    });
  } catch (error) {
    console.error("Error archiving product:", error);
    res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

exports.handleDeleteProduct = async (req, res) => {
  const productId = req.params.productId;

  try {
    // Find the product by ID
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: "Product not found",
      });
    }

    // Delete associated product images
    await ProductImage.destroy({
      where: {
        productId: product.id,
      },
    });

    // Delete associated product categories
    await ProductCategory.destroy({
      where: {
        productId: product.id,
      },
    });

    // Delete the product itself
    await product.destroy();

    res.status(200).json({
      ok: true,
      message: "Product deleted successfully",
      product: product, // You can customize the response as needed
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

const updateStock = async (warehouseId, productId, quantity, type, adminId, transaction) => {
  try {
    quantity = parseInt(quantity);
    if (type !== "add" && type !== "subtract") {
      throw new Error("Invalid 'type' parameter. Must be 'add' or 'subtract'.");
    }

    const latestMutation = await Mutation.findOne({
      where: {
        productId,
        warehouseId,
      },
      order: [["createdAt", "DESC"]],
      limit: 1,
      attributes: ["stock"],
      transaction,
    });

    console.log("Latest Mutation:", latestMutation);
    const currentStock = latestMutation ? latestMutation.stock : 0;

    if (type === "subtract" && quantity > currentStock) {
      throw new Error("Cannot subtract more than current stock");
    }

    const newStock = type === "add" ? currentStock + quantity : currentStock - quantity;

    await Mutation.create(
      {
        productId,
        warehouseId,
        mutationQuantity: quantity,
        mutationType: type,
        adminId,
        stock: newStock,
      },
      { transaction }
    );
  } catch (error) {
    throw new Error(`Error updating stock: ${error.message}`);
  }
};

exports.updateProductStock = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { warehouseId, productId, quantity, type } = req.body;
    const { isWarehouseAdmin } = req.user;

    if (!warehouseId || !productId || !quantity || !type) {
      await t.rollback();
      return res.status(400).json({
        ok: false,
        message: "Missing required parameters",
      });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      await t.rollback();
      return res.status(404).json({
        ok: false,
        message: "Product not found",
      });
    }

    let selectedWarehouseId = warehouseId;
    if (!isWarehouseAdmin) {
      selectedWarehouseId = req.body.warehouseId;
      if (!selectedWarehouseId) {
        await t.rollback();
        return res.status(400).json({
          ok: false,
          message: "Please select a warehouse",
        });
      }
    }
    await updateStock(selectedWarehouseId, productId, quantity, type, req.user.id, t);
    await t.commit();

    res.status(200).json({
      ok: true,
      message: "Stock updated successfully",
      detail: {
        product,
        selectedWarehouseId,
        quantity,
        type,
        adminId: req.user.id,
      },
    });
  } catch (error) {
    await t.rollback();
    console.error("Error updating stock:", error);
    res.status(500).json({
      ok: false,
      message: "Internal server error",
      detail: String(error),
    });
  }
};

const removeStock = async (warehouseId, productId, transaction) => {
  try {
    const product = await Product.findByPk(productId, {
      transaction,
      include: [
        {
          model: Mutation,
          attributes: ["id", "stock"],
          order: [["createdAt", "DESC"]],
          where: { warehouseId },
        },
      ],
    });

    if (!product) {
      throw new Error("Product stock not found in the warehouse");
    }

    await Mutation.destroy({
      where: {
        id: {
          [Op.in]: product.Mutations.map((mutation) => mutation.id),
        },
      },
    });
  } catch (error) {
    throw new Error(`Error removing stock: ${error.message}`);
  }
};

exports.handleRemoveProductStock = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { warehouseId, productId } = req.body;
    const { isWarehouseAdmin } = req.user;

    if (!warehouseId || !productId) {
      await t.rollback();
      return res.status(400).json({
        ok: false,
        message: "Missing required parameters",
      });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      await t.rollback();
      return res.status(404).json({
        ok: false,
        message: "Product not found",
      });
    }

    const productInWarehouse = await Mutation.findOne({
      where: {
        productId,
        warehouseId,
      },
    });

    if (!productInWarehouse) {
      await t.rollback();
      return res.status(404).json({
        ok: false,
        message: "Product not found in warehouse",
      });
    }

    let selectedWarehouseId = warehouseId;
    if (!isWarehouseAdmin) {
      selectedWarehouseId = req.body.warehouseId;
      if (!selectedWarehouseId) {
        await t.rollback();
        return res.status(400).json({
          ok: false,
          message: "Please select a warehouse",
        });
      }
    }

    await removeStock(selectedWarehouseId, productId, t);
    await t.commit();

    res.status(200).json({
      ok: true,
      message: "Stock removed successfully",
      detail: {
        product,
        selectedWarehouseId,
        adminId: req.user.id,
      },
    });
  } catch (error) {
    await t.rollback();
    console.error("Error removing stock:", error);
    res.status(500).json({
      ok: false,
      message: "Internal server error",
      detail: String(error),
    });
  }
};

exports.handleGetAllProducts = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const sort = req.query.sort;
  const category = req.query.category;
  const search = req.query.search;
  const filterBy = req.query.filterBy;
  const isArchived = req.query.isArchived || false;
  const stockFilter = req.query.stockFilter;

  try {
    const filter = {
      include: [{ model: Mutation, attributes: ["stock"], order: [["createdAt", "DESC"]], limit: 1 }],
      where: {},
    };

    // Apply search query filter using Sequelize's Op.like
    if (search) {
      filter.where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }, { sku: { [Op.like]: `%${search}%` } }];
    }

    // Include sorting options
    if (sort) {
      if (sort === "alphabetical-asc") {
        filter.order = [["name", "ASC"]];
      } else if (sort === "alphabetical-desc") {
        filter.order = [["name", "DESC"]];
      } else if (sort === "date-asc") {
        filter.order = [["updatedAt", "ASC"]];
      } else if (sort === "date-desc") {
        filter.order = [["updatedAt", "DESC"]];
      } else if (sort === "price-asc") {
        filter.order = [["price", "ASC"]];
      } else if (sort === "price-desc") {
        filter.order = [["price", "DESC"]];
      }
    }

    if (filterBy && filterBy.toLowerCase() !== "all genders") {
      if (filterBy.toLowerCase() === "men") {
        filter.where.gender = "Men";
      } else if (filterBy.toLowerCase() === "women") {
        filter.where.gender = "Women";
      } else if (filterBy.toLowerCase() === "unisex") {
        filter.where.gender = "Unisex";
      }
    }

    // Add condition for isArchived
    if (isArchived === "true") {
      filter.where.isArchived = true;
    } else {
      filter.where.isArchived = false;
    }

    // Include category filter
    if (category && category !== "All") {
      filter.include.push(
        { model: ProductImage, as: "productImages" },
        {
          model: Category,
          as: "Categories",
          through: { model: ProductCategory, attributes: [] },
          attributes: ["id", "name"],
          where: { name: category },
        }
      );
    } else {
      filter.include.push(
        { model: ProductImage, as: "productImages" },
        {
          model: Category,
          as: "Categories",
          through: { model: ProductCategory, attributes: [] },
          attributes: ["id", "name"],
        }
      );
    }

    // Retrieve products without pagination to get the total count
  
    // Query to fetch products with primary details
    const productsWithMutations = await Product.findAll({
      where: filter.where,
      include: filter.include,
      order: filter.order,
    });

    if (!productsWithMutations || productsWithMutations.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "No products found!",
      });
    }

    // Extract product IDs for the next query
    const productIds = productsWithMutations.map((product) => product.id);

    // Query to fetch all categories associated with the products
    const allCategories = await ProductCategory.findAll({
      where: { productId: productIds },
      include: [{ model: Category, as: "Category", attributes: ["id", "name"] }],
    });

    // Organize categories by product ID for efficient mapping
    const categoriesByProductId = {};
    allCategories.forEach((productCategory) => {
      const { productId, Category } = productCategory;
      if (!categoriesByProductId[productId]) {
        categoriesByProductId[productId] = [];
      }
      categoriesByProductId[productId].push(Category);
    });

    productsWithMutations.forEach((product) => {
      const productId = product.id;
      product.dataValues.categories = categoriesByProductId[productId] || [];
      delete product.dataValues.Categories; // Remove unnecessary attribute
    });

    // Map categories to the corresponding products
    const productStock = await Promise.all(
      productsWithMutations.map(async (product) => {
        const mutations = await getMutationsForProduct(product.id);

        // Calculate the total stock from all warehouses
        const totalStockAllWarehouses = mutations.reduce((total, mutation) => total + mutation.totalStock, 0);

        return {
          ...product.toJSON(),
          Mutations: mutations || [],
          totalStockAllWarehouses: totalStockAllWarehouses || 0,
        };
      })
    );

    // Filter products based on stock status
    const filteredProducts = filterProductsByStock(productStock, stockFilter);

    // Calculate pagination information after filtering
    const totalData = filteredProducts.length;
    const totalPages = Math.ceil(totalData / limit);
    const offset = (page - 1) * limit;
    const paginatedProducts = filteredProducts.slice(offset, offset + limit);

    res.status(200).json({
      ok: true,
      pagination: {
        totalData,
        totalPages,
        page,
      },
      details: paginatedProducts,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

// Helper function to filter products based on stock status
const filterProductsByStock = (products, stockFilter) => {
  if (stockFilter === "inStock") {
    return products.filter((product) => product.totalStockAllWarehouses > 0);
  } else if (stockFilter === "outOfStock") {
    return products.filter((product) => product.totalStockAllWarehouses === 0);
  } else {
    return products; // Return all products if no stock filter is specified
  }
};

// Helper function to get mutations for a product
const getMutationsForProduct = async (productId) => {
  const warehouses = await Warehouse.findAll();

  return Promise.all(
    warehouses.map(async (warehouse) => {
      const latestMutation = await Mutation.findOne({
        attributes: ["stock"],
        where: {
          productId,
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
    })
  );
};

exports.handleGetAllArchivedProducts = async (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const page = parseInt(req.query.page) || 1;
  const sort = req.query.sort;
  const category = req.query.category;
  const search = req.query.search;
  const filterBy = req.query.filterBy; // New query parameter

  try {
    const filter = {
      include: [{ model: Mutation, attributes: ["stock"], order: [["createdAt", "DESC"]], limit: 1 }],
      where: {
        isArchived: true,
      },
    };

    // Apply search query filter using Sequelize's Op.like
    if (search) {
      filter.where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }, { sku: { [Op.like]: `%${search}%` } }];
    }

    // Include sorting options
    if (sort) {
      if (sort === "alphabetical-asc") {
        filter.order = [["name", "ASC"]];
      } else if (sort === "alphabetical-desc") {
        filter.order = [["name", "DESC"]];
      } else if (sort === "date-asc") {
        filter.order = [["updatedAt", "ASC"]];
      } else if (sort === "date-desc") {
        filter.order = [["updatedAt", "DESC"]];
      } else if (sort === "price-asc") {
        filter.order = [["price", "ASC"]];
      } else if (sort === "price-desc") {
        filter.order = [["price", "DESC"]];
      }
    }

    if (filterBy && filterBy.toLowerCase() !== "all genders") {
      if (filterBy.toLowerCase() === "men") {
        filter.where.gender = "Men";
      } else if (filterBy.toLowerCase() === "women") {
        filter.where.gender = "Women";
      } else if (filterBy.toLowerCase() === "unisex") {
        filter.where.gender = "Unisex";
      }
    }

    // Add condition for isArchived

    // Include category filter
    if (category && category !== "All") {
      filter.include = [
        { model: ProductImage, as: "productImages" },
        {
          model: Category,
          as: "Categories",
          through: { model: ProductCategory, attributes: [] },
          attributes: ["id", "name"],
          where: { name: category }, // Filter categories based on the queried category
        },
      ];
    } else {
      // Include without category filter
      filter.include = [
        { model: ProductImage, as: "productImages" },
        {
          model: Category,
          as: "Categories",
          through: { model: ProductCategory, attributes: [] },
          attributes: ["id", "name"],
        },
      ];
    }

    // Retrieve products without pagination to get the total count
    const totalData = await Product.count({
      ...filter,
      distinct: true, // Add this line to ensure distinct counts
      col: "id",
    });

    // Query to fetch products with primary details
    const products = await Product.findAll({
      where: filter.where,
      include: filter.include,
      order: filter.order,
      limit,
      offset: (page - 1) * limit,
    });

    if (!products || products.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "No products found!",
      });
    }

    // Extract product IDs for the next query
    const productIds = products.map((product) => product.id);

    // Query to fetch all categories associated with the products
    const allCategories = await ProductCategory.findAll({
      where: { productId: productIds },
      include: [{ model: Category, as: "Category", attributes: ["id", "name"] }],
    });

    // Organize categories by product ID for efficient mapping
    const categoriesByProductId = {};
    allCategories.forEach((productCategory) => {
      const { productId, Category } = productCategory;
      if (!categoriesByProductId[productId]) {
        categoriesByProductId[productId] = [];
      }
      categoriesByProductId[productId].push(Category);
    });

    // Map categories to the corresponding products
    products.forEach((product) => {
      const productId = product.id;
      product.dataValues.categories = categoriesByProductId[productId] || [];
      delete product.dataValues.Categories; // Remove unnecessary attribute
    });

    const productStock = await Promise.all(
      products.map(async (product) => {
        const warehouses = await Warehouse.findAll();

        const mutations = await Promise.all(
          warehouses.map(async (warehouse) => {
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
          })
        );

        // Calculate the total stock from all warehouses
        const totalStockAllWarehouses = mutations.reduce((total, mutation) => total + mutation.totalStock, 0);

        return {
          ...product.toJSON(),
          Mutations: mutations || [],
          totalStockAllWarehouses: totalStockAllWarehouses || 0,
        };
      })
    );

    // Send the response
    res.status(200).json({
      ok: true,
      pagination: {
        totalData,
        page,
      },
      details: productStock,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};
