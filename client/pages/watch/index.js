import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Comments from "../../components/Comment/Comments";
import Router from "next/router";
import Recommend from "../../components/Video/Recommend";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Link from "next/link";
import moment from "moment";
import PlaylistBox from "../../components/Playlist/PlaylistBox";
import SearchBar from "../../components/Search/SearchBar";
import Head from "next/head";

const watchPage = () => {
    const { data } = useSelector((state) => state.profileSlice);
    const router = useRouter();
    const [video, setVideo] = useState({
        uploadedBy: "",
    });
    const [showDescription, setShowDescription] = useState(false);
    const [status, setStatus] = useState({
        isLike: false,
        isSave: false,
    });
    const { isLike, isSave, isSubscribed } = status;

    useEffect(async () => {
        try {
            const { data } = await axios.get("/api/check-user");
        } catch (e) {
            Router.push("/login");
        }
    }, []);

    useEffect(async () => {
        const { v } = router.query;
        if (v) {
            try {
                const { data } = await axios.get(`/api/video/${v}`);
                setVideo(data);
                setStatus({
                    isLike: data.isLike,
                    isSave: data.isSave,
                    isSubscribed: data.isSubscribed,
                });
            } catch (e) {
                if (e.response.status === 404) { 
                    return Router.replace("/404");
                } else if (e.response.status === 401) {
                    Router.replace("/login");
                } else {
                    Router.replace("/");
                }
            }
        }
    }, [router]);

    const likeHandler = async () => {
        const { v } = router.query;
        try {
            setStatus({
                ...status,
                isLike: true,
            });
            setVideo({
                ...video,
                like: ++video.like,
            });
            const { data } = await axios.post("/api/video/like", { v });
            toast("Liked❤");
        } catch (e) {
            setStatus({
                ...status,
                isLike: false,
            });
            setVideo({
                ...video,
                like: --video.like,
            });
            toast.error(e.response.data);
        }
    };

    const unlikeHandler = async () => {
        const { v } = router.query;
        try {
            setStatus({
                ...status,
                isLike: false,
            });
            setVideo({
                ...video,
                like: --video.like,
            });
            const { data } = await axios.post("/api/video/unlike", { v });
            toast("Unlike💔");
        } catch (e) {
            toast.error(e.response.data);
            setStatus({
                ...status,
                isLike: true,
            });
            setVideo({
                ...video,
                like: ++video.like,
            });
        }
    };

    const saveHandler = async () => {
        const { v } = router.query;
        try {
            setStatus({
                ...status,
                isSave: true,
            });
            const { data } = await axios.put("/api/video/watch-later", { v });
            toast(data.message);
        } catch (e) {
            setStatus({
                ...status,
                isSave: false,
            });
            toast.error(e.response.data);
        }
    };

    const unSaveHandler = async () => {
        const { v } = router.query;
        try {
            setStatus({
                ...status,
                isSave: false,
            });
            const { data } = await axios.put("/api/video/remove-watch-later", { v });
            toast(data.message);
        } catch (e) {
            toast.error(e.response.data);
            setStatus({
                ...status,
                isSave: true,
            });
        }
    };

    const subscribeHandler = async () => {
        try {
            const { data } = await axios.post("/api/channel/subscribe", {
                userId: video.uploadedBy._id,
            });
            if (data.ok) {
                setStatus({
                    ...status,
                    isSubscribed: true,
                });
            }
        } catch (e) {
            toast(e.response.data);
        }
    };

    const unsubscribeHandler = async () => {
        try {
            const { data } = await axios.post("/api/channel/unsubscribe", {
                userId: video.uploadedBy._id,
            });
            if (data.ok) {
                setStatus({
                    ...status,
                    isSubscribed: false,
                });
            }
        } catch (e) {
            toast(e.response.data);
        }
    };

    const information = (
        <div className="text-light">
            <p className="fs-3">{video.title}</p>
            <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                    <p>{video.view} views</p>
                </div>
                <div className="d-flex align-items-center">
                    <p className="mt-3">{video.like} likes</p>
                    {isLike ? (
                        <button className="btn btn-success mx-2" onClick={unlikeHandler}>
                            Liked ❤
                        </button>
                    ) : (
                        <button className="btn btn-outline-success mx-2" onClick={likeHandler}>
                            Like 👍
                        </button>
                    )}
                    {isSave ? (
                        <button className="btn btn-primary" onClick={unSaveHandler}>
                            Saved
                        </button>
                    ) : (
                        <button className="btn btn-outline-primary" onClick={saveHandler}>
                            Save
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    const description = video.blocked ? (
        ""
    ) : (
        <div className="text-break text-light">
            <hr className="bg-light" />
            <p>{video.description}</p>
            <div className="d-flex justify-content-between my-2">
                <p className="text-primary">{moment(video.createdAt).format("YYYY-MM-DD HH:mm")}</p>
                <p className="text-primary">{moment(video.createdAt).fromNow()}</p>
            </div>
        </div>
    );

    const subButton = isSubscribed ? (
        <button className="btn btn-success rounded-pill" onClick={unsubscribeHandler}>
            Subscribed
        </button>
    ) : (
        <button className="btn btn-outline-primary rounded-pill" onClick={subscribeHandler}>
            Subscribe
        </button>
    );

    return (
        <div>
            <Head>
                <title>Dotube | {video.title}</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <div>
                <SearchBar />
            </div>
            <div className="row w-100">
                <div className="col-9">
                    <div>
                        {!video.videoLink && (
                            <video
                                style={{ width: "100%", height: "550px" }}
                                className="px-4 py-2"
                                controls
                                autoPlay
                            >
                                <source src="/" type="video/mp4" />
                            </video>
                        )}
                        {video && video.videoLink && (
                            <video
                                style={{ width: "100%", height: "550px" }}
                                className="px-4 py-2"
                                controls
                                autoPlay
                            >
                                <source src={video.videoLink} type="video/mp4" />
                            </video>
                        )}
                    </div>
                    <div className="px-4">{video && !video.blocked && information}</div>
                    {video && !video.blocked && (
                        <div className="px-5 mt-4">
                            {!showDescription && (
                                <p
                                    className="text-secondary"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => setShowDescription(true)}
                                >
                                    Show more
                                </p>
                            )}
                            {showDescription && description}
                        </div>
                    )}
                    <div className="d-flex align-items-center px-4 mt-4">
                        <Link
                            href={
                                video &&
                                video.uploadedBy &&
                                video.uploadedBy._id &&
                                `/channel/${video.uploadedBy._id}`
                            }
                        >
                            <a className="text-decoration-none d-flex align-items-center text-light">
                                <img
                                    src={
                                        video &&
                                        video.uploadedBy &&
                                        video.uploadedBy.profile_image.url
                                    }
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                    }}
                                />
                                <p className="mx-2">
                                    {video && video.uploadedBy && video.uploadedBy.name}
                                </p>
                            </a>
                        </Link>
                        {video &&
                            video.uploadedBy &&
                            data._id !== video.uploadedBy._id &&
                            subButton}
                    </div>
                    {video && !video.blocked && <Comments />}
                </div>
                <div className="col-3 text-light">
                    {video.playlist && (
                        <PlaylistBox playlist={video.playlist} purchased={video.purchased} />
                    )}
                    <Recommend />
                </div>
            </div>
        </div>
    );
};

export default watchPage;
