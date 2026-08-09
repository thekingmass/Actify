import { useAccount } from "../../lib/hooks/useAccount.ts";
import { useForm } from "react-hook-form";
import { Box, Button, Paper, Typography } from "@mui/material";
import { LockOpen } from "@mui/icons-material";
import TextInput from "../../app/shared/components/TextInput.tsx";
import {
  registerSchema,
  type RegisterSchema,
} from "../../lib/schemas/registerSchema.ts";
import { Link } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import RegisterSuccess from "./RegisterSuccess.tsx";

export default function RegisterForm() {
  const { registerUser } = useAccount();
  const [resisterSuccess, setRegisterSuccess] = useState(false);
  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { isValid, isSubmitting },
  } = useForm<RegisterSchema>({
    mode: "onTouched",
    resolver: zodResolver(registerSchema),
  });

  const email = watch("email");

  const onSubmit = async (data: RegisterSchema) => {
    await registerUser.mutateAsync(data, {
      onSuccess: () => setRegisterSuccess(true),
      onError: (error) => {
        if (Array.isArray(error)) {
          error.forEach((err) => {
            if (err.includes("Email")) setError("email", { message: err });
            else if (err.includes("Password"))
              setError("password", { message: err });
          });
        }
      },
    });
  };

  return (
    <>
      {resisterSuccess ? (
        <RegisterSuccess email={email} />
      ) : (
        <Paper
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            display: "flex",
            flexDirection: "column",
            p: 3,
            gap: 3,
            maxWidth: "md",
            mx: "auto",
            borderRadius: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              color: "secondary.main",
            }}
          >
            <LockOpen fontSize="large" />
            <Typography variant="h4">Register</Typography>
          </Box>
          <TextInput label="Email" control={control} name="email" />
          <TextInput
            label="Display name"
            control={control}
            name="displayName"
          />
          <TextInput
            label="Password"
            control={control}
            name="password"
            type="password"
          />
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={!isValid || isSubmitting}
            variant="contained"
            size="large"
          >
            Register
          </Button>
          <Typography sx={{ textAlign: "center" }}>
            Already have an account?
            <Typography
              sx={{ ml: 2 }}
              component={Link}
              to="/login"
              color="primary"
            >
              Sign in
            </Typography>
          </Typography>
        </Paper>
      )}
    </>
  );
}
