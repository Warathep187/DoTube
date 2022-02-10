import Register from "../components/Register/Register";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { profileActions } from "../store";
import axios from "axios";
import Router from "next/router";
import Head from "next/head";

const register = () => {
    const dispatch = useDispatch();
    const [enteredData, setEnteredData] = useState({
        email: "",
        name: "",
        password: "",
        confirm: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const { email, name, password, confirm } = enteredData;

    useEffect(async () => {
        try {
            const res = await axios.get("/api/check-user");
            Router.push("/");
        } catch (e) {
            dispatch(profileActions.removeProfile());
        }
    }, []);

    const dataChangeHandler = (e) => {
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
            toast.error("Email is invalid");
        } else if (name.trim() === "") {
            toast.error("Please enter your name");
        } else if (name.trim().length > 32) {
            toast.error("Name must be less than 32 characters");
        } else if (password.trim().length < 6) {
            toast.error("Password must be at least 6 characters");
        } else if (password.trim() !== confirm.trim()) {
            toast.error("Password does not match");
        } else {
            setIsLoading(true);
            try {
                const { data } = await axios.post("/api/register", {
                    ...enteredData,
                });
                toast.success(data.message);
                setEnteredData({
                    email: "",
                    name: "",
                    password: "",
                    confirm: "",
                });
            } catch (e) {
                console.log(e);
                toast.error(e.response.data);
            }
            setIsLoading(false);
        }
    };

    return (
        <div>
            <Head>
                <title>Dotube | Register</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <Register
                enteredData={enteredData}
                onDataChangeHandler={dataChangeHandler}
                onSubmitHandler={submitHandler}
                isLoading={isLoading}
            />
        </div>
    );
};

export default register;
