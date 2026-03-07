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
  });

  return res;
};

export const searchLeaveBalance = async (data) => {
  console.log(data);
  const res = await tablesDB.listRows({
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    tableId: "leavebalances",
    queries: [
      Query.equal("employeeId", data.userId),
      Query.equal("leaveType", data.leaveType),
    ],
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

  return res;
};

export const submitLeaveApplication = async (data) => {
  const res = await tablesDB.createRow({
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    tableId: "leaveapplications",
    rowId: ID.unique(),
    data,
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

  const rowsRes = await tablesDB.listRows({
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    tableId: "leavebalances",
    queries: [
      Query.equal("employeeId", res.employeeId), // Specify which rows to update
      Query.equal("leaveType", res.leaveType),
    ],
  });
  for (let row of rowsRes.rows) {
    await tablesDB.updateRow({
      databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
      tableId: "leavebalances",
      rowId: row.$id,
      data: {
        balanceDays: row.balanceDays - data.applyDays,
        usedDays: data.applyDays,
      },
    });
  }

  return res;
};
