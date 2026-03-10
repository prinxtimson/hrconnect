import { account, createAuditLogs } from "../../lib/appwrite";

const getCurrentUser = async () => {
  const res = await account.get();

  return res;
};

const logout = async () => {
  await account.deleteSession({
    sessionId: "current",
  });
  createAuditLogs({
    actionType: "access",
    entityType: "Auth",
    location: "",
    details: "Logout",
    user: account.get().$id,
  });
  return;
};

const login = async (userData) => {
  const res = await account.createEmailPasswordSession(userData);
  createAuditLogs({
    actionType: "access",
    entityType: "Auth",
    location: "",
    details: "Login",
    user: res.$id,
  });
  return res;
};

const forgotPass = async (email) => {
  const res = await account.createRecovery({
    email,
    url: `${import.meta.env.VITE_APP_URL}/password/reset`,
  });
  createAuditLogs({
    actionType: "access",
    entityType: "Auth",
    location: "",
    details: "Forgot password",
    user: res.$id,
  });
  return res;
};

const resetPass = async (data) => {
  const res = await account.updateRecovery(data);
  createAuditLogs({
    actionType: "access",
    entityType: "Auth",
    location: "",
    details: "Reset password",
    user: res.$id,
  });
  return res;
};

const changePass = async (data) => {
  const res = await account.updatePassword(data);
  createAuditLogs({
    actionType: "access",
    entityType: "Auth",
    location: "",
    details: "Change Password",
    user: res.$id,
  });
  return res;
};

const changeEmail = async (data) => {
  const res = await account.updateEmail(data);
  return res;
};

const authService = {
  logout,
  login,
  forgotPass,
  resetPass,
  changePass,
  changeEmail,
  getCurrentUser,
};

export default authService;
