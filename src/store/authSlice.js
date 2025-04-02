import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { auth, googleProvider } from "../firebase/firebase";
import {
  signInWithPopup,
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

// Helper function to validate LNMIIT email domain
const isLNMIITEmail = (email) => {
  return email && email.endsWith('@lnmiit.ac.in');
};

// Save auth state to localStorage
const saveAuthState = (state) => {
  try {
    const serializedState = JSON.stringify({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      error: state.error,
    });
    localStorage.setItem("authState", serializedState);
  } catch (err) {
    console.error("Could not save auth state:", err);
  }
};

export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async (_, thunkAPI) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if the email is from LNMIIT domain
      if (!isLNMIITEmail(user.email)) {
        await signOut(auth); // Sign out if not LNMIIT email
        return thunkAPI.rejectWithValue("Only LNMIIT email addresses (@lnmiit.ac.in) are allowed to login.");
      }
      
      console.log("Google sign-in successful");
      return user;
    } catch (error) {
      let errorMessage;
      
      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Login canceled. Please try again.";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Login popup was blocked. Please allow popups for this site.";
      } else {
        errorMessage = error.message;
      }
      
      console.error("Google login error:", error);
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
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
        saveAuthState(state);
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
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
