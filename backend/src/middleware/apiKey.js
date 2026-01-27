// API Key Validation Middleware
// All API requests must include x-api-key header

/**
 * Validates the x-api-key header against the configured API key
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  const validApiKey = process.env.API_KEY;

  // Check if API key is configured
  if (!validApiKey) {
    console.error("WARNING: API_KEY not configured in environment variables");
    return res.status(500).json({
      success: false,
      error: "Server configuration error"
    });
  }

  // Check if API key is provided in request
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: "API key is required. Include x-api-key header."
    });
  }

  // Validate API key
  if (apiKey !== validApiKey) {
    return res.status(403).json({
      success: false,
      error: "Invalid API key"
    });
  }

  next();
};

export default validateApiKey;
