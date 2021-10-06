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

  it("should update a user on db", async () => {
    const user = await prisma.user.create({
      data: fakeUser,
    });

    const token = jwt.sign(
      { id: user.id, admin: user.admin },
      String(process.env.APP_SECRET),
      { expiresIn: "12h" }
    );

    const response = await supertest(app)
      .put("/users")
      .set("authorization", "Bearer " + token)
      .send({
        name: "test",
        email: "other@test.br",
        cpf: "71314297082",
      });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("test");
  });

  it("should update the password of a user", async () => {
    const user = await prisma.user.create({
      data: {
        ...fakeUser,
        password: "123456",
      },
    });

    const token = jwt.sign(
      { id: user.id, admin: user.admin },
      String(process.env.APP_SECRET),
      { expiresIn: "12h" }
    );

    const response = await supertest(app)
      .put("/users")
      .set("authorization", "Bearer " + token)
      .send({
        currentPassword: "123456",
        newPassword: "123457",
      });

    expect(response.status).toBe(200);
  });

  it('should not update the password for "wrong current password"', async () => {
    const user = await prisma.user.create({
      data: fakeUser,
    });

    const token = jwt.sign(
      { id: user.id, admin: user.admin },
      String(process.env.APP_SECRET),
      { expiresIn: "12h" }
    );

    const response = await supertest(app)
      .put("/users")
      .set("authorization", "Bearer " + token)
      .send({
        currentPassword: "123457",
        newPassword: "123458",
      });

    expect(response.status).toBe(400);
  });

  it('should return erro for "invalid cpf"', async () => {
    const user = await prisma.user.create({
      data: fakeUser,
    });

    const token = jwt.sign(
      { id: user.id, admin: user.admin },
      String(process.env.APP_SECRET),
      { expiresIn: "12h" }
    );

    const response = await supertest(app)
      .put("/users")
      .set("authorization", "Bearer " + token)
      .send({ cpf: "96575214538" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("invalid cpf");
  });

  it('should return error for "user not found"', async () => {
    const token = jwt.sign(
      { id: 1, admin: false },
      String(process.env.APP_SECRET),
      { expiresIn: "12h" }
    );

    const response = await supertest(app)
      .put("/users")
      .set("authorization", "Bearer " + token)
      .send({
        name: "test",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("User not found");
  });
});
