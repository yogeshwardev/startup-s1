import crypto from "crypto";
import Razorpay from "razorpay";
import { User } from "../models/User.js";
import { catchAsync } from "../utils/catchAsync.js";
import { ApiError } from "../utils/ApiError.js";

const PLANS = Object.freeze({
  SEMESTER: { amount: 49900, currency: "INR" },
  YEARLY: { amount: 79900, currency: "INR" },
  GRADUATION: { amount: 159900, currency: "INR" },
});

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new ApiError(503, "Payment provider is not configured.");
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

const requirePlan = (planType) => {
  const plan = PLANS[planType];
  if (!plan) {
    throw new ApiError(400, "Select a valid payment plan.");
  }
  return plan;
};

const signaturesMatch = (body, signature) => {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");
  const received = Buffer.from(signature || "", "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  return received.length === expectedBuffer.length && crypto.timingSafeEqual(received, expectedBuffer);
};

export const createOrder = catchAsync(async (req, res) => {
  const planType = req.body.planType;
  const plan = requirePlan(planType);
  const razorpay = getRazorpay();
  const order = await razorpay.orders.create({
    amount: plan.amount,
    currency: plan.currency,
    receipt: `user_${String(req.user._id).slice(-12)}_${Date.now()}`,
    notes: {
      planType,
      userId: String(req.user._id),
    },
  });

  res.status(200).json({
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
  });
});

export const verifyPayment = catchAsync(async (req, res) => {
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body;
  if (!orderId || !paymentId || !signature) {
    throw new ApiError(400, "Missing required payment fields.");
  }

  getRazorpay();
  if (!signaturesMatch(`${orderId}|${paymentId}`, signature)) {
    throw new ApiError(400, "Invalid payment signature.");
  }

  const order = await getRazorpay().orders.fetch(orderId);
  const planType = order.notes?.planType;
  const plan = requirePlan(planType);

  if (
    order.notes?.userId !== String(req.user._id) ||
    Number(order.amount) !== plan.amount ||
    order.currency !== plan.currency ||
    order.status !== "paid"
  ) {
    throw new ApiError(400, "Payment order details could not be verified.");
  }

  await User.findByIdAndUpdate(req.user._id, {
    isPaid: true,
    planType,
    paymentId,
    paymentTime: new Date(),
  });

  res.status(200).json({
    success: true,
    message: "Payment verified successfully.",
    planType,
  });
});
