/**
 * בדיקת חיבור ל-MongoDB Atlas
 * הרצה: npm run test:db
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { MongoClient } from "mongodb";

loadEnv({ path: resolve(process.cwd(), ".env.local") });
loadEnv({ path: resolve(process.cwd(), ".env") });

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || "task-manager";

  if (!uri) {
    console.error("❌ MONGODB_URI לא מוגדר ב-.env.local");
    process.exit(1);
  }

  // לא מדפיסים סיסמה — רק host
  const hostMatch = uri.match(/@([^/]+)/);
  console.log("מתחבר ל:", hostMatch?.[1] ?? "(לא זוהה host)");
  console.log("Database:", dbName);

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);

    await db.command({ ping: 1 });
    console.log("✅ חיבור הצליח (ping)");

    const collections = await db.listCollections().toArray();
    console.log(
      "Collections קיימים:",
      collections.length ? collections.map((c) => c.name).join(", ") : "(אין עדיין — זה תקין)"
    );

    // בדיקת כתיבה — יוצר collection אוטומטית בפעם הראשונה
    const testCol = db.collection("_connection_test");
    await testCol.insertOne({ ok: true, at: new Date() });
    await testCol.deleteMany({});
    console.log("✅ כתיבה ל-DB הצליחה");

    console.log("\nהכל מוכן. אפשר להריץ npm run dev");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("\n❌ החיבור נכשל:\n", message);

    if (message.includes("bad auth") || message.includes("Authentication failed")) {
      console.error(`
סיבה נפוצה: שם משתמש או סיסמה שגויים ב-MONGODB_URI

מה לעשות ב-Atlas:
1. Database Access → בחר משתמש → Edit → Reset Password
2. Connect → Drivers → העתק connection string חדש
3. ודא שהסיסמה ב-URI (אם יש תווים מיוחדים — צריך URL encode)
4. עדכן .env.local והרץ שוב: npm run test:db
`);
    } else if (message.includes("ENOTFOUND") || message.includes("querySrv")) {
      console.error("\nבדוק את שם ה-cluster ב-connection string.");
    } else if (
      message.includes("timed out") ||
      message.includes("Server selection")
    ) {
      console.error(`
סיבה נפוצה: Network Access חוסם את ה-IP שלך

ב-Atlas: Network Access → Add IP Address → Allow Access from Anywhere (לפיתוח)
או הוסף את ה-IP הנוכחי שלך.
`);
    }

    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
