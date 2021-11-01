import { Request, response, Response } from "express";
import prisma from "../../databases/prisma/connection";

import calcFinalPrice from "../../utils/calcFinalPrice";
import calcInstallments from "../../utils/calcInstallments";
import payWithCreditCard from "../../services/pagarMe/payWithCreditCard";
import payWithBoleto from "../../services/pagarMe/payWithBoleto";

interface ICustomer {
  external_id: string;
  name: string;
  email: string;
  type: string;
  country: string;
  phone_numbers: string[];
  documents: Array<{
    type: string;
    number: string;
  }>;
}

interface IShipping {
  name: string;
  fee?: string;
  address: {
    street: string;
    street_number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
  };
}

interface IItems {
  id: string;
  title: string;
  unit_price: string;
  quantity: number;
  tangible: boolean;
}

export interface ICreditCard {
  installments: number;
  card_number: string;
  card_cvv: string;
  card_expiration_date: string;
  card_holder_name: string;
  amount?: string;
  reference_key?: string;
  customer: ICustomer;
  billing: {
    name: string;
    address: {
      street: string;
      street_number: string;
      neighborhood: string;
      city: string;
      state: string;
      zipcode: string;
      country: string;
    };
  };
  shipping: IShipping;
  items?: IItems[];
}

export interface IBoleto {
  amount?: string;
  reference_key?: string;
  customer: ICustomer;
  shipping: IShipping;
  items?: IItems[];
}

interface IBody {
  credit_card?: ICreditCard;
  boleto?: IBoleto;
}

/*interface IPagarMeError {
  response?: {
    errors?: {
      type: string;
      parameter_name: string;
      message: string;
    }[];
  };
}*/

export default async function store(req: Request, res: Response) {
  const body = req.body as IBody;
  const order_id = Number(req.params.id);
  const userId = req.tokenPayload!.id;

  try {
    if (body.credit_card) body.credit_card.items = [];
    else if (body.boleto) body.boleto.items = [];

    const order = await prisma.order.findUnique({
      where: {
        id: order_id,
      },
      include: {
        orders_products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (order == null)
      return res.status(400).json({ message: "Order not found" });
    if (order.user_id != userId)
      return res.status(400).json({ message: "Invalid Order" });

    const products = order.orders_products.map((orderProduct) => {
      return {
        ...orderProduct.product,
        finalPrice: calcFinalPrice(
          Number(orderProduct.product_price),
          orderProduct.product_discount_percent
        ),
        quantity_buyed: orderProduct.quantity_buyed,
      };
    });

    // add products to payment method items
    for (let i = 0; i < products.length; i++) {
      if (body.credit_card && body.credit_card.items) {
        body.credit_card.items.push({
          id: String(products[i].id),
          title: products[i].title,
          unit_price: String(products[i].finalPrice).replace(".", ""),
          quantity: products[i].quantity_buyed,
          tangible: products[i].tangible,
        });
      } else if (body.boleto && body.boleto.items) {
        body.boleto.items.push({
          id: String(products[i].id),
          title: products[i].title,
          unit_price: String(products[i].finalPrice).replace(".", ""),
          quantity: products[i].quantity_buyed,
          tangible: products[i].tangible,
        });
      }
    }

    let totalPrice = 0;
    products.forEach(
      (product) => (totalPrice += Number(product.finalPrice.replace(",", ".")))
    );

    let pagarMeResponse;
    const reference_key = `${order_id}!${Number(order.created_at)}`;

    const productsAmount = String(totalPrice).replace(".", "");
    const shippingFee = String(Number(order.freight_price).toFixed(2)).replace(
      ".",
      ""
    );

    ////////////////////////////////////
    // PAGAMENTO CARTAO CREDITO
    ///////////////////////////////////
    if (body.credit_card) {
      let amount = String(Number(productsAmount) + Number(shippingFee));

      // apply interest rate to total price
      if (
        body.credit_card.installments > Number(process.env.FREE_INSTALLMENTS)
      ) {
        const installmentsOptions = calcInstallments(
          parseFloat(String(amount) + "e-2")
        ); // parseFloat(string + 'e-2') adds . of cents
        amount = (
          Number(
            installmentsOptions.installments[body.credit_card.installments - 1]
          ) * Number(body.credit_card.installments)
        )
          .toFixed(2)
          .replace(".", "");
      }

      body.credit_card.amount = amount;
      body.credit_card.shipping.fee = shippingFee;

      body.credit_card.reference_key = reference_key;

      pagarMeResponse = await payWithCreditCard(body.credit_card);

      order.status = pagarMeResponse.status;

      ////////////////////////////////////
      // PAGAMENTO BOLETO
      ///////////////////////////////////
    } else if (body.boleto) {
      body.boleto.amount = String(Number(productsAmount) + Number(shippingFee));
      body.boleto.shipping.fee = shippingFee;

      body.boleto.reference_key = reference_key;

      pagarMeResponse = await payWithBoleto(body.boleto);

      order.status = pagarMeResponse.status;
      order.boleto_url = pagarMeResponse.boleto_url;
    }
    ///////////////////////////////////////////////////

    const updatedOrder = await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: order.status,
        boleto_url: order.boleto_url,
      },
    });

    return res.json({ order: updatedOrder, pagarMeResponse });
  } catch (error) {
    if (error?.response?.errors[0]?.message) {
      return res
        .status(400)
        .json({ message: error.response.errors[0].message });
    }

    if (error instanceof Error) {
      console.log(error.message);
    }
    //console.log(error);
    return res.status(500).json({ message: "Error paying order" });
  }
}
