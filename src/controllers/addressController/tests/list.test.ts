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

  it("should show all address of a user", async () => {
    const user = await prisma.user.create({
      data: fakeUser,
    });

    const token = jwt.sign(
      { id: user.id, admin: user.admin },
      String(process.env.APP_SECRET),
      { expiresIn: "12h" }
    );

    for (let i = 0; i < 3; i++) {
      await prisma.addresses.create({
        data: {
          ...fakeAddress,
          user_id: user.id,
        },
      });
    }

    const response = await supertest(app)
      .get(`/addresses`)
      .set("authorization", "Bearer " + token);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(3);
    expect(response.body[0].user_id).toBe(user.id);
  });

  it('should return error for "authorization is required"', async () => {
    const response = await supertest(app).get(`/addresses`);

    expect(response.status).toBe(401);
    expect(response.body.message[0]).toBe('"authorization" is required');
  });
});
