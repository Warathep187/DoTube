import { Navbar, Nav, Container } from "react-bootstrap";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { profileActions } from "../store";
import { useEffect } from "react";
import axios from "axios";
import Router from "next/router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import Head from "next/head";

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

const TopNav = ({ children }) => {
    const dispatch = useDispatch();
    const { data } = useSelector((state) => state.profileSlice);

    useEffect(async () => {
        try {
            const { data } = await axios.get("/api/get-logged-in-user");
            dispatch(
                profileActions.setInitialProfile({
                    user: data,
                })
            );
        } catch (e) {
            if (
                window.location.pathname !== "/login" &&
                window.location.pathname !== "/register" &&
                !window.location.pathname.includes("/verify-account")
            ) {
                if (e.response.status === 401) {
                    dispatch(profileActions.removeProfile());
                    Router.push("/login");
                } else {
                    Router.push("/");
                }
            }
        }
    }, []);

    const logoutHandler = async () => {
        try {
            const { data } = await axios.get("/api/logout");
            dispatch(profileActions.removeProfile());
            Router.push("/login");
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <div className="bg-dark">
            <Head>
                <link rel="shortcut icon" href="/favicon.ico" />
            </Head>
            <Navbar bg="dark" variant="dark" className="shadow-sm">
                <Container>
                    <Link href={`${data && data.role === "admin" ? "/admin": "/"}`}>
                        <Navbar.Brand href="/">
                            <img src="/static/images/logo.png" style={{ width: "150px" }} />
                        </Navbar.Brand>
                    </Link>
                    <Nav className="ms-auto">
                        {!data.name && (
                            <>
                                <Link href="/login">
                                    <Nav.Link href="/login">Login</Nav.Link>
                                </Link>
                                <Link href="/register">
                                    <Nav.Link href="/register">Register</Nav.Link>
                                </Link>
                            </>
                        )}
                        {data && data.name && (
                            <>
                                {data.role === "user" ? (
                                    <Link href="/channel?show=video">
                                        <Nav.Link
                                            href="/channel"
                                            className="d-flex align-items-center"
                                        >
                                            <img
                                                src={data.profile_image.url}
                                                style={{
                                                    width: "40px",
                                                    height: "40px",
                                                    borderRadius: "50%",
                                                    objectFit: "cover",
                                                    marginBottom: "6px",
                                                }}
                                            />
                                            <p className="ms-2">{data.name}</p>
                                        </Nav.Link>
                                    </Link>
                                ) : (
                                    <Nav.Link className="d-flex align-items-center">
                                        <img
                                            src={data.profile_image.url}
                                            style={{
                                                width: "40px",
                                                height: "40px",
                                                borderRadius: "50%",
                                                objectFit: "cover",
                                                marginBottom: "6px",
                                            }}
                                        />
                                        <p className="ms-2">{data.name}</p>
                                    </Nav.Link>
                                )}
                                <Nav.Link href="#logout" onClick={logoutHandler}>
                                    Logout
                                </Nav.Link>
                            </>
                        )}
                    </Nav>
                </Container>
            </Navbar>
            <div style={{ height: "100%", width: "100%" }}>{children}</div>
        </div>
    );
};

export default TopNav;
