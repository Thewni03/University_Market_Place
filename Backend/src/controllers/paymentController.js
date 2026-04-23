import Payment from "../models/payment.js";
import PaymentModel from "../models/payment.js"; 
import { notify } from "../notifications/notification.service.js";

// VALIDATE Booking Form (Moved from frontend)
export const validateBooking = (req, res) => {
  const { fullName, email, contact, address, nic, date } = req.body;
  const errors = {};

  // Full Name validation
  const safeFullName = fullName || '';
  if (!safeFullName.trim()) {
    errors.fullName = 'Full name is required';
  } else if (safeFullName.trim().length < 3) {
    errors.fullName = 'Full name must be at least 3 characters';
  } else if (!/^[a-zA-Z\s]+$/.test(safeFullName.trim())) {
    errors.fullName = 'Full name should only contain letters and spaces';
  }

  // Email validation
  const safeEmail = email || '';
  if (!safeEmail.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeEmail)) {
    errors.email = 'Please enter a valid email address';
  }

  // Contact number validation
  const safeContact = contact || '';
  if (!safeContact.trim()) {
    errors.contact = 'Contact number is required';
  } else if (!/^[0-9]{10,12}$/.test(safeContact.replace(/\s/g, ''))) {
    errors.contact = 'Please enter a valid phone number (10-12 digits)';
  }

  // Address validation
  const safeAddress = address || '';
  if (!safeAddress.trim()) {
    errors.address = 'Address is required';
  } else if (safeAddress.trim().length < 5) {
    errors.address = 'Address must be at least 5 characters';
  } else if (!/^[a-zA-Z\s]+$/.test(safeAddress.trim())) {
    errors.address = 'Address should only contain letters and spaces';
  }

  // NIC validation
  const safeNic = nic || '';
  if (!safeNic.trim()) {
    errors.nic = 'NIC number is required';
  } else if (!/^[0-9]{10}$/.test(safeNic.trim())) {
    errors.nic = 'NIC number must be exactly 10 digits';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  return res.status(200).json({ success: true });
};

// CREATE Payment
export const createPayment = async (req, res) => {
  try {
    const {
      bookingId,
      customerName,
      customerEmail,
      serviceName,
      amount,
      paymentMethod,
      cardLast4,
      cardNumber,
      name,
      expiry,
      cvv,
      sellerId, // Destructured for notification
      userId    // Destructured for notification
    } = req.body;

    const errors = {};

    // 1. Check required fields
    if (!bookingId) errors.general = "Booking ID is missing.";
    if (!customerEmail) errors.general = "Customer email is missing.";
    if (!serviceName) errors.general = "Service name is missing.";
    if (amount === undefined) errors.general = "Amount is missing.";

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (customerEmail && !emailRegex.test(customerEmail)) {
      errors.general = "Invalid email format.";
    }

    // 3. Validate amount
    if (amount !== undefined && (typeof amount !== 'number' || isNaN(amount) || amount < 0)) {
      errors.general = "Amount must be a valid positive number.";
    }

    // 4. Validate payment method specifics
    if (paymentMethod === "Credit Card") {
      const cleanCardNumber = cardNumber ? cardNumber.replace(/\s/g, '') : '';
      if (!cleanCardNumber || cleanCardNumber.length !== 16) {
        errors.cardNumber = 'Credit card number is required';
      } else if (!/^\d+$/.test(cleanCardNumber)) {
        errors.cardNumber = 'Credit card number must contain only digits';
      }

      if (!name || name.trim() === '') {
        errors.name = 'Cardholder name is required';
      } else if (!/^[A-Za-z\s]+$/.test(name)) {
        errors.name = 'Cardholder name must contain only letters';
      }

      const expiryClean = expiry ? expiry.trim() : '';
      if (!expiryClean || !/^\d{2}\/\d{2}$/.test(expiryClean)) {
        errors.expiry = 'Expiration date is required';
      }

      const cvvClean = cvv ? cvv.trim() : '';
      if (!cvvClean || cvvClean.length !== 3) {
        errors.cvv = 'CVV is required';
      } else if (!/^\d{3}$/.test(cvvClean)) {
        errors.cvv = 'CVV must contain only digits';
      }

      if (!errors.cardNumber && (!cardLast4 || cardLast4.length !== 4)) {
        errors.cardNumber = "Invalid short card details provided internally.";
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: "Validation failed", errors });
    }

    // 5. Create and save payment
    const payment = new PaymentModel(req.body);
    const savedPayment = await payment.save();

    // --- ADDED NOTIFICATION PARTS ---
    if (sellerId) {
      await notify({
        userId: sellerId,
        type: 'payment_received',
        title: 'Payment Received!',
        body: `You received a payment of LKR ${amount} for ${serviceName}.`,
        metadata: { bookingId, paymentId: savedPayment._id }
      });
    }

    const buyerId = userId || req.user?._id; 
    if (buyerId) {
      await notify({
        userId: buyerId,
        type: 'payment_success',
        title: 'Payment Successful',
        body: `Your payment of LKR ${amount} for ${serviceName} was successful.`,
        metadata: { bookingId, paymentId: savedPayment._id }
      });
    }
    // --------------------------------

    res.status(201).json({ success: true, data: savedPayment });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Payment for this booking ID already exists." });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET All Payments
export const getAllPayments = async (req, res) => {
  try {
    const payments = await PaymentModel.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET Payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const payment = await PaymentModel.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET Payments by User ID
export const getUserPayments = async (req, res) => {
  try {
    const payments = await PaymentModel.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE Payment
export const updatePayment = async (req, res) => {
  try {
    const payment = await PaymentModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE Payment
export const deletePayment = async (req, res) => {
  try {
    const payment = await PaymentModel.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }
    res.status(200).json({ success: true, message: "Payment successfully deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
