import LeftNav from "../../../components/LeftNav";
import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Resizer from "react-image-file-resizer";
import Head from "next/head";

const EditVideo = () => {
    const router = useRouter();
    const [data, setData] = useState({
        title: "",
        description: "",
        image: {},
    });
    const {title, description, image, _id} = data;
    const [enteredImage, setEnteredImage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(async () => {
        const { id } = router.query;
        if (id) {
            try {
                const { data } = await axios.get("/api/video/edit/" + id);
                setData(data);
            } catch (e) {
                if (e.response.status === 404) {
                    router.replace("/404");
                } else if (e.response.status === 401) {
                    router.replace("/login");
                } else {
                    router.replace("/");
                }
            }
        }
        return () => {};
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
        setEnteredImage(image);
    };

    const updateVideoHandler = async (e) => {
        e.preventDefault();
        if (title.trim() === "") {
            toast.error("title is require");
        } else if (description.length === 0) {
            toast.error("Description is require");
        } else if (description.length > 512) {
            toast.error("Description must be less than 512 characters");
        }else {
            setIsLoading(true);
            try {
                const res = await axios.put("/api/video/update", {title, description, image: enteredImage, v: _id});
                toast(res.data.message);
                if(res.data.image) {
                    setData({...data, image: data.image})
                }
                setEnteredImage("");
            } catch (e) {
                console.log(e);
                toast(e.response.data);
            }
            setIsLoading(false);
        }
    };

    return (
        <LeftNav>
            <Head>
                <title>Dotube | Edit video</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <div className="px-5 pb-4">
                <p className="display-3 text-light">Edit video</p>
                <div className="text-light">
                    <div className="mb-3">
                        <span>Title</span>
                        <input type="text" className="form-control" value={title} onChange={(e) => setData({...data, title: e.target.value})} />
                    </div>
                    <div className="mb-3">
                        <span>Description ({description && description.length}/512)</span>
                        <textarea
                            className="form-control"
                            maxLength={512}
                            style={{ height: "200px" }}
                            onChange={(e) => setData({...data, description: e.target.value})}
                            value={description}
                        ></textarea>
                    </div>
                    <div className="d-flex flex-column mb-3">
                        <span>Cover image</span>
                        <img
                            src={image.url}
                            style={{ width: "230px", height: "150px", objectFit: "cover" }}
                            className="rounded"
                        />
                        <input type="file" accept="image/*" className="form-control w-25" onChange={imageChangeHandler} />
                    </div>
                    <div className="text-end">
                        <button className="btn btn-outline-primary px-4" onClick={updateVideoHandler} disabled={isLoading || !title || !description}>
                            {isLoading ? "Updating.." : "Update"}
                        </button>
                    </div>
                </div>
            </div>
        </LeftNav>
    );
};

export default EditVideo;
