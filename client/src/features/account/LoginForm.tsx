import { useAccount } from "../../lib/hooks/useAccount.ts";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginSchema } from "../../lib/schemas/loginSchema.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Paper, Typography } from "@mui/material";
import { LockOpen } from "@mui/icons-material";
import TextInput from "../../app/shared/components/TextInput.tsx";
import { useNavigate, useLocation, Link } from "react-router";
import { useState } from "react";
import { toast } from "react-toastify";

export default function LoginForm() {
    const [notVerified, setNotVerified] = useState(false);

    const { loginUser, resendConfirmationEmail } = useAccount();
    const navigate = useNavigate();
    const location = useLocation();
    const { control, handleSubmit, formState: { isLoading, isSubmitting }, watch } = useForm<LoginSchema>({
        mode: 'onTouched',
        resolver: zodResolver(loginSchema)
    });

    const email = watch("email");
    const handleResendEmail = async () => {
        try {
            await resendConfirmationEmail.mutateAsync({email});
            setNotVerified(false);
        } catch (error) {
            console.log(error);
            toast.error("Problem sending email - please check email address");
        }
    }

    const onSubmit = async (data: LoginSchema) => {
        await loginUser.mutateAsync(data, {
            onSuccess: () => {
                navigate(location.state?.from || '/activities')
            },
            onError: error => {
                if (error.message === 'NotAllowed') {
                    setNotVerified(true);
                }
            }
        });
    }

    return (
        <Paper
            component='form'
            onSubmit={handleSubmit(onSubmit)}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                p: 3,
                gap: 3,
                maxWidth: 'md',
                mx: 'auto',
                borderRadius: 3
            }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, color: 'secondary.main' }} >
                <LockOpen fontSize='large' />
                <Typography variant="h4">Sign in</Typography>
            </Box>
            <TextInput label='Email' control={control} name='email' />
            <TextInput label='Password' control={control} name='password' type='password' />
            <Button
                type='submit'
                loading={isSubmitting}
                disabled={isLoading}
                variant="contained"
                size="large">Login</Button>

            {notVerified ? (
                <Box sx={{ display: 'flex', flexDirection: "column", justifyContent: 'center' }}>
                    <Typography sx={{ textAlign: 'center'}} color="error">
                        Your Email Has not been verified. You can click the button to re-send the verification Email
                    </Typography>
                    <Button onClick={handleResendEmail}>
                        Re-send email link
                    </Button>
                </Box>

            ) : (
                <Typography sx={{ textAlign: 'center' }}>
                    Don't have an account?
                    <Typography sx={{ ml: 2 }} component={Link} to='/register' color='primary'>
                        Sign up
                    </Typography>
                </Typography>
            )}
        </Paper>
    );
}