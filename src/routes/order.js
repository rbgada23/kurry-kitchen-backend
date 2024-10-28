const express = require("express");

const orderRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const Order = require("../models/order");

//Post Order
orderRouter.post("/order", userAuth, async (req, res) => {
  try {
    //ToDo : Add validations

    const {kitchenId,userId,items,totalAmount,deliveryAddress,orderStatus,platform,orderDate} = req.body;

    const order = new Order({
        kitchenId,
        userId,
        items,
        totalAmount,
        deliveryAddress,
        orderStatus,
        platform,
        orderDate
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


// Get All Orders
orderRouter.get("/order/all", userAuth, async (req, res) => {
    try {
      const orders = await Order.find();
  
      res.json({
        message: "All orders fetched successfully",
        data: orders,
      });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  });
  


module.exports = orderRouter;
