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

  it("should add a address to an user", async () => {
    const user = await prisma.user.create({
      data: fakeUser,
    });

    const token = jwt.sign(
      { id: user.id, admin: user.admin },
      String(process.env.APP_SECRET),
      { expiresIn: "12h" }
    );

    const response = await supertest(app)
      .post(`/addresses`)
      .set("authorization", "Bearer " + token)
      .send(fakeAddress);

    expect(response.status).toBe(201);
    expect(parseInt(response.body.user_id)).toBe(user.id);
  });

  it('should return error for "authorization is required"', async () => {
    const response = await supertest(app).post(`/addresses`).send(fakeAddress);

    expect(response.status).toBe(401);
    expect(response.body.message[0]).toBe('"authorization" is required');
  });

  it('should return error for "user not found"', async () => {
    const token = jwt.sign(
      { id: 1, admin: false },
      String(process.env.APP_SECRET),
      { expiresIn: "12h" }
    );

    const response = await supertest(app)
      .post(`/addresses`)
      .set("authorization", "Bearer " + token)
      .send(fakeAddress);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("user not found");
  });
});
