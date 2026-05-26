/** הודעת שגיאה בעברית ללקוח (בלי לחשוף פרטי חיבור) */
export function getMongoErrorMessage(error: unknown): string {
  const message =
    error instanceof Error ? error.message : String(error);

  if (
    message.includes("bad auth") ||
    message.includes("Authentication failed")
  ) {
    return "שגיאת התחברות ל-MongoDB Atlas — בדוק שם משתמש וסיסמה ב-.env.local";
  }

  if (
    message.includes("timed out") ||
    message.includes("Server selection") ||
    message.includes("ECONNREFUSED")
  ) {
    return "לא ניתן להתחבר ל-Atlas — בדוק Network Access (רשימת IP) בלוח הבקרה";
  }

  if (!process.env.MONGODB_URI) {
    return "MONGODB_URI לא מוגדר — הוסף ל-.env.local";
  }

  return "שגיאה בחיבור למסד הנתונים";
}
