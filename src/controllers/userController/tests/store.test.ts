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

  it("should add a user to db", async () => {
    const response = await supertest(app).post("/users").send(fakeUser);

    expect(response.status).toBe(201);
    expect(response.body.user.name).toBe("fake user");
  });

  it("should not add a user with same email on db", async () => {
    await prisma.user.create({
      data: fakeUser,
    });

    const response = await supertest(app).post("/users").send(fakeUser);

    expect(response.status).toBe(409);
    expect(response.body.message).toBe("email already registered");
  });

  it("should not add a user with same cpf on db", async () => {
    await prisma.user.create({
      data: fakeUser,
    });

    const response = await supertest(app)
      .post("/users")
      .send({ ...fakeUser, email: "other@email.com" });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe("cpf already registered");
  });

  it("should not add a user with invalid cpf", async () => {
    const response = await supertest(app)
      .post("/users")
      .send({ ...fakeUser, cpf: "72365148652" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("invalid cpf");
  });
});
