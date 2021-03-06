interface ICategory {
  id: number;
  parent_id: number | null;
}

export default function findCategoriesChildrenIds(
  fatherId: number,
  categories: ICategory[]
) {
  const categoriesIds: number[] = [];

  const children = categories.filter(
    (category) => category.parent_id == fatherId
  );

  children.forEach((category) => {
    categoriesIds.push(...findCategoriesChildrenIds(category.id, categories));
  });

  return [fatherId, ...categoriesIds];
}
