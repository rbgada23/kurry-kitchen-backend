const express = require("express");
const connectDB = require("../src/config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require('cors');
const socketIO = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000", // Allow requests from the client
    methods: ["GET", "POST"]
  }
});



//Lets the request convert the object it gets in body into json.
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));
const authRouter = require("./routes/auth");
const kitchenRouter = require("./routes/kitchen")
const orderRouter = require("./routes/order");
const whatsappRouter = require("./routes/whatsapp");

const order = require("./models/order");
app.use("/", authRouter);
app.use("/", kitchenRouter);
app.use("/", orderRouter);
app.use("/",whatsappRouter);

// Listen for client connections
io.on('connection', (socket) => {
  //console.log('Client connected');
  
  // Disconnect event
  socket.on('disconnect', () => {
    console.log('Client disconnected'); 
  });
});



// Watch the Order collection for changes
order.watch().on('change', (change) => {
  if (change.operationType === 'insert') {
    console.log('New order detected:', change.fullDocument);
    const newOrder = change.fullDocument;
    // Emit new order to all connected clients
    io.emit('newOrder', newOrder);
  }
});


connectDB()
  .then((e) => {
    console.log("Database connection established");
  })
  .catch(() => {
    console.log("Database cannot be connected");
  });

  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
