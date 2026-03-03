import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "./authService";

const initialState = {
  user: null,
  isAuthenticated: false,
  type: "",
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

export const login = createAsyncThunk("auth/login", async (data, thunkAPI) => {
  try {
    await authService.login(data);
    thunkAPI.dispatch(getCurrentUser());
  } catch (err) {
    const msg =
      (err.response && err.response.data && err.response.data.message) ||
      err.message ||
      err.toString();

    return thunkAPI.rejectWithValue(msg);
  }
});

export const forgotPass = createAsyncThunk(
  "auth/forgot-password",
  async (email, thunkAPI) => {
    try {
      return await authService.forgotPass(email);
    } catch (err) {
      const msg =
        (err.response && err.response.data && err.response.data.message) ||
        err.message ||
        err.toString();

      return thunkAPI.rejectWithValue(msg);
    }
  },
);

export const resetPass = createAsyncThunk(
  "auth/reset-password",
  async (data, thunkAPI) => {
    try {
      return await authService.resetPass(data);
    } catch (err) {
      const msg =
        (err.response && err.response.data && err.response.data.message) ||
        err.message ||
        err.toString();

      return thunkAPI.rejectWithValue(msg);
    }
  },
);

export const changePass = createAsyncThunk(
  "auth/change-password",
  async (data, thunkAPI) => {
    try {
      return await authService.changePass(data);
    } catch (err) {
      if (err.response.status == 401 || err.response.status == 403) {
        thunkAPI.dispatch(clearUser());
      }
      const msg =
        (err.response && err.response.data && err.response.data.message) ||
        err.message ||
        err.toString();

      return thunkAPI.rejectWithValue(msg);
    }
  },
);

export const changeEmail = createAsyncThunk(
  "auth/change-email",
  async (data, thunkAPI) => {
    try {
      return await authService.changeEmail(data);
    } catch (err) {
      if (err.response.status === 401 || err.response.status == 403) {
        thunkAPI.dispatch(clearUser());
      }
      const msg =
        (err.response && err.response.data && err.response.data.message) ||
        err.message ||
        err.toString();

      return thunkAPI.rejectWithValue(msg);
    }
  },
);

export const getCurrentUser = createAsyncThunk(
  "auth/me",
  async (arg, thunkAPI) => {
    try {
      return await authService.getCurrentUser();
    } catch (err) {
      if (err.response.status === 401 || err.response.status == 403) {
        thunkAPI.dispatch(clearUser());
      }
      const msg =
        (err.response && err.response.data && err.response.data.message) ||
        err.message ||
        err.toString();

      return thunkAPI.rejectWithValue(msg);
    }
  },
);

export const logout = createAsyncThunk("auth/logout", async () => {
  return await authService.logout();
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isError = false;
      state.isLoading = false;
      state.isSuccess = false;
      state.message = "";
      state.type = "";
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.type = action.type;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.type = action.type;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.type = action.type;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.isLoading = false;
        state.isError = true;
        state.user = null;
      })
      .addCase(changePass.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(changePass.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.type = action.type;
        state.message = "Password change successful";
      })
      .addCase(changePass.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(changeEmail.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(changeEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.type = action.type;
        state.message = "Email change successful";
      })
      .addCase(changeEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(forgotPass.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(forgotPass.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.type = action.type;
        state.message =
          "Instructions to reset your password have been sent to your email";
      })
      .addCase(forgotPass.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(resetPass.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resetPass.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.type = action.type;
        state.message = "Password reset successful";
      })
      .addCase(resetPass.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearUser } = authSlice.actions;
export default authSlice.reducer;
