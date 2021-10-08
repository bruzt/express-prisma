import prisma from "../../databases/prisma/connection";
import pagarMeClient from "./client";

let timeoutId: NodeJS.Timeout;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function periodicCheck() {
  try {
    const orders = await prisma.order.findMany({
      where: {
        OR: [{ status: "processing" }, { status: "waiting_payment" }],
      },
    });

    let client;
    if (orders.length > 0 && client == null) client = await pagarMeClient();

    for (const order of orders) {
      const reference_key = `${order.id}!${Number(order.created_at)}`;
      const response = await client.transactions.find({ reference_key });

      if (response.length > 0) {
        await prisma.order.update({
          where: {
            id: order.id,
          },
          data: {
            status: response[0].status,
          },
        });
      }
    }

    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      periodicCheck();
    }, 21600000); // executa a cada 6 horas
  } catch (error) {
    if (
      error instanceof Error &&
      error.message == 'Connection "default" was not found.'
    ) {
      await sleep(1000);
      periodicCheck();
    } else {
      console.error(error);
      await sleep(60000);
      periodicCheck();
    }
  }
}
