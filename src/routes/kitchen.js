const express = require("express");
const KitchenMenu = require("../models/kitchenMenu");
const KitchenDailyMenu = require("../models/kitchenDailyMenu");

const kitchenRouter = express.Router();
const { userAuth } = require("../middlewares/auth");

// Get all the kitchen menu
kitchenRouter.get("/kitchen/kitchenMenu", userAuth, async (req, res) => {
  try {
    const kitchenMenu = await KitchenMenu.find({});

    res.json({
      message: "Data fetched successfully",
      data: kitchenMenu,
    });
  } catch (err) {
    req.statusCode(400).send("ERROR: " + err.message);
  }
});

//Post kitchen Menu
kitchenRouter.post("/kitchen/kitchenMenu", userAuth, async (req, res) => {
  try {
    //ToDo : Add validations

    const { menuName, menuDescription, menuType, price, imageUrl } = req.body;
    const kitchenMenu = new KitchenMenu({
      menuName,
      menuDescription,
      menuType,
      price,
      imageUrl,
    });

    const data = await kitchenMenu.save();

    res.json({
      message: "Kitchen Menu Added",
      data,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

//Post Kitchen Daily Menu
kitchenRouter.post("/kitchen/kitchenDailyMenu", userAuth, async (req, res) => {
  try {
    //ToDo : Add validations

    const {kitchenId, kitchenMenuId, isAvailable, date} = req.body;

    console.log(kitchenId + " " + date);
    const kitchenDailyMenu = new KitchenDailyMenu({
      kitchenId,
      kitchenMenuId,
      isAvailable,
      date
    });
    
    const data = await kitchenDailyMenu.save();

    res.json({
      message: "Kitchen Daily Menu Added",
      data,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Get the daily menu
kitchenRouter.get("/kitchen/kitchenDailyMenu", userAuth, async (req, res) => {
  try {
    const kitchenDailyMenu = await KitchenDailyMenu.find({});

    res.json({
      message: "Data fetched successfully",
      data: kitchenDailyMenu,
    });
  } catch (err) {
    req.statusCode(400).send("ERROR: " + err.message);
  }
});


module.exports = kitchenRouter;
