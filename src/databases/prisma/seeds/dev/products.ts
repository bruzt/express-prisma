import { lorem } from "../../../../testUtils/fakeData";

export async function products() {
  const products = [];

  // Processadores AMD
  for (let i = 1; i <= 15; i++) {
    const price = String(Math.floor(Math.random() * (1500 - 500 + 1) + 500));
    const cents = "." + String(Math.floor(Math.random() * 99) + 1);

    const product = {
      title: `Processador AMD ${i}`,
      description: `Breve descrição do Processador AMD ${i}`,
      html_body: `<p>${lorem}</p>`,
      price: Number(price + cents),
      quantity_stock: 100,
      quantity_sold: 0,
      discount_percent: 0,
      category_id: 5,
      tangible: true,
      weight: Number((Math.random() * (1.5 - 0.5) + 0.5).toFixed(3)),
      length: Number((Math.random() * (30 - 10) + 10).toFixed(1)),
      height: Number((Math.random() * (30 - 10) + 10).toFixed(1)),
      width: Number((Math.random() * (30 - 10) + 10).toFixed(1)),
    };

    products.push(product);
  }

  // Processadores Intel
  for (let i = 1; i <= 15; i++) {
    const price = String(Math.floor(Math.random() * (1500 - 500 + 1) + 500));
    const cents = "." + String(Math.floor(Math.random() * 99) + 1);

    const product = {
      title: `Processador Intel ${i}`,
      description: `Breve descrição do Processador Intel ${i}`,
      html_body: `<p>${lorem}</p>`,
      price: Number(price + cents),
      quantity_stock: 100,
      quantity_sold: 0,
      discount_percent: 0,
      category_id: 6,
      tangible: true,
      weight: Number((Math.random() * (1.5 - 0.5) + 0.5).toFixed(3)),
      length: Number((Math.random() * (30 - 10) + 10).toFixed(1)),
      height: Number((Math.random() * (30 - 10) + 10).toFixed(1)),
      width: Number((Math.random() * (30 - 10) + 10).toFixed(1)),
    };

    products.push(product);
  }

  // Placas de vídeo AMD
  for (let i = 1; i <= 15; i++) {
    const price = String(Math.floor(Math.random() * (15000 - 1500 + 1) + 1500));
    const cents = "." + String(Math.floor(Math.random() * 99) + 1);

    const product = {
      title: `Placa de vídeo AMD ${i}`,
      description: `Breve descrição da Placa de vídeo AMD ${i}`,
      html_body: `<p>${lorem}</p>`,
      price: Number(price + cents),
      quantity_stock: 100,
      quantity_sold: 0,
      discount_percent: 0,
      category_id: 8,
      tangible: true,
      weight: Number((Math.random() * (2.5 - 1) + 1).toFixed(3)),
      length: Number((Math.random() * (50 - 15) + 15).toFixed(1)),
      height: Number((Math.random() * (50 - 15) + 15).toFixed(1)),
      width: Number((Math.random() * (50 - 15) + 15).toFixed(1)),
    };

    products.push(product);
  }

  // Placas de vídeo Nvidia
  for (let i = 1; i <= 15; i++) {
    const price = String(Math.floor(Math.random() * (15000 - 1500 + 1) + 1500));
    const cents = "." + String(Math.floor(Math.random() * 99) + 1);

    const product = {
      title: `Placa de vídeo Nvidia ${i}`,
      description: `Breve descrição da Placa de vídeo Nvidia ${i}`,
      html_body: `<p>${lorem}</p>`,
      price: Number(price + cents),
      quantity_stock: 100,
      quantity_sold: 0,
      discount_percent: 0,
      category_id: 9,
      tangible: true,
      weight: Number((Math.random() * (2.5 - 1) + 1).toFixed(3)),
      length: Number((Math.random() * (50 - 15) + 15).toFixed(1)),
      height: Number((Math.random() * (50 - 15) + 15).toFixed(1)),
      width: Number((Math.random() * (50 - 15) + 15).toFixed(1)),
    };

    products.push(product);
  }

  // Monitores
  for (let i = 1; i <= 15; i++) {
    const price = String(Math.floor(Math.random() * (2000 - 200 + 1) + 200));
    const cents = "." + String(Math.floor(Math.random() * 99) + 1);

    const product = {
      title: `Monitor ${i}`,
      description: `Breve descrição de Monitor ${i}`,
      html_body: `<p>${lorem}</p>`,
      price: Number(price + cents),
      quantity_stock: 100,
      quantity_sold: 0,
      discount_percent: 0,
      category_id: 3,
      tangible: true,
      weight: Number((Math.random() * (2.5 - 1) + 1).toFixed(3)),
      length: Number((Math.random() * (50 - 15) + 15).toFixed(1)),
      height: Number((Math.random() * (50 - 15) + 15).toFixed(1)),
      width: Number((Math.random() * (30 - 15) + 15).toFixed(1)),
    };

    products.push(product);
  }

  // Mouses
  for (let i = 1; i <= 15; i++) {
    const price = String(Math.floor(Math.random() * (200 - 20 + 1) + 20));
    const cents = "." + String(Math.floor(Math.random() * 99) + 1);

    const product = {
      title: `Mouse ${i}`,
      description: `Breve descrição de Mouse ${i}`,
      html_body: `<p>${lorem}</p>`,
      price: Number(price + cents),
      quantity_stock: 100,
      quantity_sold: 0,
      discount_percent: 0,
      category_id: 10,
      tangible: true,
      weight: Number((Math.random() * (0.8 - 0.1) + 0.1).toFixed(3)),
      length: Number((Math.random() * (15 - 5) + 5).toFixed(1)),
      height: Number((Math.random() * (15 - 5) + 5).toFixed(1)),
      width: Number((Math.random() * (15 - 5) + 5).toFixed(1)),
    };

    products.push(product);
  }

  // Teclados
  for (let i = 1; i <= 15; i++) {
    const price = String(Math.floor(Math.random() * (200 - 20 + 1) + 20));
    const cents = "." + String(Math.floor(Math.random() * 99) + 1);

    const product = {
      title: `Teclado ${i}`,
      description: `Breve descrição de Teclado ${i}`,
      html_body: `<p>${lorem}</p>`,
      price: Number(price + cents),
      quantity_stock: 100,
      quantity_sold: 0,
      discount_percent: 0,
      category_id: 11,
      tangible: true,
      weight: Number((Math.random() * (1 - 0.5) + 0.5).toFixed(3)),
      length: Number((Math.random() * (50 - 25) + 25).toFixed(1)),
      height: Number((Math.random() * (15 - 5) + 5).toFixed(1)),
      width: Number((Math.random() * (15 - 5) + 5).toFixed(1)),
    };

    products.push(product);
  }

  return products;
}
