/**
 * Basic input validation utilities
 */

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password) {
  // Minimum 6 characters
  if (!password || password.length < 6) {
    return { valid: false, error: "Password must be at least 6 characters" };
  }
  return { valid: true };
}

export function validateImageBase64(imageBase64) {
  if (!imageBase64 || typeof imageBase64 !== "string") {
    return { valid: false, error: "Invalid image format" };
  }
  
  // Check if it's a valid base64 image
  const base64Regex = /^data:image\/(jpeg|jpg|png|webp);base64,/i;
  if (!base64Regex.test(imageBase64)) {
    return { valid: false, error: "Only JPEG, PNG, and WebP images are allowed" };
  }
  
  // Estimate file size (base64 is ~1.33x original size)
  const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
  const estimatedSizeInBytes = cleanBase64.length * 0.75;
  const maxSizeInBytes = 5 * 1024 * 1024; // 5MB limit
  
  if (estimatedSizeInBytes > maxSizeInBytes) {
    return { valid: false, error: "Image size must be less than 5MB" };
  }
  
  return { valid: true };
}

export function validatePhoneNumber(phone) {
  if (!phone) return { valid: true }; // Optional field
  // Basic international phone validation (allow various formats)
  const phoneRegex = /^[\+]?[0-9\s\-\(\)\.]{7,}$/;
  if (!phoneRegex.test(phone)) {
    return { valid: false, error: "Invalid phone number format" };
  }
  return { valid: true };
}

export function validateName(name) {
  if (!name || typeof name !== "string") {
    return { valid: false, error: "Invalid name" };
  }
  if (name.length > 100) {
    return { valid: false, error: "Name is too long" };
  }
  return { valid: true };
}

/**
 * Simple in-memory rate limiting (lightweight, no DB)
 * Reset on server restart - suitable for MVP
 * In production, use Redis or database
 */
const rateLimitStore = new Map();

export function checkRateLimit(key, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { attempts: 1, resetTime: now + windowMs });
    return { allowed: true };
  }
  
  const record = rateLimitStore.get(key);
  
  // Reset if window expired
  if (now > record.resetTime) {
    rateLimitStore.set(key, { attempts: 1, resetTime: now + windowMs });
    return { allowed: true };
  }
  
  // Check if limit exceeded
  if (record.attempts >= maxAttempts) {
    const resetIn = Math.ceil((record.resetTime - now) / 1000);
    return {
      allowed: false,
      error: `Too many attempts. Please try again in ${resetIn} seconds`,
      retryAfter: resetIn
    };
  }
  
  // Increment attempts
  record.attempts++;
  return { allowed: true };
}

/**
 * Clean sensitive data from logs
 */
export function sanitizeForLog(data) {
  if (!data) return data;
  
  const sanitized = { ...data };
  const sensitiveFields = ["password", "token", "secret", "apiKey", "privateKey"];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = "[REDACTED]";
    }
  });
  
  return sanitized;
}
