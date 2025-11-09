/**
 * Convert Shopify money amount (decimal string/number) to cents (integer).
 *
 * @param {string|number} amount - e.g. "10.50" or 10.5
 * @returns {number} Amount in cents (integer)
 */
function moneyAmountToCents(amount) {
  // Convert to string and normalize
  let str = String(amount).replace(',', '').trim();

  // Split into whole and fractional
  let [whole, frac = ''] = str.split('.');

  // Ensure fractional part is exactly 2 digits
  if (frac.length === 0) frac = '00';
  else if (frac.length === 1) frac = frac + '0';
  else if (frac.length > 2) frac = frac.slice(0, 2); // cut off extra, no rounding

  return parseInt(whole) * 100 + parseInt(frac);
}

export default moneyAmountToCents;
