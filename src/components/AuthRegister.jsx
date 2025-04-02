import {
  Button,
  Paper,
  Text,
  Title,
  Group,
  rem
} from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import classes from "./AuthPage.module.css";
import { loginWithGoogle, clearError } from "../store/authSlice";
import { IconBrandGoogle } from '@tabler/icons-react';
import { useState } from "react";

export default function AuthRegister() {
  const dispatch = useDispatch();
  const [error, setError] = useState("");
  const { loading, error: authError } = useSelector((state) => state.auth);

  const handleGoogleLogin = async () => {
    setError("");
    dispatch(clearError());
    
    try {
      await dispatch(loginWithGoogle()).unwrap();
    } catch (err) {
      console.error('Google authentication failed:', err);
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

        <Text size="sm" ta="center" mb="xl">
          Only LNMIIT students with @lnmiit.ac.in email addresses can register
        </Text>

        <Group position="center">
          <Button
            leftIcon={<IconBrandGoogle size={rem(18)} />}
            size="md"
            onClick={handleGoogleLogin}
            loading={loading}
          >
            Sign up with Google
          </Button>
        </Group>

        <Text c="dimmed" size="sm" ta="center" mt={20}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </Paper>
    </div>
  );
}
