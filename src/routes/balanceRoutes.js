import express from "express";
import Transaction from "../models/Transaction";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

// obtém o saldo atual do usuário
router.get("/", protectRoute, async (req, res) => {
  try {
    //pega todas as transações do usuário
    const transactions = await Transaction.find({ user: req.user._id });

    // calcula o saldo
    const balance = transactions.reduce((acc, transaction) => {
      if (transaction.type === "income") {
        return acc + transaction.amount;
      } else if (transaction.type === "expense") {
        return acc - transaction.amount;
      }
      return acc;
    }, 0);

    res.json({ balance });
  } catch (error) {
    console.log("Erro ao obter saldo:", error);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

export default router;
