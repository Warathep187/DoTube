import jwt from "jsonwebtoken";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";
import Link from "next/link";
import Head from "next/head";

const verifyAccount = (props) => {
    const [name, setName] = useState("");
    const [isExpired, setIsExpired] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const expired = (
        <>
            <img
                src="/static/images/wrong.png"
                style={{ width: "400px", height: "400px", objectFit: "cover" }}
            />
            <div className="text-start text-light">
                <p className="fs-1 fw-bold text-danger">Warning</p>
                <p className="fs-5">Token is invalid or expired.</p>
                <p className="fs-5">Try to signup again.</p>
                <Link href="/">
                    <a className="fs-5">← Go to Signup page</a>
                </Link>
            </div>
        </>
    );

    useEffect(() => {
        if (props.expiredToken) {
            setIsExpired(true);
        } else {
            const { name } = jwt.decode(props.token);
            setName(name);
        }
    }, []);

    const verifyHandler = async () => {
        setIsLoading(true);
        try {
            const { data } = await axios.post("/api/verify-account", {
                token: props.token,
            });
            toast(data.message);
            setIsVerified(true);
        } catch (e) {
            toast(e.response.data);
        }
        setIsLoading(false);
    };

    const verifyBtn = (
        <Button
            variant="outline-primary"
            className="w-100 py-2"
            onClick={verifyHandler}
            disabled={isVerified || isLoading}
        >
            {isVerified ? "Verified" : "Verify"}
        </Button>
    );

    return (
        <>
            <Head>
                <title>Dotube | Verify</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <div
                className="w-100 d-flex align-items-center justify-content-center"
                style={{ height: "668px" }}
            >
                {isExpired && expired}
                {!isExpired && (
                    <div className="p-4 bg-light w-50 text-center">
                        <p className="fs-3 text-secondary">
                            Hi, <b>{name}</b>. Please click the below button to verify your account.
                        </p>
                        <br />
                        {verifyBtn}
                    </div>
                )}
            </div>
        </>
    );
};

export const getServerSideProps = (ctx) => {
    try {
        const token = ctx.params.token;
        return {
            props: {
                expiredToken: false,
                token,
            },
        };
    } catch (e) {
        return {
            props: {
                expiredToken: true,
            },
        };
    }
};

export default verifyAccount;
