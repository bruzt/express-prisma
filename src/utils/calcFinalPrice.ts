export default function calcFinalPrice(price: number, discountPercent: number) {
  const finalPrice =
    discountPercent != 0
      ? (price - price * (discountPercent / 100)).toFixed(2)
      : Number(price).toFixed(2);

  return finalPrice;
}
