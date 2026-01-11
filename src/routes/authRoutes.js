import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

router.post("/sign-up", async (req, res) => {
  try {
    const { name, surname, email, password } = req.body;
    if (!name || !surname || !email || !password) {
      return res
        .status(400)
        .json({ message: "Todos os campos são obrigatórios" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "A senha deve ter pelo menos 8 caracteres" });
    }

    if (name.length < 2 || surname.length < 2) {
      return res.status(400).json({
        message: "Nome e sobrenome devem ter pelo menos 2 caracteres",
      });
    }

    // checa se usuário já existe
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Usuário já existe" });
    }

    // gera foto de perfil
    const profilePicture = `https://api.dicebear.com/9.x/initials/svg?seed=${name}%20${surname}`;

    const user = new User({
      name,
      surname,
      email,
      password,
      profilePicture,
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Erro na rota de sign-up", error);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

router.post("/sign-in", async (req, res) => {
  res.send("sign-in");
});

export default router;
