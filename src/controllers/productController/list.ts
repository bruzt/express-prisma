import { Request, Response } from "express";
import { Product } from "@prisma/client";

import findCategoriesChildrenIds from "../../utils/findCategoriesChildrenIds";

import prisma from "../../databases/prisma/connection";

declare global {
  interface Array<T> {
    move: (from: number, to: number) => void;
  }
}

Array.prototype.move = function (from: number, to: number) {
  this.splice(to, 0, this.splice(from, 1)[0]);
};

interface IAnyObject {
  [key: string]: string;
}

export default async function list(req: Request, res: Response) {
  const title = req.query.title ? String(req.query.title) : undefined;
  const categoryId = req.query.category
    ? Number(req.query.category)
    : undefined;
  const section = req.query.section ? String(req.query.section) : undefined;

  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const offset = req.query.offset ? Number(req.query.offset) : undefined;

  const arrayOrder: IAnyObject[] = [
    { quantity_stock: "desc" },
    { discount_percent: "desc" },
    { quantity_sold: "desc" },
  ];

  if (req.query.filter == "lowest-price")
    arrayOrder.splice(0, 0, { price: "asc" });
  else if (req.query.filter == "biggest-price")
    arrayOrder.splice(0, 0, { price: "desc" });
  if (req.query.filter == "id") arrayOrder.splice(0, 0, { id: "desc" });

  let orderBy = arrayOrder;

  let products: Product[] = [];
  let count = 0;

  try {
    if (title) {
      // Busca por titulo

      /*const ids = await sonicSearch.searchProduct(title, limit, offset);

      if (Array.isArray(ids) && ids.length > 0) {
        // Pesquisa com relevância

        [products, count] = await ProductModel.findAndCount({
          where: {
            id: In(ids),
          },
          relations: ["category", "images"],
          order,
        });
      } else {*/
      // Pesquisa burra

      const splitedTitle = title
        .split(" ")
        .map((word) => ({ title: { contains: word, mode: "insensitive" } }));

      const countPromise = prisma.product.count({
        where: {
          OR: splitedTitle,
        },
      });

      const productsPromise = prisma.product.findMany({
        where: {
          OR: splitedTitle,
        },
        take: limit,
        skip: offset,
        orderBy,
      });

      [count, products] = await prisma.$transaction([
        countPromise,
        productsPromise,
      ]);
      //}
    } else if (categoryId) {
      // Busca por categoria

      const categories = await prisma.category.findMany();

      const serializedCategories = categories.map((category) => ({
        id: category.id,
        parent_id: category.parent_id,
      }));

      const categoriesIds = findCategoriesChildrenIds(
        categoryId,
        serializedCategories
      );

      const countPromise = prisma.product.count({
        where: {
          category_id: {
            in: categoriesIds,
          },
        },
      });

      const productPromise = prisma.product.findMany({
        where: {
          category_id: {
            in: categoriesIds,
          },
        },
        take: limit,
        skip: offset,
        orderBy,
        include: {
          category: true,
          images: true,
        },
      });

      [count, products] = await prisma.$transaction([
        countPromise,
        productPromise,
      ]);
    } else if (section) {
      // Busca por seção

      let where = undefined;

      if (section == "on-sale") {
        const dateNow = new Date();

        where = {
          AND: [
            {
              discount_datetime_start: {
                lt: dateNow,
              },
            },
            {
              discount_datetime_end: {
                gt: dateNow,
              },
            },
            {
              discount_percent: {
                gt: 0,
              },
            },
            {
              quantity_stock: {
                gt: 0,
              },
            },
          ],
        };
      } else if (section == "best-sellers") {
        arrayOrder.move(2, 0);
        orderBy = arrayOrder;

        where = {
          AND: [
            {
              quantity_sold: {
                gt: 0,
              },
            },
            {
              quantity_stock: {
                gt: 0,
              },
            },
          ],
        };
      } else if (section == "news") {
        arrayOrder.splice(0, 0, { created_at: "desc" });
        orderBy = arrayOrder;

        const date = new Date();
        date.setMonth(date.getMonth() - 1);

        where = {
          AND: [
            {
              created_at: {
                gte: date,
              },
            },
            {
              quantity_stock: {
                gt: 0,
              },
            },
          ],
        };
      }

      const countPromise = prisma.product.count({
        where,
      });

      const productsPromise = prisma.product.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy,
        include: {
          category: true,
          images: true,
        },
      });

      [count, products] = await prisma.$transaction([
        countPromise,
        productsPromise,
      ]);
    } else {
      // Busca sem filtro (where)

      const countPromise = prisma.product.count();

      const productsPromise = prisma.product.findMany({
        take: limit,
        skip: offset,
        orderBy,
        include: {
          category: true,
          images: true,
        },
      });

      [count, products] = await prisma.$transaction([
        countPromise,
        productsPromise,
      ]);
    }

    return res.json({ count, products: products });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "internal error" });
  }
}
