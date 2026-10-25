const express = require("express");

const Cart = require("../models/Cart");
const Product = require("../models/Product");
const ChallengeResult = require("../models/ChallengeResult");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

const getCartPricing = async (cart) => {
  const latestChallenge =
    await ChallengeResult.findOne({
      user: cart.user,
    }).sort({
      createdAt: -1,
    });

  const challengePassed =
    latestChallenge?.passed === true;

  const discountPercent =
    !challengePassed &&
    latestChallenge?.passed === false
      ? latestChallenge.discountPercent || 0
      : 0;

  let subtotal = 0;
  let discount = 0;

  cart.items.forEach((item) => {
    if (!item.product) {
      return;
    }

    const price =
      Number(item.product.price) || 0;

    const quantity =
      Number(item.quantity) || 0;

    const itemTotal =
      price * quantity;

    subtotal += itemTotal;

    if (
      discountPercent > 0 &&
      item.product.isStylaura === true
    ) {
      discount +=
        itemTotal *
        (discountPercent / 100);
    }
  });

  const discountedSubtotal =
    subtotal - discount;

  return {
    subtotal,
    discount,
    discountPercent,
    discountedSubtotal,
    challenge: {
      hasResult: Boolean(latestChallenge),
      passed:
        latestChallenge?.passed === true,
      score:
        latestChallenge?.score ?? null,
      discountPercent,
    },
  };
};

router.get("/", protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({
      user: req.user._id,
    }).populate("items.product");

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });

      await cart.populate(
        "items.product"
      );
    }

    const pricing =
      await getCartPricing(cart);

    res.status(200).json({
      cart,
      pricing,
    });
  } catch (error) {
    console.error(
      "Get cart error:",
      error.message
    );

    res.status(500).json({
      message: "Unable to load cart.",
    });
  }
});

router.post(
  "/items",
  protect,
  async (req, res) => {
    console.log(
      "CART ADD REQUEST REACHED",
      req.user?._id
    );

    try {
      const {
        productId,
        quantity = 1,
      } = req.body;

      if (!productId) {
        return res.status(400).json({
          message:
            "Product ID is required.",
        });
      }

      const product =
        await Product.findById(
          productId
        );

      if (!product) {
        return res.status(404).json({
          message:
            "Product not found.",
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          message:
            "This product is currently unavailable.",
        });
      }

      if (product.stock <= 0) {
        return res.status(400).json({
          message:
            "This product is out of stock.",
        });
      }

      const requestedQuantity =
        Number(quantity);

      if (
        !Number.isInteger(
          requestedQuantity
        ) ||
        requestedQuantity < 1
      ) {
        return res.status(400).json({
          message:
            "Quantity must be at least 1.",
        });
      }

      let cart = await Cart.findOne({
        user: req.user._id,
      });

      if (!cart) {
        cart = new Cart({
          user: req.user._id,
          items: [],
        });
      }

      const existingItemIndex =
        cart.items.findIndex(
          (item) =>
            item.product.toString() ===
            productId
        );

      if (existingItemIndex !== -1) {
        const newQuantity =
          cart.items[existingItemIndex]
            .quantity +
          requestedQuantity;

        if (
          newQuantity >
          product.stock
        ) {
          return res.status(400).json({
            message:
              `Only ${product.stock} units are available.`,
          });
        }

        cart.items[
          existingItemIndex
        ].quantity = newQuantity;
      } else {
        cart.items.push({
          product: productId,
          quantity:
            requestedQuantity,
        });
      }

      await cart.save();

      await cart.populate(
        "items.product"
      );

      const pricing =
        await getCartPricing(cart);

      res.status(200).json({
        message:
          "Product added to cart.",
        cart,
        pricing,
      });
    } catch (error) {
      console.error(
        "Add to cart error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to add product to cart.",
      });
    }
  }
);

router.put(
  "/items/:productId",
  protect,
  async (req, res) => {
    try {
      const requestedQuantity =
        Number(req.body.quantity);

      if (
        !Number.isInteger(
          requestedQuantity
        ) ||
        requestedQuantity < 1
      ) {
        return res.status(400).json({
          message:
            "Quantity must be at least 1.",
        });
      }

      const product =
        await Product.findById(
          req.params.productId
        );

      if (!product) {
        return res.status(404).json({
          message:
            "Product not found.",
        });
      }

      if (
        requestedQuantity >
        product.stock
      ) {
        return res.status(400).json({
          message:
            `Only ${product.stock} units are available.`,
        });
      }

      const cart =
        await Cart.findOne({
          user: req.user._id,
        });

      if (!cart) {
        return res.status(404).json({
          message:
            "Cart not found.",
        });
      }

      const item = cart.items.find(
        (cartItem) =>
          cartItem.product.toString() ===
          req.params.productId
      );

      if (!item) {
        return res.status(404).json({
          message:
            "Product is not in your cart.",
        });
      }

      item.quantity =
        requestedQuantity;

      await cart.save();

      await cart.populate(
        "items.product"
      );

      const pricing =
        await getCartPricing(cart);

      res.status(200).json({
        message:
          "Cart updated successfully.",
        cart,
        pricing,
      });
    } catch (error) {
      console.error(
        "Update cart error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to update cart.",
      });
    }
  }
);

router.delete(
  "/items/:productId",
  protect,
  async (req, res) => {
    try {
      const cart =
        await Cart.findOne({
          user: req.user._id,
        });

      if (!cart) {
        return res.status(404).json({
          message:
            "Cart not found.",
        });
      }

      cart.items =
        cart.items.filter(
          (item) =>
            item.product.toString() !==
            req.params.productId
        );

      await cart.save();

      await cart.populate(
        "items.product"
      );

      const pricing =
        await getCartPricing(cart);

      res.status(200).json({
        message:
          "Product removed from cart.",
        cart,
        pricing,
      });
    } catch (error) {
      console.error(
        "Remove cart item error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to remove product.",
      });
    }
  }
);

router.delete(
  "/",
  protect,
  async (req, res) => {
    try {
      const cart =
        await Cart.findOne({
          user: req.user._id,
        });

      if (!cart) {
        return res.status(200).json({
          message:
            "Cart is already empty.",
        });
      }

      cart.items = [];

      await cart.save();

      res.status(200).json({
        message:
          "Cart cleared successfully.",
        cart,
      });
    } catch (error) {
      console.error(
        "Clear cart error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to clear cart.",
      });
    }
  }
);

module.exports = router;