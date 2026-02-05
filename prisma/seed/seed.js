import "dotenv/config";
import pg from "pg";
import { PrismaClient } from "../../generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { USER_ROLE_ADMIN, USER_ROLE_STAFF } from "../../src/utils/constant.js";
import { hashPassword } from "../../src/utils/helper.js";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const createUsers = async () => {
  const users = await prisma.user.createMany({
    data: [
      {
        email: "staff@blip.com",
        role: USER_ROLE_STAFF,
        password: await hashPassword("staff123")
      },
      {
        email: "admin@blip.com",
        role: USER_ROLE_ADMIN,
        password: await hashPassword("admin123"),
      },
    ],
  });

  console.log("Users created:", users);
};

async function main() {
  await createUsers();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
