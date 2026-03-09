import { Client, Databases, Query } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers["x-appwrite-key"] ?? "");

  const databases = new Databases(client);

  const databaseId = process.env.APPWRITE_DATABASE_ID;
  const payload = req.body;

  try {
    if (req.headers["x-appwrite-event"] == `users.${payload.$id}.create`) {
      await databases.createDocument({
        databaseId: databaseId,
        collectionId: "users",
        documentId: payload.$id,
        data: {
          name: payload.name,
          email: payload.email,
          avatar: "public/avatar",
        },
      });
    }

    log(`Profile created for user: ${req.headers["x-appwrite-event"]}`);
    return res.send("Profile created");
  } catch (err) {
    error("Failed to create: " + err.message);
    return res.send("Failed to create profile", 500);
  }
};
