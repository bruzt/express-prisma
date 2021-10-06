import supertest from "supertest";
import jwt from "jsonwebtoken";

import prisma from "../../../databases/prisma/connection";
import redisConnection from "../../../databases/redis/connection";
import { cleanupDatabase } from "../../../testUtils/truncatePrisma";
import app from "../../../app";
import { fakeUser } from "../../../testUtils/fakeData";

describe("userController List Test Suit", () => {
  beforeAll(() => {
    return prisma;
  });

  beforeEach(async () => {
    await redisConnection.redisClient.flushall();
    return cleanupDatabase();
  });

  afterAll(async () => {
    redisConnection.redisClient.disconnect();

    return prisma.$disconnect();
  });

  it("should erase a user from db", async () => {
    const user = await prisma.user.create({
      data: fakeUser,
    });

    const token = jwt.sign(
      { id: user.id, admin: user.admin },
      String(process.env.APP_SECRET),
      { expiresIn: "12h" }
    );

    const response = await supertest(app)
      .delete("/users")
      .set("authorization", "Bearer " + token);

    expect(response.status).toBe(204);
  });

  it('should return error for "user not found"', async () => {
    const token = jwt.sign(
      { id: 1, admin: false },
      String(process.env.APP_SECRET),
      { expiresIn: "12h" }
    );

    const response = await supertest(app)
      .delete("/users")
      .set("authorization", "Bearer " + token);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("User not found");
  });
});
