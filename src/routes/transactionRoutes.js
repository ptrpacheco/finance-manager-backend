import express from "express";
import Transaction from "../models/Transaction.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

// cria uma nova transação
router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, amount, type, category } = req.body;
    if (!title || !amount || !type || !category)
      return res
        .status(400)
        .json({ message: "Todos os campos são obrigatórios" });

    // salva no banco de dados
    const newTransaction = new Transaction({
      title,
      amount,
      type,
      category,
      user: req.user._id,
    });

    await newTransaction.save();

    res.status(201).json(newTransaction);
  } catch (error) {
    console.log("Erro ao criar transação:", error);
    res.status(500).json({ message: error.message });
  }
});

// lista todas as transações de um usuário
router.get("/", protectRoute, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 }) // decrescente
      .skip(skip)
      .limit(limit);

    const totalTransactions = await Transaction.countDocuments({
      user: req.user._id,
    });

    res.send({
      transactions,
      currentPage: page,
      totalTransactions,
      totalPages: Math.ceil(totalTransactions / limit),
    });
  } catch (error) {
    console.log("Erro ao listar transações:", error);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

// pega uma transação específica pelo ID
router.get("/:id", protectRoute, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transação não encontrada" });
    }

    // verifica se a transação pertence ao usuário autenticado
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    res.json(transaction);
  } catch (error) {
    console.log("Erro ao buscar transação:", error);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

// edita uma transação específica pelo ID
router.put("/:id", protectRoute, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction)
      return res.status(404).json({ message: "Transação não encontrada" });

    // verifica se a transação pertence ao usuário autenticado
    if (transaction.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Acesso negado" });

    const { title, amount, type, category } = req.body;

    if (!title || !amount || !type || !category)
      return res
        .status(400)
        .json({ message: "Todos os campos são obrigatórios" });
    
    transaction.title = title;
    transaction.amount = amount;
    transaction.type = type;
    transaction.category = category;
    
    await transaction.save();
    res.json(transaction);
  } catch (error) {}
});

// deleta uma transação específica pelo ID
router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction)
      return res.status(404).json({ message: "Transação não encontrada" });

    // verifica se a transação pertence ao usuário autenticado
    if (transaction.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Acesso negado" });

    await transaction.deleteOne();
    res.json({ message: "Transação deletada com sucesso" });
  } catch (error) {
    console.log("Erro ao deletar transação:", error);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

export default router;
