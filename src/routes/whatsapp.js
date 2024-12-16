const express = require("express");
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");
const Kitchen = require("../models/kitchen");
const Order = require("../models/order");
const axios = require("axios");
const KitchenMenu = require("../models/kitchenMenu");

const whatsappRouter = express.Router();
const ACCESS_TOKEN =
  "EAARkrOqqAowBO9H4FkQ0MZC4bw2XTPc34MZAIJbX8j1ttAEYFG6ai7MEyAOMZBTqSAJPX3eElYfETFLxnlMA8WEZBRlutevBG67TD3aexJTawAuHJbAbCGSj7lZBfKKafpmKvvrmMMXgIWpREwkZC9KZAXoZBLeDZCOpZCchyi4t6r7tMvMyu5Twyvf0bJMuZB0PbIP8uEiSsZChEirl9qYGbddgTTmZBklX8IVp53MdfsbVAqdcD";

const VERIFY_TOKEN = "akash";

const WHATSAPP_API_URL =
  "https://graph.facebook.com/v21.0/436514232886145/messages";

async function getUserByContactNumber(contactNumber) {
  try {
    // Use findOne to fetch the user with the given contactNumber
    const user = await User.findOne({ contactNumber: contactNumber });

    if (!user) {
      console.log("No user found with the provided contact number.");
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error fetching user by contact number:", error);
    throw error;
  }
}

async function getKitchenByContactNumber(contactNumber) {
  try {
    // Use findOne to fetch the user with the given contactNumber
    const kitchenObj = await Kitchen.findOne({ contactNumber: contactNumber });

    if (!kitchenObj) {
      console.log("No kitchen found with the provided contact number.");
      return null;
    }

    return kitchenObj;
  } catch (error) {
    console.error("Error fetching kitchen by contact number:", error);
    throw error;
  }
}

async function getKitchenMenu(id) {
  try {
    const kitchenMenu = await KitchenMenu.find({ kitchen: id });
    if (!kitchenMenu) {
      console.log("No kitchen found with the provided contact number.");
      return null;
    }

    return kitchenMenu;
  } catch (error) {
    console.error("Error fetching kitchen by id", error);
    throw error;
  }
}

// Endpoint to handle the webhook verification
whatsappRouter.get("/webhook", async (req, res) => {
  console.log("inside");
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  console.log(token);
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified successfully!");
    res.status(200).send(challenge);
  } else {
    res.status(403).send("Verification token mismatch");
  }
});

// Endpoint to handle incoming messages
whatsappRouter.post("/webhook", async (req, res) => {
  const data = req.body;
  // Check if the structure contains the expected fields
  if (data.object === "whatsapp_business_account") {
    data.entry.forEach((entry) => {
      entry.changes.forEach(async (change) => {
        // Check if the change object is a message
        if (change.value && change.value.messages) {
          const message = change.value.messages[0];
          console.log(message.text.body.includes("Hi") + message.text.body);
          const customerContactNumber = message.from;
          const kitchenContactNumber =
            change?.value?.metadata?.display_phone_number;
          const items = message.text ? message.text.body : "No text message";
          console.log(`Message from ${customerContactNumber}: ${items}`);
          const customer = await getUserByContactNumber(customerContactNumber);
          const kitchen = await getKitchenByContactNumber(kitchenContactNumber);
          const kitchenMenuList = await getKitchenMenu(kitchen._id);
          // console.log(customer);
          // console.log(kitchen);
          console.log(kitchenMenuList);
          const str = "A";
          //Send menu here once message is recieved - //Check if its a hi/hey/hello and send the order menu
          if (!/\d/.test(message.text.body)) {
            await axios.post(
              WHATSAPP_API_URL,
              {
                messaging_product: "whatsapp",
                to: message.from,
                type: "template",
                template: {
                  name: "dynamic_kurry_kitchen",
                  language: { code: "en_US" },
                  components: [
                    {
                      type: "body", 
                      parameters: [
                        { type: "text", text: "brekafast,lunch,dinner" },
                        { type: "text", text: "brekafast,lunch,dinner" },
                        { type: "text", text: "brekafast,lunch,dinner" },
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
          } else {
            const customerContactNumber = message.from;
            const kitchenContactNumber =
              change?.value?.metadata?.display_phone_number;
            const items = message.text ? message.text.body : "No text message";
            console.log(`Message from ${customerContactNumber}: ${items}`);
            const customer = await getUserByContactNumber(
              customerContactNumber
            );
            const kitchen = await getKitchenByContactNumber(
              kitchenContactNumber
            );
            const kitchenMenuList = await getKitchenMenu(kitchen._id);
            // console.log(customer);
            // console.log(kitchen);
            console.log(kitchenMenuList);

            const bodyText = message.text.body
              .replace(/^\d+\s*/, "")
              .toLowerCase()
              .trim(); // Remove leading number and extra spaces

            const menuItem = kitchenMenuList.find((item) =>
              item.name.toLowerCase().includes(bodyText)
            );

            console.log(menuItem);

            //Place the order
            const userId = customer._id;
            const kitchenId = kitchen._id;
            const itemAmount = menuItem.price;
            const deliveryAddress = customer.address;
            const orderStatus = "pending";
            const platform = "WhatsApp";
            const totalAmount =
              +message.text.body.match(/^\d+/)?.[0] * menuItem.price;
            const orderDate = new Date();
            // Step 4: Create the Order object
            const order = new Order({
              kitchenId,
              userId,
              items,
              itemAmount,
              totalAmount,
              deliveryAddress,
              orderStatus,
              platform,
              orderDate,
            });

            // Step 5: Save the order to the database
            const data = await order.save();
          }
        }
      });
    });
  }

  res.status(200).send("Webhook received");
});

module.exports = whatsappRouter;
