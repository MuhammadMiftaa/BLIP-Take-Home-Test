import * as authService from "../services/auth.js";
import logger from "../utils/logger.js";

//$ Handle login request
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    logger.debug("Processing login request", { email });

    const result = await authService.login(email, password);

    res.json(result);
  } catch (error) {
    next(error);
  }
}
