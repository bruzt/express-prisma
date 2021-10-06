import supertest from "supertest";
import jwt from "jsonwebtoken";

import prisma from "../../../databases/prisma/connection";
import redisConnection from "../../../databases/redis/connection";
import { cleanupDatabase } from "../../../testUtils/truncatePrisma";
import app from "../../../app";
import { fakeCpfs } from "../../../testUtils/fakeData";

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

  it("should list all users on db", async () => {
    const adminToken = jwt.sign(
      { id: 1, admin: true },
      String(process.env.APP_SECRET),
      { expiresIn: "12h" }
    );

    // save 3 users on db
    for (let i = 0; i < 3; i++) {
      await prisma.user.create({
        data: {
          name: "fulano ciclano",
          email: `email${i}@teste.com`,
          cpf: fakeCpfs[i],
          password: "123456",
        },
      });
    }

    const response = await supertest(app)
      .get("/users")
      .set("authorization", "Bearer " + adminToken);

    expect(response.status).toBe(200);
    expect(Object.keys(response.body).length).toBe(2);
    expect(response.body.count).toBe(3);
    expect(response.body.users.length).toBe(3);
  });
});
