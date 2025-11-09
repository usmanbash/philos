/**
 * Formats the given price in cents into a currency string.
 *
 * @param {number} priceInCents - The price in cents to be formatted.
 * @param {string} currencyCode - The currency code to format the price in.
 * @returns {string} The formatted currency string.
 */

const currencies = {
  USD: '$',
  EUR: '€',
};

const formatMoney = (priceInCents, currencyCode) => {
  if (!currencyCode) {
    currencyCode = window?.Shopify?.APP?.currency || window?.Shopify?.currency?.active || 'EUR';
  }

  const currencySymbol = currencyCode in currencies ? currencies[currencyCode] : null;

  if (!isNaN(priceInCents)) {
    priceInCents = Number(priceInCents);
  }

  // get amount
  const amount = (priceInCents / 100).toFixed(0);

  currencies;

  // return `${amount} ${currencyCode}`
  return `${currencySymbol}${amount}`;
};

export default formatMoney;
