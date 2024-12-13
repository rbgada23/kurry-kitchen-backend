const express = require("express");
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");
const Kitchen = require("../models/kitchen");
const Order = require("../models/order");
const axios = require("axios");


const whatsappRouter = express.Router();

const VERIFY_TOKEN = "akash";

const WHATSAPP_API_URL = "https://graph.facebook.com/v21.0/436514232886145/messages";
const ACCESS_TOKEN = "EAARkrOqqAowBO3wEdwUDZCmjNDNtBn2zeNBhFVS7D3JQGYBtEDZBnKZASKwaEQ0VeksHaZCPsb3ZAx8rA7gI3pbwAh2uZAjnNxVIX7SosFFyJvRYIxAJFYVi0j0HcJVVYYaryTlEbxZBnACwgnmqJKI7ZCNeLhlJyYGVv6yjF3zrBWILJP1cLu0ZAYTKEw2UBstoZBOdeES5pqMfWZCpXZAeseEGiEfRV4pfwSwGyLM8PGFggLYZD";


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

          //Send menu here once message is recieved - //Check if its a hi/hey/hello and send the order menu
          if (!(/\d/.test(message.text.body))) {
            await axios.post(
              WHATSAPP_API_URL,
              {
                messaging_product: "whatsapp",
                to: message.from,
                type: "template",
                template: {
                  name: "kurry_kitchen",
                  language: { code: "en_US" },
                },
              },
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${ACCESS_TOKEN}`,
                },
              }
            );
          }else{
            const customerContactNumber = message.from;
            const kitchenContactNumber =
              change?.value?.metadata?.display_phone_number;
            const items = message.text ? message.text.body : "No text message";
            console.log(`Message from ${customerContactNumber}: ${items}`);
            const customer = await getUserByContactNumber(customerContactNumber);
            const kitchen = await getKitchenByContactNumber(kitchenContactNumber);
            console.log(customer);
            //Place the order
            const userId = customer._id;
            const kitchenId = kitchen._id;
            const itemAmount = 10;
            const deliveryAddress = "123 Main St";
            const orderStatus = "pending";
            const platform = "WhatsApp";
            const totalAmount = 10.0;
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
  
            console.log(kitchen);
          }
         
        }
      });
    }); 
  }

  res.status(200).send("Webhook received");
});

module.exports = whatsappRouter;
