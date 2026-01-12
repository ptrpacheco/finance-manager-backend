import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectRoute = async (req, res, next) => {
  try {
    // pega o token
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token)
      return res.status(401).json({ message: "Sem token, autorização negada" });

    // verifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // pega o usuário do token
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "Token inválido" });

    req.user = user;
    next();
  } catch (error) {
    console.log("Erro na autenticação:", error);
    res.status(401).json({ message: "Token inválido" });
  }
};

export default protectRoute;
