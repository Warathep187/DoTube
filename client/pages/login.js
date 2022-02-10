import { useState, useEffect } from "react";
import Login from "../components/Login/Login";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { profileActions } from "../store";
import Router from "next/router";
import Head from "next/head";

const login = () => {
    const dispatch = useDispatch();
    const [enteredData, setEnteredData] = useState({
        email: "",
        password: "",
    });
    const { email, password } = enteredData;
    const [isLoading, setIsLoading] = useState(false);

    useEffect(async () => {
        try {
            const res = await axios.get("/api/check-user");
            Router.push("/");
        }catch(e) {
            dispatch(profileActions.removeProfile());
        }
    }, [])

    const changeHandler = (e) => {
        setEnteredData({
            ...enteredData,
            [e.target.name]: e.target.value,
        });
    };

    const validateEmail = (email) => {
        const re =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!validateEmail(email)) {
            toast.error("Email is not valid");
        } else if (password.trim() < 6) {
            toast.error("Password must be at least 6 characters");
        } else {
            setIsLoading(true);
            try {
                const { data } = await axios.post("/api/login", {
                    email,
                    password,
                });
                dispatch(
                    profileActions.setInitialProfile({
                        user: data,
                    })
                );
                if(data.role === "admin") {
                    Router.push("/admin");
                }else {
                    Router.push("/");
                }
            } catch (e) {
                toast.error(e.response.data);
            }
            setIsLoading(false);
        }
    };

    return (
        <div>
            <Head>
                <title>Dotube | Login</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <Login
                onChangeHandler={changeHandler}
                onSubmitHandler={submitHandler}
                enteredData={enteredData}
                isLoading={isLoading}
            />
        </div>
    );
};

export default login;
