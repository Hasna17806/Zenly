import jwt from "jsonwebtoken";
import Psychiatrist from "../models/Psychiatrist.js";

export const protectPsychiatrist = async (req, res, next) => {

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {

    try {

      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const psychiatrist = await Psychiatrist.findById(decoded.id).select("-password");

      if (!psychiatrist) {
        return res.status(401).json({ message: "Psychiatrist not found" });
      }

      /* BLOCK CHECK */

      if (psychiatrist.isBlocked) {
        return res.status(403).json({
          message: "Your account has been blocked by admin"
        });
      }

      req.psychiatrist = psychiatrist;

      next();

    } catch (error) {

      return res.status(401).json({
        message: "Token failed"
      });

    }

  } else {

    return res.status(401).json({
      message: "No token"
    });

  }

};