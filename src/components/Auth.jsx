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
    if (!email || !password) {
      setFormError("All fields are required");
      return false;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setFormError("Please enter a valid email address");
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
        <form onSubmit={handleLogin}>
          <Title order={2} className={classes.title} ta="center" mt="md" mb={50}>
            Welcome back!
          </Title>

          {(formError || authError) && (
            <Text c="red" ta="center" mb="md">
              {formError || authError}
            </Text>
          )}

          <TextInput
            label="Email address"
            placeholder="hello@gmail.com"
            size="md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            error={formError && !email ? "Email is required" : null}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            mt="md"
            size="md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            error={formError && !password ? "Password is required" : null}
          />
          {/* {/* <Checkbox label="Keep me logged in" mt="xl" size="md" /> */}
          <Button 
            fullWidth 
            mt="xl" 
            size="md" 
            type="submit"
            loading={loading}
          >
            Login
          </Button> 

          <Text ta="center" mt="md">
            Don&apos;t have an account?{" "}
            <Anchor 
              href="/signup" 
              fw={700}
              onClick={(e) => {
                e.preventDefault();
                dispatch(clearError());
                navigate('/signup');
              }}
            >
              Register
            </Anchor>
          </Text>
        </form>
      </Paper>
    </div>
  );
}
