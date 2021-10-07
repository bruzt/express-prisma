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

  it("should erase a address from a user", async () => {
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
      .delete(`/addresses/${address.id}`)
      .set("authorization", "Bearer " + token);

    expect(response.status).toBe(204);
  });

  it('should return error for "authorization is required"', async () => {
    const response = await supertest(app).delete(`/addresses/1`);

    expect(response.status).toBe(401);
    expect(response.body.message[0]).toBe('"authorization" is required');
  });

  it('should return code 400 for "address not found"', async () => {
    const user = await prisma.user.create({
      data: fakeUser,
    });

    const token = jwt.sign(
      { id: user.id, admin: user.admin },
      String(process.env.APP_SECRET),
      { expiresIn: "12h" }
    );

    const response = await supertest(app)
      .delete(`/addresses/2`)
      .set("authorization", "Bearer " + token);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("address not found");
  });
});
