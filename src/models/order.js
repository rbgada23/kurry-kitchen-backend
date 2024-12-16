const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
  kitchenId: {
    type: Schema.Types.ObjectId,
    ref: 'Kitchen',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items :{
   type: mongoose.Schema.Types.Mixed
  },
  // items: [
  //   {
  //     menuItemId: { type: Schema.Types.ObjectId, ref: 'KitchenMenu', required: true },
  //     quantity: { type: Number, required: true, min: 1 },
  //     price: { type: Schema.Types.Decimal128, required: true },
  //   },
  // ],
  totalAmount: {
    type: Schema.Types.Decimal128,
    required: true,
    min: 0,
  },
  deliveryAddress: {
    type: String, required: true
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered'],
    default: 'pending', 
  },
  platform: {
    type: String,
    enum: ['app', 'WhatsApp'],
    required: true,   
  },
  orderDate: {
    type: Date, 
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', orderSchema);
