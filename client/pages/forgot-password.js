import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";
import Head from "next/head";

const forgotPassword = () => {
    const [email, setEmail] = useState("");
    const [isSent, setIsSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const validateEmail = (email) => {
        const re =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    const sendEmailHandler = async (e) => {
        e.preventDefault();
        if (!validateEmail(email)) {
            toast.error("Email is not valid");
        } else {
            setIsLoading(true);
            try {
                const { data } = await axios.post("/api/forgot-password", {
                    email,
                });
                toast(data.message);
                setIsSent(true);
            } catch (e) {
                toast.error(e.response.data);
            }
            setIsLoading(false);
        }
    };

    const resetPasswordHandler = async (e) => {
        e.preventDefault();
        if (!validateEmail(email)) {
            toast.error("Email is not valid");
        } else if (otp.trim().length !== 6) {
            toast.error("OTP format is invalid");
        } else if (password.trim().length < 6) {
            toast.error("Password must be at least 6 characters");
        } else if (password.trim() !== confirm.trim()) {
            toast.error("Password does not match");
        } else {
            setIsLoading(true);
            try {
                const { data } = await axios.post("/api/reset-password", {
                    email,
                    password,
                    confirm,
                    otp,
                });
                toast(data.message);
                setEmail("");
                setIsSent(false);
            } catch (e) {
                toast.error(e.response.data);
            }
            setIsLoading(false);
        }
    };

    const enterPassword = (
        <>
            <Form.Group className="mb-3">
                <Form.Label>OTP (from email)</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Enter OTP"
                    onChange={(e) => setOtp(e.target.value)}
                    value={otp}
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>New password</Form.Label>
                <Form.Control
                    type="password"
                    placeholder="Enter new password"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Confirm new password</Form.Label>
                <Form.Control
                    type="password"
                    placeholder="Confirm new password"
                    onChange={(e) => setConfirm(e.target.value)}
                    value={confirm}
                />
            </Form.Group>
        </>
    );

    return (
        <>
            <Head>
                <title>Dotube | Forgot password</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <div className="w-50 mx-auto text-light">
                <div>
                    <p className="display-3">
                        {isSent
                            ? "Please enter your new password"
                            : "We will send OTP to your email."}
                    </p>
                </div>
                <Form onSubmit={isSent ? resetPasswordHandler : sendEmailHandler}>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter your email"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                        />
                    </Form.Group>
                    {isSent && enterPassword}
                    <Button variant="primary" type="submit" className="px-4" disabled={isLoading}>
                        {isLoading ? "Submitting" : "Submit"}
                    </Button>
                </Form>
            </div>
        </>
    );
};

export default forgotPassword;
