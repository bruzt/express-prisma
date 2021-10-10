export default function calcIsOnSale(
  discountDatetimeStart: Date | null,
  discountDatetimeEnd: Date | null,
  discountPercent: number
) {
  let isOnSale = false;

  if (
    discountDatetimeStart != null &&
    discountDatetimeEnd != null &&
    discountPercent > 0
  ) {
    const dateNow = new Date();
    const startDate = new Date(discountDatetimeStart);
    const endDate = new Date(discountDatetimeEnd);

    if (startDate < dateNow && endDate > dateNow) {
      isOnSale = true;
    }
  }

  return isOnSale;
}
