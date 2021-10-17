import { Request, Response } from "express";
import { Product } from "@prisma/client";

import prisma from "../../databases/prisma/connection";
import sortIdsByFrequency from "../../utils/sortByIdsFrequency";

interface IProductWithBuyed extends Product {
  productsBuyedWith: Product[];
}

export default async function show(req: Request, res: Response) {
  const id = Number(req.params.id);
  const buyedWith = Number(req.query.buyedWith);

  try {
    const product = await prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        category: true,
        images: true,
      },
    });

    if (!product) return res.status(404).json({ message: "product not found" });

    const productWithBuyed: IProductWithBuyed = {
      ...product,
      productsBuyedWith: [],
    };

    if (buyedWith) {
      // get ordersProducts who buyed this product
      const ordersProducts = await prisma.orders_products.findMany({
        where: {
          product_id: product.id,
        },
      });

      // get order ids that have buyed this product
      const orderIds = ordersProducts.map(
        (orderProduct) => orderProduct.order_id
      );

      // get ordersProducts who buyed this product but with other products
      const ordersProductsByOrderId = await prisma.orders_products.findMany({
        where: {
          order_id: {
            in: orderIds,
          },
        },
        include: {
          product: {
            include: {
              category: true,
              images: true,
            },
          },
        },
      });

      // remove this product id
      const buyedWithProducts = ordersProductsByOrderId.filter(
        (ordersProduct) => ordersProduct.product_id != product.id
      );

      // get products ids
      const buyedWithProductsIds = buyedWithProducts.map(
        (buyedWithProduct) => buyedWithProduct.product_id
      );

      // sort by frequency
      const sortedIds = sortIdsByFrequency(buyedWithProductsIds);

      for (let i = 0; i < buyedWith; i++) {
        const [orderProduct] = ordersProductsByOrderId.filter(
          (ordersProduct) => sortedIds[i] == ordersProduct.product.id
        );

        if (orderProduct) {
          productWithBuyed.productsBuyedWith.push(orderProduct.product);
        }
      }
    }

    return res.json(productWithBuyed);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "internal error" });
  }
}
