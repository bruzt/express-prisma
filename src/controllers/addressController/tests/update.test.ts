import supertest from "supertest";
import jwt from "jsonwebtoken";

import prisma from "../../../databases/prisma/connection";
import redisConnection from "../../../databases/redis/connection";
//import { cleanupDatabase } from "../../../testUtils/truncatePrisma";
import app from "../../../app";
import { fakeUser, fakeAddress } from "../../../testUtils/fakeData";

describe("userController List Test Suit", () => {
  beforeAll(() => {
    return prisma;
  });

  beforeEach(async () => {
    await redisConnection.redisClient.flushall();
    //return cleanupDatabase();
    await prisma.addresses.deleteMany();
    return prisma.user.deleteMany();
  });

  afterAll(async () => {
    redisConnection.redisClient.disconnect();

    return prisma.$disconnect();
  });

  it("should update a address", async () => {
    const user = await prisma.user.create({
      data: fakeUser,
    });

    const token = jwt.sign(
      { id: user.id, admin: user.admin },
      String(process.env.APP_SECRET),
      { expiresIn: "12h" }
    );

    const address = await prisma.addresses.create({
      data: {
        ...fakeAddress,
        user_id: user.id,
      },
    });

    const response = await supertest(app)
      .put(`/addresses/${address.id}`)
      .set("authorization", "Bearer " + token)
      .send({
        street: "rua test",
        zipcode: "16516565151",
        number: "96494988958",
        neighborhood: "ggwegweg",
        city: "afafsaf asf",
        state: "faasasf sa",
      });

    expect(response.status).toBe(200);
    expect(response.body.user_id).toBe(user.id);
  });

  it('should return error for "authorization is required" - update', async () => {
    const response = await supertest(app).put(`/addresses/5`).send({
      street: "rua test",
    });

    expect(response.status).toBe(401);
    expect(response.body.message[0]).toBe('"authorization" is required');
  });

  it('should return error for "Address not found" - update', async () => {
    const user = await prisma.user.create({
      data: fakeUser,
    });

    const token = jwt.sign(
      { id: user.id, admin: user.admin },
      String(process.env.APP_SECRET),
      { expiresIn: "12h" }
    );

    const response = await supertest(app)
      .put(`/addresses/2`)
      .set("authorization", "Bearer " + token)
      .send({
        number: "55",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Address not found");
  });
});
