const express = require("express");
const multer = require("multer");

const orderRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const Order = require("../models/order");
const User = require("../models/user");
const KitchenMenu = require("../models/kitchenMenu");
const axios = require("axios");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const VERIFY_TOKEN = "akash";

const WHATSAPP_API_URL = "https://graph.facebook.com/v21.0/436514232886145/messages";
const ACCESS_TOKEN = "EAARkrOqqAowBO3wEdwUDZCmjNDNtBn2zeNBhFVS7D3JQGYBtEDZBnKZASKwaEQ0VeksHaZCPsb3ZAx8rA7gI3pbwAh2uZAjnNxVIX7SosFFyJvRYIxAJFYVi0j0HcJVVYYaryTlEbxZBnACwgnmqJKI7ZCNeLhlJyYGVv6yjF3zrBWILJP1cLu0ZAYTKEw2UBstoZBOdeES5pqMfWZCpXZAeseEGiEfRV4pfwSwGyLM8PGFggLYZD";


const { ObjectId } = require("mongodb");

async function sendOrderConfirmationMessage(phoneNumber, name, orderNumber, deliveryDate) {
  try {
    const response = await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "template",
        template: {
          name: "order_management_2",
          language: { code: "en_US" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: name },
                { type: "text", text: orderNumber },
                { type: "text", text: deliveryDate },
              ],
            },
          ],
        },
      },
      {

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );
    console.log("Order confirmation message sent successfully!", response.data);
  } catch (error) {
    console.error("Error sending order confirmation message:", error.response?.data || error.message);
  }
}

//Post Order
orderRouter.post("/order", userAuth, async (req, res) => {
  try {
    //ToDo : Add validations

    const {
      kitchenId,
      userId,
      items,
      totalAmount,
      deliveryAddress,
      orderStatus,
      platform,
      orderDate,
    } = req.body;

    const order = new Order({
      kitchenId,
      userId,
      items,
      totalAmount,
      deliveryAddress,
      orderStatus,
      platform,
      orderDate,
    });

    const data = await order.save();

    res.json({
      message: "Order placed successfully",
      data,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

//Put Order
orderRouter.put("/order", userAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      const orderId = req.query.id;
      const filter = { _id: orderId }; // The condition to find the document
      const data = req.body;

      //Note : If we want to also update order in future, we can update req.body instead of only orderstatus
      const updateDoc = {
        $set: { orderStatus: req.body.orderStatus },
      };
      const result = await Order.findOneAndUpdate(filter, updateDoc, {
        returnDocument: "after",
      });
      if (result) {
        //Send message to the user
        sendOrderConfirmationMessage("+12018927672", "Rishabh", orderId, "December 12, 2024");

        const updatedData = result;
        res.json({
          message: `Order ` + req.body.orderStatus + ` succesfully`,
          updatedData,
        });
      }
    } catch (err) {
      console.log(err.message);
      res.status(400).send("ERROR: " + err.message);
    }
  });

//By kitchen Id
orderRouter.get("/order/kitchen", userAuth, async (req, res) => {
  try {
    const kitchenId = req.query.kitchenId;

    // Fetch orders for the given kitchenId
    const orders = await Order.find({ kitchenId: kitchenId });

    // Extract userIds
    const userIds = orders.map((order) => new ObjectId(order.userId));

    // Extract menuItemIds only if `items` is an array
    const menuItemIds = orders.flatMap((order) =>
      Array.isArray(order.items)
        ? order.items
          .filter((item) => item.menuItemId) // Ensure menuItemId exists
          .map((item) => item.menuItemId)
        : [] // Skip for plain text `items`
    );

    // Fetch users and menu items from the database
    const users = await User.find({ _id: { $in: userIds } });
    const menuItems = menuItemIds.length
      ? await KitchenMenu.find({ _id: { $in: menuItemIds } })
      : [];

    // Create lookup maps for users and menu items
    const userMap = users.reduce((acc, user) => {
      acc[user._id.toString()] = user; // Map userId to user object
      return acc;
    }, {});

    const menuMap = menuItems.reduce((acc, menuItem) => {
      acc[menuItem._id.toString()] = menuItem.toObject(); // Map menuItemId to menuItem object
      return acc;
    }, {});

    // Build the result
    const result = orders.map((order) => {
      const plainOrder = order.toObject(); // Convert order to plain object

      let updatedItems;
      if (Array.isArray(plainOrder.items)) {
        // Use Case 1: Structured `items` array
        updatedItems = plainOrder.items.map((item) => ({
          ...item,
          menuItemObj: menuMap[item.menuItemId?.toString()] || null, // Map menuItemObj or set to null
        }));
      } else {
        // Use Case 2: Plain text `items`
        updatedItems = plainOrder.items; // Keep plain text as is
      }

      return {
        ...plainOrder,
        userObj: userMap[order.userId] || null, // Map user object or set to null
        items: updatedItems, // Updated items
      };
    });

    // Send the response
    res.json({
      message: "All orders fetched successfully",
      data: result,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

//By user Id
orderRouter.get("/order/user/history", userAuth, async (req, res) => {
  try {
    const userId = req.query.userId;

    // Fetch orders for the given kitchenId
    const orders = await Order.find({ userId: userId, orderStatus: 'accepted' });

    // Extract userIds
    const userIds = orders.map((order) => new ObjectId(order.userId));

    // Extract menuItemIds only if `items` is an array
    const menuItemIds = orders.flatMap((order) =>
      Array.isArray(order.items)
        ? order.items
          .filter((item) => item.menuItemId) // Ensure menuItemId exists
          .map((item) => item.menuItemId)
        : [] // Skip for plain text `items`
    );

    // Fetch users and menu items from the database
    const users = await User.find({ _id: { $in: userIds } });
    const menuItems = menuItemIds.length
      ? await KitchenMenu.find({ _id: { $in: menuItemIds } })
      : [];

    // Create lookup maps for users and menu items
    const userMap = users.reduce((acc, user) => {
      acc[user._id.toString()] = user; // Map userId to user object
      return acc;
    }, {});

    const menuMap = menuItems.reduce((acc, menuItem) => {
      acc[menuItem._id.toString()] = menuItem.toObject(); // Map menuItemId to menuItem object
      return acc;
    }, {});

    // Build the result
    const result = orders.map((order) => {
      const plainOrder = order.toObject(); // Convert order to plain object

      let updatedItems;
      if (Array.isArray(plainOrder.items)) {
        // Use Case 1: Structured `items` array
        updatedItems = plainOrder.items.map((item) => ({
          ...item,
          menuItemObj: menuMap[item.menuItemId?.toString()] || null, // Map menuItemObj or set to null
        }));
      } else {
        // Use Case 2: Plain text `items`
        updatedItems = plainOrder.items; // Keep plain text as is
      }

      return {
        ...plainOrder,
        userObj: userMap[order.userId] || null, // Map user object or set to null
        items: updatedItems, // Updated items
      };
    });

    // Send the response
    res.json({
      message: "All orders fetched successfully",
      data: result,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = orderRouter;
