import { Client, Databases } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers["x-appwrite-key"] ?? "");

  const databases = new Databases(client);

  const user = req.body;

  try {
    await databases.createDocument({
      databaseId: process.env.APPWRITE_DATABASE_ID,
      collectionId: "users",
      documentId: user.$id,
      data: {
        name: user.name,
        email: user.email,
        avatar: "public/avatar",
      },
    });

    log(`Profile created for user: ${req.headers["x-appwrite-event"]}`);
    return res.send("Profile created");
  } catch (err) {
    error("Failed to create: " + err.message);
    return res.send("Failed to create profile", 500);
  }
};
