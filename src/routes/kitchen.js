const express = require("express");
const multer = require("multer");
const KitchenMenu = require("../models/kitchenMenu");
const KitchenDailyMenu = require("../models/kitchenDailyMenu");

const kitchenRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const Kitchen = require("../models/kitchen");
const kitchenMenu = require("../models/kitchenMenu");
// Configure multer to store images temporarily in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

//Post Kitchen
kitchenRouter.post("/kitchen", async (req, res) => {
  try {
    //ToDo : Add validations

    const { name, address, contactNumber, operatingHours, user } = req.body;

    const kitchen = new Kitchen({
      name,
      address,
      contactNumber,
      operatingHours,
      user,
    });

    const data = await kitchen.save();

    res.json({
      message: "Kitchen Details Added",
      data,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

kitchenRouter.get("/kitchen", async (req, res) => {
  try {
    const userId = req.query.userId;
    const kitchenObj = await Kitchen.findOne({ user: userId });

    res.json({
      message: "Data fetched successfully",
      data: kitchenObj,
    });
  } catch (err) {
    req.statusCode(400).send("ERROR: " + err.message);
  }
});

// Get All Kitchens
kitchenRouter.get("/kitchen/all", async (req, res) => {
  try {
    const kitchens = await Kitchen.find();

    res.json({
      message: "All kitchens fetched successfully",
      data: kitchens,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Get Kitchen Profile
kitchenRouter.get("/kitchen/profile", async (req, res) => {
  try {
    const kitchenId = req.query.kitchenId; // Pass kitchen ID as a query parameter
    const kitchenProfile = await Kitchen.findById(kitchenId).select(
      "name address contactNumber image"
    );

    let logoBase64 = null;
    if (kitchenProfile.image?.data) {
      logoBase64 = `data:${kitchenProfile.image.contentType};base64,${kitchenProfile.image.data?.toString("base64")}`;
    }

    res.json({
      message: "Kitchen profile fetched successfully",
      data: {
        name: kitchenProfile.name,
        address: kitchenProfile.address,
        contactNumber: kitchenProfile.contactNumber,
        logo: logoBase64,
      },
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Update Kitchen Profile
kitchenRouter.put(
  "/kitchen/profile",
  userAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      const kitchenId = req.query.kitchenId; // Pass kitchen ID as a query parameter
      const { name, address } = req.body;

      const updateData = { name, address };

      // Update logo if a new image is provided
      if (req.file) {
        updateData.image = {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        };
      }

      const updatedKitchen = await Kitchen.findByIdAndUpdate(
        kitchenId,
        { $set: updateData },
        { new: true } // Return the updated document
      );

      if (!updatedKitchen) {
        return res.status(404).json({ message: "Kitchen not found" });
      }

      res.json({
        message: "Kitchen profile updated successfully",
        data: updatedKitchen,
      });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  }
);


// Get the kitchen menu
kitchenRouter.get("/kitchen/kitchenMenu", async (req, res) => {
  try {
    const kitchen = req.query.kitchen; //kitchen id
    const kitchenMenu = await KitchenMenu.find({ kitchen: kitchen });

    //Convert image data to Base64
    let imageBase64 = null;
    if (kitchenMenu.image) {
      imageBase64 = `data:${kitchenMenu.image.contentType
        };base64,${menu.image.data.toString("base64")}`;
    }

    res.json({
      message: "All kitchens fetched successfully",
      data: kitchenMenu,
      image: imageBase64, // Include the Base64-encoded image
    });
    // res.json({
    //   data : kitchenMenu,
    //   message:"Kitchen Menu fetched successfully",
    // });
  } catch (err) {
    req.statusCode(400).send("ERROR: " + err.message);
  }
});

//Post kitchen Menu
kitchenRouter.post(
  "/kitchen/kitchenMenu",
  userAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      //ToDo : Add validations

      const { name, type, items, price, kitchen } = req.body;
      const kitchenMenu = new KitchenMenu({
        name,
        type,
        items,
        price,
        kitchen,
      });

      // Attach image to the document
      if (req.file) {
        kitchenMenu.image = {
          data: req.file.buffer, // Store image data in binary format
          contentType: req.file.mimetype,
        };
      }

      const data = await kitchenMenu.save();

      res.json({
        message: "Kitchen Menu Added",
        data,
      });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  }
);

//Put operations on kitchen Menu
kitchenRouter.put("/kitchen/kitchenMenu", async (req, res) => {
  try {
    //ToDo : Add validations
    const kitchenMenuId = req.query.id;
    const action = req.query.isUpdate; // 1 - update, 0 - delete
    const filter = { _id: kitchenMenuId }; // The condition to find the document
    const data = req.body;
    //Update the document
    if (action == 1) {
      const updateDoc = {
        $set: data,
      };
      const result = await KitchenMenu.findOneAndUpdate(filter, updateDoc, {
        returnDocument: "after", 
      });
      if (result) {
        const updatedData = result;
        res.json({
          message: "Kitchen Menu updated successfully",
          updatedData,
        });
      } else {
        res.json({
          message:
            "Kitchen Menu could not be updated as no record was not found",
          data,
        });
      }
    } else {
      const result = await KitchenMenu.deleteOne(filter);
      res.json({
        message: "Kitchen Menu deleted successfully",
        data,
      });
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
});

//Post Kitchen Daily Menu
kitchenRouter.post("/kitchen/kitchenDailyMenu", async (req, res) => {
  try {
    //ToDo : Add validations

    const { kitchenId, kitchenMenuId, isAvailable, date } = req.body;

    console.log(kitchenId + " " + date);
    const kitchenDailyMenu = new KitchenDailyMenu({
      kitchenId,
      kitchenMenuId,
      isAvailable,
      date,
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
kitchenRouter.get("/kitchen/kitchenDailyMenu", async (req, res) => {
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
