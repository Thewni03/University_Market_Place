require("dotenv").config();
const { getAdminModel } = require("./models/Admin");

const SEED_EMAIL    = process.env.ADMIN_EMAIL    || "thewni2003@gmail.com";
const SEED_PASSWORD = process.env.ADMIN_PASSWORD || "Thewni@2003";
const SEED_NAME     = process.env.ADMIN_NAME     || "Super Administrator";

async function seed() {
  console.log("\n[Seed] Connecting to admin database...");
  try {
    const Admin = await getAdminModel();
    const existing = await Admin.findOne({ email: SEED_EMAIL });
    if (existing) {
      console.log(`[Seed] Super admin already exists: ${SEED_EMAIL}`);
      process.exit(0);
    }
    const admin = await Admin.create({
      email: SEED_EMAIL,
      password: SEED_PASSWORD,
      fullname: SEED_NAME,
      role: "super_admin",
      createdBy: "seed_script",
    });
    console.log("\n[Seed] Super admin created successfully!");
    console.log("────────────────────────────────────────");
    console.log(`  Email    : ${admin.email}`);
    console.log(`  Password : ${SEED_PASSWORD}`);
    console.log(`  Role     : ${admin.role}`);
    console.log("────────────────────────────────────────");
    process.exit(0);
  } catch (err) {
    console.error("[Seed] Error:", err.message);
    process.exit(1);
  }
}

seed();
