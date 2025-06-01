
export interface Currency {
  code: string;
  symbol: string;
  name: string;
  country: string;
}

export const currencies: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', country: 'USA' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', country: 'Russia' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', country: 'India' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', country: 'China' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', country: 'Japan' },
  { code: 'EUR', symbol: '€', name: 'Euro', country: 'Europe' },
  { code: 'GBP', symbol: '£', name: 'British Pound', country: 'GBR' },
];

export const formatCurrency = (amount: number, currencyCode: string = 'USD'): string => {
  const currency = currencies.find(c => c.code === currencyCode) || currencies[0];
  return `${currency.symbol}${amount.toFixed(2)}`;
};

export const getCurrencySymbol = (currencyCode: string = 'USD'): string => {
  const currency = currencies.find(c => c.code === currencyCode) || currencies[0];
  return currency.symbol;
};

export const getCurrencyByCountry = (country: string): Currency => {
  return currencies.find(c => c.country === country) || currencies[0];
};
