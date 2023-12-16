const { Op } = require("sequelize");
const { User, Cart, CartItem, Product, ProductImage, Mutation } = require("../models");

exports.handleAddToCart = async (req, res) => {
  const { id: userId } = req.user;
  const { productId, quantity } = req.body;

  try {
    if (!userId) {
      return res.status(403).json({
        ok: false,
        message: "Please login first.",
      });
    }

    if (!productId) {
      return res.status(400).json({
        ok: false,
        message: "Product id is required",
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "User not found",
      });
    }

    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: "Product not found",
      });
    }

    const cart = await Cart.findOne({
      where: {
        userId, // Assuming userId is available
      },
    });

    if (!cart) {
      const newCart = await Cart.create({
        userId,
      });

      await CartItem.create({
        cartId: newCart.id,
        quantity,
        productId,
      });

      return res.status(201).json({
        ok: true,
        message: "Product added to cart successfully",
        detail: newCart,
      });
    }

    const cartItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    if (!cartItem) {
      await CartItem.create({
        cartId: cart.id,
        productId,
        quantity,
      });

      return res.status(201).json({
        ok: true,
        message: "Product added to cart successfully",
        detail: cart,
      });
    }

    cartItem.quantity += quantity;
    await cartItem.save();

    return res.status(200).json({
      ok: true,
      message: "Product added to cart successfully",
      detail: cart,
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

exports.handleGetCart = async (req, res) => {
  const { id: userId } = req.user;

  try {
    if (!userId) {
      return res.status(403).json({
        ok: false,
        message: "Please login first.",
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "User not found",
      });
    }

    const cart = await Cart.findOne({
      where: {
        userId,
      },
      include: [
        {
          model: CartItem,
          include: [
            {
              model: Product,
              include: [
                {
                  model: ProductImage,
                  as: "productImages",
                  attributes: ["id", "imageUrl"],
                },
                {
                  model: Mutation,
                  attributes: ["stock"],
                  order: [['createdAt', 'DESC']],
                  limit: 1
                }
              ],
            },
          ],
        },
      ],
      order: [
        [CartItem, 'createdAt', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });

    // Check if cart is found
    if (!cart) {
      return res.status(404).json({
        ok: false,
        message: "Cart not found",
      });
    }

    // Calculate total stock for each product in the cart
    cart.CartItems.forEach(item => {
      const mutations = item.Product.Mutations;
      item.Product.totalStock = mutations.reduce((total, mutation) => total + mutation.stock, 0);
    });

    return res.status(200).json({
      ok: true,
      message: "Success",
      detail: cart,
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

exports.handleDeleteCartItem = async (req, res) => {
    const { id: userId } = req.user;
    const { productId } = req.params; // Assuming productId is passed as a URL parameter
  
    try {
      if (!userId) {
        return res.status(403).json({
          ok: false,
          message: "Please login first.",
        });
      }
  
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          ok: false,
          message: "User not found",
        });
      }
  
      const cart = await Cart.findOne({
        where: {
          userId,
        },
        include: [
          {
            model: CartItem,
          },
        ],
      });
  
      // Check if cart is found
      if (!cart) {
        return res.status(404).json({
          ok: false,
          message: "Cart not found",
        });
      }
  
      const cartItem = await CartItem.findOne({
        where: {
          cartId: cart.id,
          productId: productId,
        },
      });
  
      if (!cartItem) {
        return res.status(404).json({
          ok: false,
          message: "Cart item not found",
        });
      }
  
      await cartItem.destroy();
  
      return res.status(200).json({
        ok: true,
        message: "Items deleted successfully",
        detail: cart,
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


  exports.handleUpdateCartItem = async (req, res) => {
    const { id: userId } = req.user;
    const { productId } = req.params; // Assuming productId is passed as a URL parameter
    const { quantity } = req.body; // Assuming quantity is passed as a request body
  
    try {
      if (!userId) {
        return res.status(403).json({
          ok: false,
          message: "Please login first.",
        });
      }
  
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          ok: false,
          message: "User not found",
        });
      }
  
      const cart = await Cart.findOne({
        where: {
          userId,
        },
        include: [
          {
            model: CartItem,
          },
        ],
      });
  
      // Check if cart is found
      if (!cart) {
        return res.status(404).json({
          ok: false,
          message: "Cart not found",
        });
      }
  
      const cartItem = await CartItem.findOne({
        where: {
          cartId: cart.id,
          productId: productId,
        },
      });
  
      if (!cartItem) {
        return res.status(404).json({
          ok: false,
          message: "Cart item not found",
        });
      }
  
      cartItem.quantity = quantity;
      await cartItem.save();
  
      return res.status(200).json({
        ok: true,
        message: "Items updated successfully",
        detail: cart,
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