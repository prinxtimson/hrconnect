import { Client, TablesDB, Account, ID, Query } from "appwrite";

const client = new Client();
client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID); // Replace with your project ID

export const account = new Account(client);
export const tablesDB = new TablesDB(client);

export const getAllLeaveApplication = async () => {
  const res = await tablesDB.listRows({
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    tableId: "leaveapplications",
    queries: [Query.select(["*", "user.*", "admin.*"])],
  });
  const id = (await account.get()).$id;
  createAuditLogs({
    actionType: "access",
    entityType: "Leave Applications",
    location: "",
    details: "Get all leave applications",
    user: id,
  });

  return res;
};

export const getAuditLogs = async () => {
  const res = await tablesDB.listRows({
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    tableId: "auditlogs",
    queries: [Query.select(["*", "user.name"])],
  });
  const id = (await account.get()).$id;
  createAuditLogs({
    actionType: "access",
    entityType: "Audit Logs",
    location: "",
    details: "Get all audit logs",
    user: id,
  });

  return res;
};

export const searchLeaveBalance = async (data) => {
  const res = await tablesDB.listRows({
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    tableId: "leavebalances",
    queries: [
      Query.equal("user", data.userId),
      Query.equal("leaveType", data.leaveType),
    ],
  });
  const id = (await account.get()).$id;
  createAuditLogs({
    actionType: "access",
    entityType: "Leave Balance",
    location: "",
    details: "Read leave balance",
    user: id,
  });

  return res;
};

export const createLeaveBalance = async (data) => {
  const res = await tablesDB.createRow({
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    tableId: "leavebalances",
    rowId: ID.unique(),
    data,
  });
  const id = (await account.get()).$id;
  createAuditLogs({
    actionType: "create",
    entityType: "Leave Balance",
    location: "",
    details: "Create leave balance",
    user: id,
  });

  return res;
};

export const createAuditLogs = async (data) => {
  await tablesDB.createRow({
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    tableId: "auditlogs",
    rowId: ID.unique(),
    data,
  });
};

export const submitLeaveApplication = async (data) => {
  const res = await tablesDB.createRow({
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    tableId: "leaveapplications",
    rowId: ID.unique(),
    data,
  });
  const id = (await account.get()).$id;
  createAuditLogs({
    actionType: "create",
    entityType: "Leave Applications",
    location: "",
    details: "Submit leave applications",
    user: id,
  });

  return res;
};

export const approveLeaveApplication = async (data) => {
  const res = await tablesDB.updateRow({
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    tableId: "leaveapplications",
    rowId: data.id,
    data: {
      approverId: data.adminId,
      approvalDate: data.approvalDate,
      comment: data.comment,
    },
  });
  const days = calculateDays(res.startDate, res.endDate);
  const rowsRes = await tablesDB.listRows({
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    tableId: "leavebalances",
    queries: [
      Query.equal("user", res.user), // Specify which rows to update
      Query.equal("leaveType", res.leaveType),
    ],
  });
  for (let row of rowsRes.rows) {
    await tablesDB.updateRow({
      databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
      tableId: "leavebalances",
      rowId: row.$id,
      data: {
        balanceDays: row.balanceDays - days,
        usedDays: row.usedDays + days,
      },
    });
  }
  const id = (await account.get()).$id;
  createAuditLogs({
    actionType: "update",
    entityType: "Leave Applications",
    location: "",
    details: "Update leave applications",
    user: id,
  });

  return res;
};

function calculateDays(startDate, endDate) {
  let start = new Date(startDate);
  let end = new Date(endDate);
  let timeDifference = end - start;
  let daysDifference = timeDifference / (1000 * 3600 * 24);
  return daysDifference;
}
