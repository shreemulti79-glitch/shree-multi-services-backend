const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


/* =========================
   HOME
========================= */

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Shree Multi Services Backend is running"
    });
});


/* =========================
   CREATE ORDER
========================= */

app.post("/create-order", async (req, res) => {

    try {

        const amount = Number(req.body.amount);

        if (!amount || amount < 10) {
            return res.status(400).json({
                success: false,
                message: "Minimum amount is ₹10"
            });
        }

        const options = {
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: "SMS_" + Date.now()
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            order
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to create order"
        });

    }

});


/* =========================
   VERIFY PAYMENT
========================= */

app.post("/verify-payment", (req, res) => {

    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const body =
            razorpay_order_id +
            "|" +
            razorpay_payment_id;

        const expectedSignature =
            crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(body)
            .digest("hex");

        if (expectedSignature === razorpay_signature) {

            return res.json({
                success: true,
                message: "Payment verified successfully",
                payment_id: razorpay_payment_id,
                order_id: razorpay_order_id
            });

        }

        return res.status(400).json({
            success: false,
            message: "Payment verification failed"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Verification error"
        });

    }

});


/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(
        `Shree Multi Services Backend running on port ${PORT}`
    );

});
