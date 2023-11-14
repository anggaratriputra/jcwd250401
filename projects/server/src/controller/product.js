const { Product, ProductImage, ProductCategory, Category } = require("../models");
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
      return res.status(404).json({
        ok: false,
        msg: "Product already exists",
      });
    }

    // Create the product
    const product = await Product.create({
      name: productName,
      price: productPrice,
      description: productDescription,
      gender: productGender,
    });

    console.log(req.files);
    // Handle multiple images
    const images = req.files; // Assuming you use 'files' for multiple file uploads

    if (!images || images.length === 0) {
      return res.status(400).json({
        ok: false,
        msg: "No images uploaded",
      });
    }

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
