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
    console.log(err.message);
    res.status(400).send("ERROR: " + err.message);
  }
});

orderRouter.get("/order", userAuth, async (req, res) => {
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


module.exports = orderRouter;
