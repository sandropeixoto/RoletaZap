export interface Prize {
  id: string;
  label: string;
  weight: number;
  coupon: string;
}

export const PRIZES: Prize[] = [
  { id: '1', label: 'Café Expresso Grátis', weight: 30, coupon: 'CAFEFREE' },
  { id: '2', label: '10% de Desconto', weight: 40, coupon: 'CAFEOFF10' },
  { id: '3', label: 'Pão de Queijo Grátis', weight: 15, coupon: 'PAOFREE' },
  { id: '4', label: '20% de Desconto', weight: 10, coupon: 'CAFEOFF20' },
  { id: '5', label: 'Compre 1 Leve 2', weight: 5, coupon: 'BOGO' },
];

export const getRandomPrize = (): Prize => {
  const totalWeight = PRIZES.reduce((sum, p) => sum + p.weight, 0);
  let random = Math.random() * totalWeight;

  for (const prize of PRIZES) {
    if (random < prize.weight) return prize;
    random -= prize.weight;
  }

  return PRIZES[0];
};