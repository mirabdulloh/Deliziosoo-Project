import express from "express";
import makeUploader from "./libs/utils/uploader";
import memberController from "./controllers/member.controller";
import reservationController from "./controllers/reservation.controller";
import restaurantController from "./controllers/restaurant.controller";
import orderController from "./controllers/order.controller";
import OpenAI from "openai";

const router = express.Router();

router.post("/member/signup", memberController.signUp);

router.post("/member/login", memberController.login);

router.post(
  "/member/create/reservation",
  memberController.verifyAuth,
  reservationController.createReservation
);

//! ORders SPA

router.post(
  "/order/create",
  memberController.verifyAuth,
  orderController.createOrder
);

router.get(
  "/order/all",
  memberController.verifyAuth,
  orderController.getMyOrders
);

router.post(
  "/order/update",
  memberController.verifyAuth,
  orderController.updateOrder
);



const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ================= AI CHAT =================
router.post("/ai/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "message required" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful restaurant assistant." },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0].message.content;

    res.json({ reply });
  } catch (err) {
    console.error("AI error:", err);
    res.status(500).json({ error: "AI failed" });
  }
});


const provider = process.env.AI_PROVIDER || "groq";

const baseURL =
  provider === "groq"
    ? "https://api.groq.com/openai/v1"
    : "https://api.openai.com/v1";

const apiKey =
  provider === "groq"
    ? process.env.GROQ_API_KEY
    : process.env.OPENAI_API_KEY;

const ai = new OpenAI({ apiKey, baseURL });

router.post("/ai/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "message required" });

    const completion = await ai.chat.completions.create({
      model: "llama3-8b-8192", // good cheap/free Groq model (or pick from /models)
      messages: [
        { role: "system", content: "You are a helpful restaurant assistant." },
        { role: "user", content: message },
      ],
      max_tokens: 300,
    });

    const reply = completion.choices?.[0]?.message?.content ?? "";
    res.json({ reply });
  } catch (e: any) {
    console.error("AI error:", e);
    res.status(500).json({ error: e?.message || "AI failed" });
  }
});


export default router;
