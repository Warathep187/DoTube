import { useState, useEffect } from "react";
import axios from "axios";
import { profileActions } from "../../store";
import { useDispatch } from "react-redux";
import Resizer from "react-image-file-resizer";
import { toast } from "react-toastify";
import Head from "next/head";

const edit = () => {
    const dispatch = useDispatch();
    const [info, setInfo] = useState({
        name: "",
        profile_image: {},
        email: "",
        seller: false,
        account_name: "",
        bank: "",
        bank_number: "",
    });
    const [image, setImage] = useState("");
    const { name, profile_image, email, account_name, bank, bank_number } = info;

    const [isLoading, setIsLoading] = useState(false);

    useEffect(async () => {
        try {
            const { data } = await axios.get("/api/check-user");
        } catch (e) {
            if (e.response.status === 401) {
                Router.replace("/login");
            } else if (e.response.status === 404) {
                Router.replace("/404");
            } else if (e.response.status === 403) {
                Router.replace("/login");
            }
        }
    }, []);

    const resizeFile = (file) =>
        new Promise((resolve) => {
            Resizer.imageFileResizer(
                file,
                300,
                300,
                "JPEG",
                100,
                0,
                (uri) => {
                    resolve(uri);
                },
                "base64"
            );
        });

    const imageChangeHandler = async (e) => {
        const file = e.target.files[0];
        const image = await resizeFile(file);
        setImage(image);
    };

    const update = async () => {
        setIsLoading(true);
        try {
            const res = await axios.post("/api/channel/change-information", {
                name,
                image,
                account_name,
                bank,
                bank_number,
            });
            toast(res.data.message);
            dispatch(
                profileActions.updateProfile({
                    name: res.data.user.name,
                    profile_image: res.data.user.profile_image,
                })
            );
            setInfo({
                ...info,
                name: res.data.user.name,
                profile_image: res.data.user.profile_image,
            });
        } catch (e) {
            toast.error(e.response.data);
        }
        setIsLoading(false);
    };

    const updateProfileHandler = (e) => {
        e.preventDefault();
        if (name.trim() === "") {
            toast.error("Name is require");
        } else if (name.trim().length > 32) {
            toast.error("Name must be less than 32 characters");
        } else {
            console.log(info);
            if (account_name || bank || bank_number) {
                if (account_name.trim() === "") {
                    toast.error("Account name is required");
                } else if (bank.trim() === "") {
                    toast.error("Bank is required");
                } else if (bank_number.trim() === "") {
                    toast.error("Bank number is required");
                } else if (!["Kasikorn", "Krung Thai", "Bangkok"].includes(bank)) {
                    return res.status(400).send("Bank must be Kasikorn, Krung Thai or Bangkok");
                } else {
                    update();
                }
            } else {
                update();
            }
        }
    };

    useEffect(async () => {
        try {
            const { data } = await axios.get("/api/channel/edit");
            setInfo(data);
        } catch (e) {}
    }, []);

    return (
        <>
            <Head>
                <title>Dotube | Edit profile</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <div className="w-50 px-5 mx-auto text-light">
                <p className="display-4">Edit profile</p>
                <hr className="bg-primary" />
                <div className="pb-5 pt-1">
                    <img
                        src={`${profile_image.url}`}
                        style={{
                            width: "130px",
                            height: "130px",
                            borderRadius: "50%",
                            objectFit: "cover",
                        }}
                        className="pb-2"
                    />
                    <form onSubmit={updateProfileHandler}>
                        <span>profile image</span>
                        <input
                            type="file"
                            className="form-control mb-2"
                            onChange={imageChangeHandler}
                            accept="image/*"
                        />
                        <span>name</span>
                        <input
                            type="text"
                            className="form-control mb-2"
                            onChange={(e) => setInfo({ ...info, name: e.target.value })}
                            placeholder="Enter new name.."
                            defaultValue={name}
                        />
                        <span>email</span>
                        <input
                            type="text"
                            className="form-control mb-2"
                            defaultValue={email}
                            disabled={true}
                        />
                        <span>Account name</span>
                        <input
                            type="text"
                            className="form-control mb-2"
                            onChange={(e) => setInfo({ ...info, account_name: e.target.value })}
                            placeholder="Enter new account name.."
                            value={account_name}
                        />
                        <span>Bank</span>
                        <select
                            className="form-select mb-2"
                            aria-label="Default select example"
                            onChange={(e) => setInfo({ ...info, bank: e.target.value })}
                            value={bank}
                        >
                            <option value={""}>Open this select bank</option>
                            <option value={"Kasikorn"}>Kasikorn</option>
                            <option value={"Krung Thai"}>Krung Thai</option>
                            <option value={"Bangkok"}>Bangkok</option>
                        </select>
                        <span>Bank number</span>
                        <input
                            type="text"
                            className="form-control mb-2"
                            onChange={(e) => setInfo({ ...info, bank_number: e.target.value })}
                            placeholder="Enter new name.."
                            value={bank_number}
                        />
                        <div className="w-100 text-end">
                            <button
                                className="btn btn-outline-primary px-3 mt-2"
                                disabled={isLoading}
                            >
                                {isLoading ? "Updating.." : "Update"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default edit;
