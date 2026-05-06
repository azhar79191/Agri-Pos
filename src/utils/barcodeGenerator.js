/**
 * Pure JavaScript EAN-13 Barcode Generator
 * Generates SVG barcode without external dependencies
 */

/**
 * Calculate EAN-13 check digit
 * @param {string} code - 12-digit code without check digit
 * @returns {string} - Check digit (0-9)
 */
const calculateEAN13CheckDigit = (code) => {
  if (code.length !== 12) throw new Error("EAN-13 requires 12 digits before check digit");
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(code[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit.toString();
};

/**
 * Validate EAN-13 barcode
 * @param {string} code - 13-digit EAN-13 code
 * @returns {boolean}
 */
export const validateEAN13 = (code) => {
  if (!/^\d{13}$/.test(code)) return false;
  const checkDigit = calculateEAN13CheckDigit(code.slice(0, 12));
  return checkDigit === code[12];
};

/**
 * Generate a valid EAN-13 barcode from a 12-digit base
 * @param {string} base - 12-digit base code
 * @returns {string} - Complete 13-digit EAN-13 code
 */
export const generateEAN13 = (base) => {
  if (!/^\d{12}$/.test(base)) {
    throw new Error("Base must be exactly 12 digits");
  }
  const checkDigit = calculateEAN13CheckDigit(base);
  return base + checkDigit;
};

/**
 * Generate a random EAN-13 barcode
 * @param {string} prefix - Optional 3-digit prefix (default: "200" for internal use)
 * @returns {string} - Complete 13-digit EAN-13 code
 */
export const generateRandomEAN13 = (prefix = "200") => {
  // Use prefix + 9 random digits = 12 digits total
  const randomPart = Math.floor(Math.random() * 1000000000).toString().padStart(9, "0");
  const base = prefix.padStart(3, "0") + randomPart;
  return generateEAN13(base);
};

// EAN-13 encoding patterns
const L_CODES = [
  "0001101", "0011001", "0010011", "0111101", "0100011",
  "0110001", "0101111", "0111011", "0110111", "0001011"
];

const G_CODES = [
  "0100111", "0110011", "0011011", "0100001", "0011101",
  "0111001", "0000101", "0010001", "0001001", "0010111"
];

const R_CODES = [
  "1110010", "1100110", "1101100", "1000010", "1011100",
  "1001110", "1010000", "1000100", "1001000", "1110100"
];

// First digit patterns (determines L/G pattern for left side)
const FIRST_DIGIT_PATTERNS = [
  "LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG",
  "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"
];

/**
 * Generate EAN-13 barcode as SVG string
 * @param {string} code - 13-digit EAN-13 code
 * @param {object} options - Rendering options
 * @returns {string} - SVG markup
 */
export const generateEAN13SVG = (code, options = {}) => {
  const {
    width = 200,
    height = 100,
    displayValue = true,
    fontSize = 14,
    textMargin = 2,
    background = "#ffffff",
    lineColor = "#000000",
  } = options;

  if (!/^\d{13}$/.test(code)) {
    throw new Error("Invalid EAN-13 code: must be 13 digits");
  }

  if (!validateEAN13(code)) {
    throw new Error("Invalid EAN-13 code: check digit mismatch");
  }

  // Build the binary string
  const firstDigit = parseInt(code[0], 10);
  const pattern = FIRST_DIGIT_PATTERNS[firstDigit];
  
  let binary = "101"; // Start guard

  // Left side (6 digits)
  for (let i = 1; i <= 6; i++) {
    const digit = parseInt(code[i], 10);
    binary += pattern[i - 1] === "L" ? L_CODES[digit] : G_CODES[digit];
  }

  binary += "01010"; // Center guard

  // Right side (6 digits)
  for (let i = 7; i <= 12; i++) {
    const digit = parseInt(code[i], 10);
    binary += R_CODES[digit];
  }

  binary += "101"; // End guard

  // Calculate bar dimensions
  const textHeight = displayValue ? fontSize + textMargin : 0;
  const barHeight = height - textHeight;
  const barWidth = width / binary.length;

  // Generate SVG bars
  let bars = "";
  let x = 0;
  
  for (let i = 0; i < binary.length; i++) {
    if (binary[i] === "1") {
      bars += `<rect x="${x}" y="0" width="${barWidth}" height="${barHeight}" fill="${lineColor}"/>`;
    }
    x += barWidth;
  }

  // Generate text
  let text = "";
  if (displayValue) {
    const charWidth = width / 13;
    text = `
      <text x="${charWidth * 0.5}" y="${height - 2}" font-size="${fontSize - 2}" font-family="monospace" text-anchor="middle" fill="${lineColor}">${code[0]}</text>
      <text x="${charWidth * 4}" y="${height - 2}" font-size="${fontSize}" font-family="monospace" text-anchor="middle" fill="${lineColor}">${code.slice(1, 7)}</text>
      <text x="${charWidth * 9.5}" y="${height - 2}" font-size="${fontSize}" font-family="monospace" text-anchor="middle" fill="${lineColor}">${code.slice(7, 13)}</text>
    `;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="${background}"/>
      ${bars}
      ${text}
    </svg>
  `.trim();
};

/**
 * Generate barcode as data URL for use in img src
 * @param {string} code - 13-digit EAN-13 code
 * @param {object} options - Rendering options
 * @returns {string} - Data URL
 */
export const generateEAN13DataURL = (code, options = {}) => {
  const svg = generateEAN13SVG(code, options);
  const base64 = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64}`;
};
