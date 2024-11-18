const express = require("express");

const orderRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const Order = require("../models/order");
const User = require("../models/user");
const KitchenMenu = require("../models/kitchenMenu");

const { ObjectId } = require("mongodb");
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
orderRouter.put("/order", userAuth, async (req, res) => {
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
      const updatedData = result;
      res.json({
        message: `Order ` + req.body.orderStatus + ` succesfully`,
        updatedData,
      });
    }
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Get All Orders for the kitchens
orderRouter.get("/order", userAuth, async (req, res) => {
  try {
    const kitchenId = req.query.kitchenId;
    const orders = await Order.find({ kitchenId: kitchenId });
    //const usersCollection = user.collection("User");

    const userIds = orders.map((item) => new ObjectId(item.userId)); // Extract userIds and convert to ObjectId
    const menuItemIds = orders.flatMap((order) =>
      order.items.map((item) => item.menuItemId)
    );

    const users = await User.find({ _id: { $in: userIds } });
    const menuItems = await KitchenMenu.find({ _id: { $in: menuItemIds } });

    // Create a lookup map for quick access to user objects
    const userMap = users.reduce((acc, user) => {
      acc[user._id.toString()] = user; // Map userId to user object
      return acc;
    }, {});

    const menuMap = menuItems.reduce((acc, menuItem) => {
      acc[menuItem._id.toString()] = menuItem.toObject(); // Convert each menu item to plain object
      return acc;
    }, {});

    // Add userObj and menuItemObj to each order
    const result = orders.map((order) => {
      const plainOrder = order.toObject(); // Convert order to plain object
      const updatedItems = plainOrder.items.map((item) => ({
        ...item,
        menuItemObj: menuMap[item.menuItemId.toString()] || null, // Add menuItemObj to each item
      }));

      return {
        ...plainOrder,
        userObj: userMap[order.userId] || null, // Add userObj if found
        items: updatedItems, // Updated items with menuItemObj
      };
    });
    res.json({
      message: "All orders fetched successfully",
      data: result,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = orderRouter;
