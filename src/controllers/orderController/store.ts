import { Request, Response } from "express";
import { Prisma, Product } from "@prisma/client";

import prisma from "../../databases/prisma/connection";
import payWithCreditCard from "../../services/pagarMe/payWithCreditCard";
import payWithBoleto from "../../services/pagarMe/payWithBoleto";
import calcFinalPrice from "../../utils/calcFinalPrice";
import calcIsOnSale from "../../utils/calcIsOnSale";
import calcInstallments from "../../utils/calcInstallments";
//import socketIo from "../../websocket/socketIo";
//import { sendEmailQueue } from "../../backgroundJobs/queues";
//import buyOrderTemplate from "../../services/mailer/templates/buyOrderTemplate";
//import calcInstallments from "../../utils/calcInstallments";

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

interface IProductWithFinalPrice extends Product {
  isOnSale: boolean;
  finalPrice: string;
}

interface IBody {
  products_id: number[];
  quantity_buyed: number[];
  freight_name: string;
  freight_price: number;
  address_id: number;
  credit_card?: ICreditCard;
  boleto?: IBoleto;
}

export default async function store(req: Request, res: Response) {
  const body = req.body as IBody;
  const id = req.tokenPayload!.id;

  try {
    //await getConnection().transaction(async (transactionalEntityManager) => {
    // verify if user and his address exists
    const user = await prisma.user.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: {
        addresses: {
          where: {
            deleted_at: null,
          },
        },
      },
    });

    if (user == null)
      return res.status(400).json({ message: "user not found" });

    const addresses = user.addresses?.filter(
      (address) => address.id == body.address_id
    );

    if (addresses == null || addresses.length == 0)
      return res.status(400).json({ message: "address not found" });

    // verify if all products exists and have enough stock
    const products: IProductWithFinalPrice[] = [];
    let errorProduct: string | undefined;

    for (let i = 0; i < body.products_id.length; i++) {
      const product = await prisma.product.findUnique({
        where: {
          id: body.products_id[i],
        },
      });

      if (product == null) {
        errorProduct = "product id " + body.products_id[i] + " not found";
        break;
      }

      if (product.quantity_stock < body.quantity_buyed[i]) {
        errorProduct =
          "product id " + body.products_id[i] + " dont have enough stock";
        break;
      }

      const productWithFinalPrice = {
        ...product,
        isOnSale: calcIsOnSale(
          product.discount_datetime_start,
          product.discount_datetime_end,
          product.discount_percent
        ),
        finalPrice: calcFinalPrice(
          Number(product.price),
          product.discount_percent
        ),
      };

      products.push(productWithFinalPrice);
    }

    if (errorProduct) return res.status(400).json({ message: errorProduct });

    // calculates total price
    let total_price = 0;
    for (let i = 0; i < products.length; i++) {
      total_price +=
        Number(products[i].finalPrice) * Number(body.quantity_buyed[i]);
    }

    // create order
    const orderPromise = prisma.order.create({
      data: {
        user_id: id,
        freight_name: body.freight_name,
        freight_price: Number(Number(body.freight_price).toFixed(2)),
        total_price,
        address_id: body.address_id,
        payment_method: req.body.credit_card ? "credit_card" : "boleto",
        orders_products: {
          create: products.map((product, i) => ({
            product_id: product.id,
            quantity_buyed: body.quantity_buyed[i],
            product_price: Number(products[i].price),
            product_discount_percent: products[i].isOnSale
              ? products[i].discount_percent
              : 0,
          })),
        },
      },
    });

    /*const order = OrderModel.create({
      user_id: id,
      freight_name: body.freight_name,
      freight_price: Number(Number(body.freight_price).toFixed(2)),
      total_price,
      address_id: body.address_id,
      payment_method: req.body.credit_card ? "credit_card" : "boleto",
    });*/

    //await transactionalEntityManager.save(order);

    if (body.credit_card) body.credit_card.items = [];
    else if (body.boleto) body.boleto.items = [];

    const productsPromises: Prisma.Prisma__ProductClient<Product>[] = [];

    // add products to order and subtract from stock
    for (let i = 0; i < products.length; i++) {
      if (body.credit_card && body.credit_card.items) {
        body.credit_card.items.push({
          id: String(products[i].id),
          title: products[i].title,
          unit_price: String(products[i].finalPrice).replace(".", ""),
          quantity: body.quantity_buyed[i],
          tangible: products[i].tangible,
        });
      } else if (body.boleto && body.boleto.items) {
        body.boleto.items.push({
          id: String(products[i].id),
          title: products[i].title,
          unit_price: String(products[i].finalPrice).replace(".", ""),
          quantity: body.quantity_buyed[i],
          tangible: products[i].tangible,
        });
      }

      /*const orderProduct = OrderProductModel.create({
        product: products[i],
        order,
        quantity_buyed: body.quantity_buyed[i],
        product_price: Number(products[i].price),
        product_discount_percent: products[i].isOnSale
          ? products[i].discount_percent
          : 0,
      });

      await transactionalEntityManager.save(orderProduct);*/

      productsPromises.push(
        prisma.product.update({
          where: {
            id: products[i].id,
          },
          data: {
            quantity_sold: products[i].quantity_sold + body.quantity_buyed[i],
            quantity_stock: products[i].quantity_stock - body.quantity_buyed[i],
          },
        })
      );

      //products[i].quantity_sold += body.quantity_buyed[i];
      //products[i].quantity_stock -= body.quantity_buyed[i];

      //await transactionalEntityManager.save(products[i]);
    }

    const [order] = await prisma.$transaction([
      orderPromise,
      ...productsPromises,
    ]);

    let pagarMeResponse;
    const reference_key = `${order.id}!${Number(order.created_at)}`;

    const productsAmount = String(total_price).replace(".", "");
    const shippingFee = String(Number(body.freight_price).toFixed(2)).replace(
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

      const response = await payWithCreditCard(body.credit_card);
      pagarMeResponse = response;

      order.status = response.status;

      ////////////////////////////////////
      // PAGAMENTO BOLETO
      ///////////////////////////////////
    } else if (body.boleto) {
      body.boleto.amount = String(Number(productsAmount) + Number(shippingFee));
      body.boleto.shipping.fee = shippingFee;

      body.boleto.reference_key = reference_key;

      const response = await payWithBoleto(body.boleto);
      pagarMeResponse = response;

      order.status = response.status;
      order.boleto_url = response.boleto_url;
    }
    ///////////////////////////////////////////////////

    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: order.status,
        boleto_url: order.boleto_url,
      },
    });

    //await transactionalEntityManager.save(order);

    /*try {
      socketIo.emitNewOrder(order);

      const template = buyOrderTemplate(
        products,
        body.quantity_buyed,
        body.freight_price,
        total_price
      );

      await sendEmailQueue.add({
        from: "donotreply@companyname.com",
        to: user.email,
        subject: "E-Commerce - Confirmação de compra",
        template,
      });
    } catch (error) {
      console.log(error);
    }*/

    return res.status(201).json({
      order: { id: order.id, boleto_url: order.boleto_url },
      pagarme: pagarMeResponse,
    });
    //});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "internal error" });
  }
}
