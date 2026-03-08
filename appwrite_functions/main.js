import { Client, Databases, Query } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers["x-appwrite-key"] ?? "");

  const databases = new Databases(client);

  const payload = req.body;

  try {
    if (req.headers["x-appwrite-event"] == `users.${payload.$id}.create`) {
      await databases.createDocument({
        databaseId: process.env.APPWRITE_DATABASE_ID,
        collectionId: "users",
        documentId: payload.$id,
        data: {
          name: payload.name,
          email: payload.email,
          avatar: "public/avatar",
        },
      });
    }

    if (req.headers["x-appwrite-event"] == ``) {
      const days = calculateDays(payload.startDate, payload.endDate);

      const leaveBalances = await databases.listDocuments({
        databaseId: process.env.APPWRITE_DATABASE_ID,
        collectionId: "leavebalances",
        queries: [
          Query.equal("user", payload.user), // Specify which rows to update
          Query.equal("leaveType", payload.leaveType),
        ],
      });

      leaveBalances.documents.forEach(async (doc) => {
        await databases.updateDocument({
          databaseId: process.env.APPWRITE_DATABASE_ID,
          collectionId: "leavebalances",
          documentId: doc.$id,
          data: {
            usedDays: doc.usedDays + days,
            balanceDays: doc.balanceDays - days,
          },
        });
      });
    }

    log(`Profile created for user: ${req.headers["x-appwrite-event"]}`);
    return res.send("Profile created");
  } catch (err) {
    error("Failed to create: " + err.message);
    return res.send("Failed to create profile", 500);
  }
};

function calculateDays(startDate, endDate) {
  let start = new Date(startDate);
  let end = new Date(endDate);
  let timeDifference = end - start;
  let daysDifference = timeDifference / (1000 * 3600 * 24);
  return daysDifference;
}
