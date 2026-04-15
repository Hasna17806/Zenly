import Payment from "../models/Payment.js";
import Appointment from "../models/Appointment.js";
import Psychiatrist from "../models/Psychiatrist.js";
import User from "../models/User.js";
import axios from "axios";

// PayPal API endpoints
const PAYPAL_API = process.env.NODE_ENV === "production"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

// Get PayPal access token
const getPayPalAccessToken = async () => {
  try {
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString("base64");

    const response = await axios.post(
      `${PAYPAL_API}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("PayPal access token obtained");
    return response.data.access_token;
  } catch (error) {
    console.error("Error getting PayPal token:", error.response?.data || error.message);
    throw error;
  }
};

// Create PayPal order
export const createPayPalOrder = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.user._id;

    console.log("Creating payment for appointment:", appointmentId);

    // Get appointment details
    const appointment = await Appointment.findById(appointmentId)
      .populate("psychiatristId", "name consultationFee")
      .populate("userId", "name email");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status !== "Accepted") {
      return res.status(400).json({ message: "Appointment not accepted yet" });
    }

    // Check if payment already exists
    let payment = await Payment.findOne({ appointmentId, status: "completed" });
    if (payment) {
      return res.status(400).json({ message: "Payment already completed" });
    }

    // Calculate amounts (in INR)
    const totalAmountINR = appointment.psychiatristId.consultationFee;
    const adminCommission = totalAmountINR * 0.1;
    const psychiatristAmount = totalAmountINR - adminCommission;

    // Create or update payment record (store INR amount)
    payment = await Payment.findOneAndUpdate(
      { appointmentId },
      {
        userId,
        psychiatristId: appointment.psychiatristId._id,
        amount: totalAmountINR,
        psychiatristAmount,
        adminCommission,
        status: "pending"
      },
      { upsert: true, returnDocument: 'after' }
    );

    // For testing - if no PayPal credentials, simulate payment
    if (!process.env.PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID === "your_paypal_client_id") {
      console.log("Using test mode - no PayPal credentials");
      return res.json({
        orderId: "TEST_ORDER_ID",
        approvalUrl: "#",
        paymentId: payment._id,
        testMode: true
      });
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Convert INR to USD (using dynamic conversion rate)
    // You can use an API for live rates, but for testing use fixed rate
    const exchangeRate = 83; // 1 USD = 83 INR
    const amountInUSD = (totalAmountINR / exchangeRate).toFixed(2);
    
    // Ensure minimum amount is 1 USD
    const finalAmount = Math.max(parseFloat(amountInUSD), 1).toFixed(2);

    console.log(`Amount: ₹${totalAmountINR} INR = $${finalAmount} USD`);

    const orderResponse = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: appointmentId,
            amount: {
              currency_code: "USD",
              value: finalAmount,
            },
            description: `Consultation with Dr. ${appointment.psychiatristId.name}`,
            custom_id: appointmentId,
            invoice_id: `INV-${appointmentId.slice(-8)}`
          }
        ],
        application_context: {
          brand_name: "Zenly",
          landing_page: "BILLING",
          user_action: "PAY_NOW",
          return_url: `${process.env.FRONTEND_URL}/payment-success`,
          cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
          shipping_preference: "NO_SHIPPING"
        }
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Update payment with PayPal order ID
    payment.paypalOrderId = orderResponse.data.id;
    await payment.save();

    // Find approval link
    const approvalLink = orderResponse.data.links.find(
      (link) => link.rel === "approve"
    );

    console.log("PayPal order created:", orderResponse.data.id);

    res.json({
      orderId: orderResponse.data.id,
      approvalUrl: approvalLink.href,
      paymentId: payment._id
    });

  } catch (error) {
    console.error("Error creating PayPal order:", error.response?.data || error.message);
    res.status(500).json({ 
      message: "Failed to create payment order", 
      error: error.response?.data?.message || error.message 
    });
  }
};

// Capture PayPal payment (after user approves)
export const capturePayPalOrder = async (req, res) => {
  try {
    const { orderId, paymentId } = req.body;
    
    console.log("Capturing payment for order:", orderId);
    console.log("Payment ID:", paymentId);

    // Handle test mode
    if (orderId === "TEST_ORDER_ID") {
      const payment = await Payment.findById(paymentId);
      if (payment) {
        payment.status = "completed";
        payment.paypalCaptureId = "TEST_CAPTURE_ID";
        await payment.save();
        
        await Appointment.findByIdAndUpdate(payment.appointmentId, {
          paymentStatus: "paid"
        });
      }
      return res.json({
        success: true,
        message: "Test payment completed successfully",
        payment: {
          amount: payment?.amount || 0,
          paypalCaptureId: "TEST_CAPTURE_ID",
          createdAt: new Date()
        }
      });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status === "completed") {
      return res.json({ 
        success: true, 
        message: "Payment already completed", 
        payment: {
          amount: payment.amount,
          paypalCaptureId: payment.paypalCaptureId,
          createdAt: payment.createdAt
        }
      });
    }

    const accessToken = await getPayPalAccessToken();

    // Capture the order
    const captureResponse = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const captureData = captureResponse.data;
    console.log("Capture response status:", captureData.status);

    if (captureData.status === "COMPLETED") {
      // Update payment status
      payment.status = "completed";
      payment.paypalCaptureId = captureData.purchase_units[0]?.payments?.captures[0]?.id;
      payment.paypalResponse = captureData;
      await payment.save();

      // Update appointment payment status
      await Appointment.findByIdAndUpdate(payment.appointmentId, {
        paymentStatus: "paid"
      });

      console.log("Payment captured successfully:", payment.paypalCaptureId);

      res.json({
        success: true,
        message: "Payment completed successfully",
        payment: {
          amount: payment.amount,
          paypalCaptureId: payment.paypalCaptureId,
          createdAt: payment.createdAt
        }
      });
    } else {
      payment.status = "failed";
      await payment.save();
      console.log("Payment capture failed - status:", captureData.status);
      res.status(400).json({ 
        message: "Payment capture failed", 
        status: captureData.status,
        details: captureData
      });
    }

  } catch (error) {
    console.error("Error capturing PayPal order:", error.response?.data || error.message);
    
    // Handle specific PayPal errors
    if (error.response?.data?.name === "UNPROCESSABLE_ENTITY") {
      const details = error.response.data.details?.[0];
      if (details?.issue === "INSTRUMENT_DECLINED") {
        return res.status(400).json({ 
          message: "Payment method declined. Please use a different payment method or add funds to your PayPal account.",
          issue: "INSTRUMENT_DECLINED"
        });
      }
    }
    
    res.status(500).json({ 
      message: "Failed to capture payment", 
      error: error.response?.data?.message || error.message 
    });
  }
};

// Get payment status for an appointment
export const getPaymentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user._id;

    const payment = await Payment.findOne({ appointmentId, userId });
    
    res.json({
      exists: !!payment,
      status: payment?.status || null,
      amount: payment?.amount || null,
      psychiatristAmount: payment?.psychiatristAmount || null,
      adminCommission: payment?.adminCommission || null
    });

  } catch (error) {
    console.error("Error getting payment status:", error);
    res.status(500).json({ message: "Failed to get payment status" });
  }
};

// Admin: Get all payments
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("userId", "name email")
      .populate("psychiatristId", "name email")
      .populate("appointmentId", "date time")
      .sort({ createdAt: -1 });

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalCommission = payments.reduce((sum, p) => sum + p.adminCommission, 0);
    const totalPsychiatristEarnings = payments.reduce((sum, p) => sum + p.psychiatristAmount, 0);

    res.json({
      payments,
      summary: {
        totalAmount,
        totalCommission,
        totalPsychiatristEarnings,
        totalPayments: payments.length
      }
    });

  } catch (error) {
    console.error("Error getting all payments:", error);
    res.status(500).json({ message: "Failed to get payments" });
  }
};

// Psychiatrist: Get their earnings
export const getPsychiatristEarnings = async (req, res) => {
  try {
    const psychiatristId = req.psychiatrist._id;

    const payments = await Payment.find({ 
      psychiatristId, 
      status: "completed" 
    })
      .populate("userId", "name email")
      .populate("appointmentId", "date time")
      .sort({ createdAt: -1 });

    const totalEarned = payments.reduce((sum, p) => sum + p.psychiatristAmount, 0);
    const totalCommission = payments.reduce((sum, p) => sum + p.adminCommission, 0);

    res.json({
      payments,
      summary: {
        totalEarned,
        totalCommission,
        totalPayments: payments.length
      }
    });

  } catch (error) {
    console.error("Error getting psychiatrist earnings:", error);
    res.status(500).json({ message: "Failed to get earnings" });
  }
};