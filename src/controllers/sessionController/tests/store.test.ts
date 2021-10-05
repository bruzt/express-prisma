import supertest from "supertest";
import jwt from "jsonwebtoken";

import prisma from "../../../databases/prisma/connection";
import redisConnection from "../../../databases/redis/connection";
import { cleanupDatabase } from "../../../testUtils/truncatePrisma";
import app from "../../../app";
import { fakeUser } from "../../../testUtils/fakeData";

describe("sessionController Store Test Suit", () => {
  beforeAll(() => {
    return prisma;
  });

  beforeEach(async () => {
    await redisConnection.redisClient.flushall();
    return cleanupDatabase();
  });

  afterAll(async () => {
    //await sonicConnection.search.close();
    //await sonicConnection.ingest.close();

    redisConnection.redisClient.disconnect();

    return prisma.$disconnect();
  });

  it("should authenticated with valid credentials", async () => {
    const user = await prisma.user.create({
      data: {
        ...fakeUser,
        email: "test@test.com",
        password: "passtest",
      },
    });

    const response = await supertest(app).post("/session").send({
      email: "test@test.com",
      password: "passtest",
    });

    const { id } = jwt.verify(
      response.body.token,
      process.env.APP_SECRET as string
    ) as { id: number };

    expect(response.status).toBe(200);
    expect(user.id).toBe(id);
  });

  it('should return error for "one or more fields are missing in body"', async () => {
    const response = await supertest(app).post("/session").send({
      email: "test@test.com",
    });

    expect(response.status).toBe(400);
    expect(response.body.source).toBe("body");
  });

  it("should not authenticated if user not exists", async () => {
    const response = await supertest(app).post("/session").send({
      email: "test@test.com",
      password: "passtest",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("e-mail or password incorrect");
  });

  it("should not authenticated if password is incorrect", async () => {
    await prisma.user.create({
      data: {
        ...fakeUser,
        email: "test@test.com",
        password: "passtest",
      },
    });

    const response = await supertest(app).post("/session").send({
      email: "test@test.com",
      password: "testpass",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("e-mail or password incorrect");
  });
});
