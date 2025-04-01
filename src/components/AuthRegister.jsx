import {
  Anchor,
  Button,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useState } from "react";
import { signupUser } from "../store/authSlice"; // Import register function
import { useDispatch, useSelector } from "react-redux";
import classes from "./AuthPage.module.css";
import { validateLNMIITEmail } from "../utils/validation";

export default function AuthRegister() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { loading, error: authError } = useSelector((state) => state.auth);

  const validateForm = () => {
    setError("");

    // Validate email format
    const emailValidation = validateLNMIITEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.message);
      return false;
    }

    if (!email || !password || !confirmPassword) {
      setError("All fields are required");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    return true;
  };

  const handleRegister = () => {
    setError("");
    if (validateForm()) {
      dispatch(signupUser({ email, password }));
    }
  };

  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form} radius={0} p={30}>
        <Title order={2} className={classes.title} ta="center" mt="md" mb={50}>
          Create a New Account
        </Title>

        {(error || authError) && (
          <Text c="red" ta="center" mb="sm">
            {error || authError}
          </Text>
        )}

        <form onSubmit={(e) => {
          e.preventDefault();
          handleRegister();
        }}>
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

          <PasswordInput
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            mt="md"
            size="md"
          />

          <Button type="submit" fullWidth mt="xl" size="md" loading={loading}>
            Register
          </Button>
        </form>

        <Text ta="center" mt="md">
          Already have an account?{" "}
          <Anchor href="/login" fw={700}>
            Login
          </Anchor>
        </Text>
      </Paper>
    </div>
  );
}
