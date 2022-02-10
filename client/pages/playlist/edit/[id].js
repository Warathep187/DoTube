import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import Edit from "../../../components/Playlist/Edit";
import Resizer from "react-image-file-resizer";
import ManageVideo from "../../../components/Playlist/ManageVideo";
import Router from "next/router";
import Head from "next/head";

const editPlaylist = () => {
    const router = useRouter();
    const [playlist, setPlaylist] = useState({
        title: "",
        description: "",
        image: "",
        paid: false,
        price: 0,
        published: false,
    });
    const [imagePreview, setImagePreview] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { title, description, image, paid, price } = playlist;
    const [isEdit, setIsEdit] = useState(false);

    useEffect(async () => {
        const { id } = router.query;
        if (id) {
            try {
                const { data } = await axios.get("/api/playlist/edit/" + id);
                setPlaylist({ ...playlist, ...data.playlist });
                setImagePreview(data.imagePreview);
            } catch (e) {
                if (e.response.status === 404) {
                    Router.replace("/404");
                } else if (e.response.status === 401) {
                    Router.push("/login");
                } else {
                    Router.push("/");
                }
            }
        }
    }, [router]);

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
        setPlaylist({ ...playlist, image });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (title.trim().length === 0) {
            toast.error("title is required");
        } else if (description.trim().length === 0) {
            toast.error("description is required");
        } else if (description.trim().length > 512) {
            toast.error("description must be less than 512 characters");
        } else if (paid && ![59, 99, 159, 199, 259, 299].includes(price)) {
            toast.error("price must be only 0, 59, 99, 159, 199, 259 and 299");
        } else if (!paid && price !== 0) {
            toast.error("price must be 0");
        } else {
            const { id } = router.query;
            setIsLoading(true);
            try {
                const { data } = await axios.put("/api/playlist/edit/" + id, playlist);
                if (data.redirect) {
                    toast("Complete your bank information for create paid playlist");
                    return Router.push("/channel/edit");
                }
                if (data.updatedImage) {
                    setImagePreview(data.updatedImage);
                }
                toast("Updated successfully");
                setIsEdit(false);
            } catch (e) {
                toast.error(e.response.data);
            }
            setIsLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Dotube | Edit playlist</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <div className="px-3">
                <div className="row pb-3">
                    <div className="col-7 px-5">
                        <Edit
                            playlist={playlist}
                            setPlaylist={setPlaylist}
                            imagePreview={imagePreview}
                            isLoading={isLoading}
                            onImageChangeHandler={imageChangeHandler}
                            onSubmitHandler={submitHandler}
                            isEdit={isEdit}
                            setIsEdit={setIsEdit}
                        />
                    </div>
                    <div className="col-5 px-4 mt-3">
                        <ManageVideo />
                    </div>
                </div>
            </div>
        </>
    );
};

export default editPlaylist;
