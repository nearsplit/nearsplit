import { $fetch } from 'ohmyfetch';

const api = $fetch.create({ baseURL: 'https://api.coingecko.com/api/v3' });

type CoinPriceResponse = {
  [coin: string]: {
    [currency: string]: number;
  };
};

export const getCoinPrice = (coin, currency) => api<CoinPriceResponse>('/simple/price', { params: { ids: coin, vs_currencies: currency } });
