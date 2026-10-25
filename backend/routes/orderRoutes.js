
const express = require("express");

const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const ChallengeResult = require("../models/ChallengeResult");

const protect = require("../middleware/authMiddleware");
const adminProtect = require("../middleware/adminMiddleware");
const { sendEmail } = require("../config/brevo");

const router = express.Router();

// Escape user-provided values before inserting them into HTML.
const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));

// =========================================================
// CUSTOMER — PLACE ORDER
// =========================================================

router.post("/", protect, async (req, res) => {
  try {
    const { delivery, paymentMethod } = req.body;

    if (!delivery) {
      return res.status(400).json({
        message: "Delivery details are required.",
      });
    }

    const requiredDeliveryFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "pincode",
    ];

    for (const field of requiredDeliveryFields) {
      if (
        !delivery[field] ||
        !String(delivery[field]).trim()
      ) {
        return res.status(400).json({
          message: `Please provide ${field}.`,
        });
      }
    }

    const recipientEmail = String(delivery.email).trim();

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)
    ) {
      return res.status(400).json({
        message: "Please provide a valid delivery email.",
      });
    }

    if (!["card", "cod"].includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method.",
      });
    }

    const cart = await Cart.findOne({
      user: req.user._id,
    }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty.",
      });
    }

    // ---------------------------------------------------------
    // LOAD LATEST STYLE CHALLENGE RESULT
    // ---------------------------------------------------------

    const latestChallenge = await ChallengeResult.findOne({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    const challengeFailed =
      latestChallenge?.passed === false;

    const discountPercent = challengeFailed
      ? Number(latestChallenge?.discountPercent || 0)
      : 0;

    // ---------------------------------------------------------
    // CALCULATE ORDER PRICING
    // ---------------------------------------------------------

    let subtotal = 0;
    let discount = 0;

    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;

      if (!product) {
        return res.status(400).json({
          message: "A product in your cart no longer exists.",
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          message: `${product.name} is currently unavailable.`,
        });
      }

      if (
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          message: `Invalid quantity for ${product.name}.`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Only ${product.stock} units of ${product.name} are available.`,
        });
      }

      const itemSubtotal =
        Number(product.price) * Number(item.quantity);

      subtotal += itemSubtotal;

      // Discounts apply only to STYLAURA products.
      if (
        discountPercent > 0 &&
        product.isStylaura === true
      ) {
        discount +=
          itemSubtotal * (discountPercent / 100);
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        quantity: item.quantity,
      });
    }

    discount = Math.round(discount * 100) / 100;

    // Preserve existing shipping rule.
    const shipping = subtotal >= 2000 ? 0 : 99;

    const discountedSubtotal = subtotal - discount;

    const total =
      Math.round(
        (discountedSubtotal + shipping) * 100
      ) / 100;

    // ---------------------------------------------------------
    // REDUCE PRODUCT STOCK
    // ---------------------------------------------------------

    // Recheck stock before updating each product.
    for (const item of cart.items) {
      const product = await Product.findById(
        item.product._id
      );

      if (!product) {
        return res.status(400).json({
          message: "A product could not be found.",
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Only ${product.stock} units of ${product.name} are available.`,
        });
      }

      product.stock -= item.quantity;
      await product.save();
    }

    // ---------------------------------------------------------
    // CREATE ORDER
    // ---------------------------------------------------------

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,

      delivery: {
        firstName: String(delivery.firstName).trim(),
        lastName: String(delivery.lastName).trim(),
        email: recipientEmail,
        phone: String(delivery.phone).trim(),
        address: String(delivery.address).trim(),
        city: String(delivery.city).trim(),
        state: String(delivery.state).trim(),
        pincode: String(delivery.pincode).trim(),
      },

      paymentMethod,
      subtotal,
      shipping,
      total,
      status: "placed",
    });

    // ---------------------------------------------------------
    // CLEAR CART
    // ---------------------------------------------------------

    cart.items = [];
    await cart.save();

    // ---------------------------------------------------------
    // SEND ORDER CONFIRMATION EMAIL
    // Email failure must not undo a successfully placed order.
    // ---------------------------------------------------------

    try {
      const customerName = escapeHtml(
        `${order.delivery.firstName} ${order.delivery.lastName}`
      );

      const itemRows = order.items
        .map((item) => {
          const name = escapeHtml(item.name);
          const quantity = Number(item.quantity);
          const lineTotal =
            Number(item.price) * quantity;

          return `
            <tr>
              <td style="padding:10px;border-bottom:1px solid #eee;">
                ${name}
              </td>
              <td style="padding:10px;text-align:center;border-bottom:1px solid #eee;">
                ${quantity}
              </td>
              <td style="padding:10px;text-align:right;border-bottom:1px solid #eee;">
                ₹${lineTotal.toFixed(2)}
              </td>
            </tr>
          `;
        })
        .join("");

      const deliveryAddress = escapeHtml([
        order.delivery.address,
        order.delivery.city,
        order.delivery.state,
        order.delivery.pincode,
      ].join(", "));

      const htmlContent = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;line-height:1.6;">
          <h1 style="color:#8b5e83;">STYLAURA</h1>

          <h2>Thank you for your order, ${customerName}!</h2>

          <p>Your order has been placed successfully.</p>

          <p>
            <strong>Order ID:</strong>
            ${escapeHtml(order._id)}
          </p>

          <h3>Order summary</h3>

          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr>
                <th style="padding:10px;text-align:left;">Product</th>
                <th style="padding:10px;text-align:center;">Qty</th>
                <th style="padding:10px;text-align:right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>

          <div style="margin-top:20px;">
            <p>Subtotal: ₹${Number(order.subtotal).toFixed(2)}</p>
            <p>Discount: ₹${Number(discount).toFixed(2)}</p>
            <p>Shipping: ₹${Number(order.shipping).toFixed(2)}</p>

            <h3>Total: ₹${Number(order.total).toFixed(2)}</h3>

            <p>
              <strong>Payment method:</strong>
              ${escapeHtml(order.paymentMethod.toUpperCase())}
            </p>

            <p>
              <strong>Delivery address:</strong><br>
              ${deliveryAddress}
            </p>
          </div>

          <p>We'll keep you updated as your order progresses.</p>

          <p>With love,<br>Team STYLAURA</p>
        </div>
      `;

      await sendEmail({
        to: recipientEmail,
        subject: "Your STYLAURA order is confirmed!",
        htmlContent,
      });

      console.log(
        `Order confirmation email accepted for order ${order._id}`
      );
    } catch (emailError) {
      console.error(
        `Order ${order._id} was placed, but its confirmation email failed:`,
        emailError.message
      );
    }

    // ---------------------------------------------------------
    // RETURN SUCCESS
    // ---------------------------------------------------------

    return res.status(201).json({
      message: "Order placed successfully.",
      order,
      pricing: {
        subtotal,
        discount,
        discountPercent,
        shipping,
        total,
      },
    });
  } catch (error) {
    console.error(
      "Create order error:",
      error.message
    );

    return res.status(500).json({
      message: "Unable to place order.",
    });
  }
});

// =========================================================
// CUSTOMER — ORDER HISTORY
// =========================================================

router.get("/", protect, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    })
      .populate("items.product")
      .sort({ createdAt: -1 });

    return res.status(200).json({ orders });
  } catch (error) {
    console.error("Get orders error:", error.message);

    return res.status(500).json({
      message: "Unable to load orders.",
    });
  }
});

// =========================================================
// ADMIN — ALL CUSTOMER ORDERS
// =========================================================

router.get(
  "/admin",
  protect,
  adminProtect,
  async (req, res) => {
    try {
      const orders = await Order.find()
        .populate("user", "name email")
        .populate("items.product")
        .sort({ createdAt: -1 });

      return res.status(200).json({ orders });
    } catch (error) {
      console.error(
        "Admin get orders error:",
        error.message
      );

      return res.status(500).json({
        message: "Unable to load customer orders.",
      });
    }
  }
);

// =========================================================
// ADMIN — UPDATE ORDER STATUS
// =========================================================

router.put(
  "/admin/:id/status",
  protect,
  adminProtect,
  async (req, res) => {
    try {
      const { status } = req.body;

      const allowedStatuses = [
        "placed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid order status.",
        });
      }

      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({
          message: "Order not found.",
        });
      }

      
order.status = status;

await order.save();

await order.populate("user", "name email");
await order.populate("items.product");

// Send an email when the order status changes.
try {
  const statusMessages = {
    placed: {
      subject: "Your STYLAURA order has been placed",
      message: "We've received your order and will keep you updated.",
    },
    processing: {
      subject: "Your STYLAURA order is being processed",
      message: "We're preparing your order.",
    },
    shipped: {
      subject: "Your STYLAURA order has shipped!",
      message: "Your order is on its way to you.",
    },
    delivered: {
      subject: "Your STYLAURA order has been delivered!",
      message: "We hope you love your STYLAURA purchase.",
    },
    cancelled: {
      subject: "Your STYLAURA order was cancelled",
      message: "Your order has been marked as cancelled. Please contact us if you have questions about a refund.",
    },
  };

  const emailDetails = statusMessages[status];

  if (emailDetails && order.delivery?.email) {
    const escapeHtml = (value = "") =>
      String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[char]));

    await sendEmail({
      to: order.delivery.email,
      subject: emailDetails.subject,
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#333;line-height:1.6;">
          <h1 style="color:#8b5e83;">STYLAURA</h1>
          <h2>Hello ${escapeHtml(order.delivery.firstName)},</h2>
          <p>${escapeHtml(emailDetails.message)}</p>
          <p><strong>Order ID:</strong> ${escapeHtml(order._id)}</p>
          <p><strong>Order status:</strong> ${escapeHtml(status.toUpperCase())}</p>
          <p><strong>Order total:</strong> ₹${Number(order.total).toFixed(2)}</p>
          <p>Thank you for shopping with STYLAURA!</p>
        </div>
      `,
    });

    console.log(
      `Order status email accepted for order ${order._id}: ${status}`
    );
  }
} catch (emailError) {
  // Email failure must not undo the saved order status.
  console.error(
    `Order status email failed for order ${order._id}:`,
    emailError.message
  );
}

      return res.status(200).json({
        message: "Order status updated successfully.",
        order,
      });
    } catch (error) {
      console.error(
        "Admin update order error:",
        error.message
      );

      return res.status(500).json({
        message: "Unable to update order status.",
      });
    }
  }
);

module.exports = router;
