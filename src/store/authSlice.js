import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { auth } from "../firebase/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

// Load persisted state from localStorage
const loadAuthState = () => {
  try {
    const serializedState = localStorage.getItem("authState");
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async ({ email, password }, thunkAPI) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("signup done, user signed up");
      // After successful signup, automatically log in
      return userCredential.user;
    } catch (error) {
      // Convert Firebase error codes to user-friendly messages
      let errorMessage;
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage =
            "This email is already registered. Please login instead.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "Email/password accounts are not enabled";
          break;
        case "auth/weak-password":
          errorMessage =
            "Password is too weak. It must be at least 6 characters";
          break;
        default:
          errorMessage = error.message;
      }
      console.error("Signup error:", error);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, thunkAPI) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("signin done, user signed in");
      return userCredential.user;
    } catch (error) {
      // Convert Firebase error codes to user-friendly messages
      let errorMessage;
      switch (error.code) {
        case "auth/invalid-credential":
          errorMessage =
            "Invalid email or password. Please check your credentials and try again.";
          break;
        case "auth/user-not-found":
          errorMessage =
            "No account found with this email. Please register first.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password. Please try again.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address format";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later";
          break;
        default:
          errorMessage = error.message;
      }
      console.error("Login error:", error);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, thunkAPI) => {
    try {
      await signOut(auth);
      console.log("logout done");
      // Clear persisted state on logout
      localStorage.removeItem("authState");
      return null;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const initialState = loadAuthState() || {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
