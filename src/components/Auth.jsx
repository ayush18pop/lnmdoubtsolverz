import {
  Anchor,
  Button,
  Checkbox,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { loginUser, clearError } from "../store/authSlice";
import { useDispatch, useSelector } from "react-redux";
import classes from "./AuthPage.module.css";
import { useNavigate } from "react-router-dom";
import { validateLNMIITEmail } from "../utils/validation";

export function Auth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const { loading, error: authError, isAuthenticated } = useSelector((state) => state.auth);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
      setFormError("");
    };
  }, [dispatch]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    setFormError("");
    
    // Validate email format
    const emailValidation = validateLNMIITEmail(email);
    if (!emailValidation.isValid) {
      setFormError(emailValidation.message);
      return false;
    }

    if (!email || !password) {
      setFormError("All fields are required");
      return false;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long");
      return false;
    }

    return true;
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    setFormError("");
    dispatch(clearError());
    
    if (validateForm()) {
      try {
        await dispatch(loginUser({ email, password })).unwrap();
      } catch (err) {
        console.error('Login failed:', err);
      }
    }
  };

  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form} radius={0} p={30}>
        <Title order={2} className={classes.title} ta="center" mt="md" mb={50}>
          Welcome back!
        </Title>

        {(formError || authError) && (
          <Text c="red" ta="center" mb="sm">
            {formError || authError}
          </Text>
        )}

        <form onSubmit={handleLogin}>
          <TextInput
            label="Email"
            placeholder="23ucs666@lnmiit.ac.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            size="md"
          />

          <PasswordInput
            label="Password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            mt="md"
            size="md"
          />

          <Button type="submit" fullWidth mt="xl" size="md" loading={loading}>
            Sign in
          </Button>
        </form>

        <Text ta="center" mt="md">
          Don&apos;t have an account?{" "}
          <Anchor href="/signup" fw={700}>
            Register
          </Anchor>
        </Text>
      </Paper>
    </div>
  );
}
