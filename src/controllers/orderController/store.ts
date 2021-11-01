import { Request, Response } from "express";
import { Prisma, Product } from "@prisma/client";

import prisma from "../../databases/prisma/connection";
import calcFinalPrice from "../../utils/calcFinalPrice";
import calcIsOnSale from "../../utils/calcIsOnSale";

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
}

export default async function store(req: Request, res: Response) {
  const body = req.body as IBody;
  const id = req.tokenPayload!.id;

  try {
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

    const productsPromises: Prisma.Prisma__ProductClient<Product>[] = [];

    for (let i = 0; i < products.length; i++) {
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
    }

    const [order] = await prisma.$transaction([
      orderPromise,
      ...productsPromises,
    ]);

    return res.status(201).json(order);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "internal error" });
  }
}
