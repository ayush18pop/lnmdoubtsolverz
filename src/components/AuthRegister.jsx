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

export default function AuthRegister() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { loading, error: authError } = useSelector((state) => state.auth);

  const validateForm = () => {
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

        <TextInput
          label="Email address"
          placeholder="hello@gmail.com"
          size="md"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <PasswordInput
          label="Password"
          placeholder="Your password"
          mt="md"
          size="md"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <PasswordInput
          label="Confirm Password"
          placeholder="Confirm your password"
          mt="md"
          size="md"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <Button 
          fullWidth 
          mt="xl" 
          size="md" 
          onClick={handleRegister}
          loading={loading}
        >
          Register
        </Button>

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
