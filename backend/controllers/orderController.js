import Order from '../models/order.js';

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const { 
      userId, 
      items, 
      shippingAddress, 
      paymentMethod, 
      subtotal, 
      discount, 
      shippingCost, 
      total 
    } = req.body;

    // Validate required fields
    if (!userId || !items || !shippingAddress || !paymentMethod || !total) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Create new order
    const order = new Order({
      userId,
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      discount,
      shippingCost,
      total,
      status: 'pending',
      paymentStatus: 'pending'
    });

    // Save order to database
    const savedOrder = await order.save();
    
    // Populate user and product details
    await savedOrder.populate('userId', 'name email');
    await savedOrder.populate('items.productId', 'name price image');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: savedOrder
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('userId', 'name email')
      .populate('items.productId', 'name price image');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

// Get orders by user ID
export const getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const orders = await Order.find({ userId })
      .populate('userId', 'name email')
      .populate('items.productId', 'name price image')
      .sort({ createdAt: -1 }); // Most recent first

    res.status(200).json({
      success: true,
      orders
    });

  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate('userId', 'name email')
     .populate('items.productId', 'name price image');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    if (!['pending', 'completed', 'failed', 'refunded'].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus },
      { new: true }
    ).populate('userId', 'name email')
     .populate('items.productId', 'name price image');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      order
    });

  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
};
