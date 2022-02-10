import { useState, useEffect } from "react";
import LeftNav from "../../../components/Admin/LeftNav";
import Comments from "../../../components/Admin/Comment/Comments";
import axios from "axios";
import { useRouter } from "next/router";
import moment from "moment";
import Link from "next/link";
import {toast} from "react-toastify";
import SearchBar from "../../../components/Admin/Search/SearchBar"
import Head from "next/head";

const WatchPage = () => {
    const router = useRouter();
    const [video, setVideo] = useState({});
    const [showDescription, setShowDescription] = useState(false);

    useEffect(async () => {
        const { v } = router.query;
        if (v) {
            try {
                const { data } = await axios.get(`/api/admin/watch/${v}`);
                setVideo(data);
            } catch (e) {
                console.log(e);
            }
        }
    }, [router]);

    const deleteVideoHandler = async () => {
        const answer = window.confirm('Are you sure you want to delete this video?');
        if(answer) {
            const { v } = router.query;
            try {
                const {data} = await axios.delete("/api/admin/delete-video/"+v);
                toast(data.message);
                router.back();
            }catch(e) {
                console.log(e);
                toast.error(e.response.data);
            }
        }
    }

    const information = (
        <div className="text-light">
            <div className="d-flex justify-content-between">
                <p className="fs-3">{video.title}</p>
                <img
                    src="/static/icons/bin.png"
                    style={{ width: "25px", height: "25px", cursor: "pointer" }}
                    onClick={deleteVideoHandler}
                />
            </div>
            <div className="mt-3 d-flex justify-content-between">
                <p>{video.view} views</p>
                <p>{video.like} likes</p>
            </div>
        </div>
    );

    const description = (
        <div className="text-break text-light">
            <hr className="bg-light" />
            <p>{video.description}</p>
            <div className="d-flex justify-content-between my-2">
                <p className="text-primary">{moment(video.createdAt).format("YYYY-MM-DD HH:mm")}</p>
                <p className="text-primary">{moment(video.createdAt).fromNow()}</p>
            </div>
        </div>
    );

    return (
        <LeftNav>
            <Head>
                <title>Dotube | {video.title}</title>
                <meta name="description" content="Dotube" />
            </Head>
            <SearchBar />
            <div className="pb-4">
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
                <div className="px-4">{video && information}</div>
                {video && (
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
                    <Link href={video.uploadedBy ? `/admin/channel/${video.uploadedBy._id}` : ""}>
                        <a className="text-decoration-none d-flex align-items-center text-light">
                            <img
                                src={
                                    video && video.uploadedBy && video.uploadedBy.profile_image.url
                                }
                                style={{
                                    width: "55px",
                                    height: "55px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                }}
                            />
                            <span className="ms-2 fs-5 fw-bold">
                                {video && video.uploadedBy && video.uploadedBy.name}
                            </span>
                        </a>
                    </Link>
                </div>
            </div>
            <Comments />
        </LeftNav>
    );
};

export default WatchPage;
