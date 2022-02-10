import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";

const HomeVideos = () => {
    const [videos, setVideos] = useState([]);
    const [management, setManagement] = useState({
        limit: 4,
        skip: 0,
    });
    const [isEmpty, setIsEmpty] = useState(false);

    const { limit, skip } = management;

    const fetchVideosHandler = async () => {
        try {
            const { data } = await axios.post("/api/home/videos", { limit, skip });
            if (data.length < 4) {
                setIsEmpty(true);
            }
            setManagement({
                ...management,
                skip: [...videos, ...data].length,
            });
            setVideos([...videos, ...data]);
        } catch (e) {}
    };

    useEffect(async () => {
        fetchVideosHandler();
    }, []);

    return (
        <InfiniteScroll
            dataLength={videos.length}
            next={fetchVideosHandler}
            hasMore={!isEmpty}
            loader={
                <div className="text-center">
                    <img src="/static/images/loading.gif" />
                </div>
            }
            endMessage={""}
        >
            <div className="row">
                {videos.map((video, index) => (
                    <div
                        className="col-3 my-1 rounded-2 border border-secondary"
                        key={index}
                        style={{ overflow: "hidden" }}
                    >
                        <Link href={`/watch?v=${video._id}`}>
                            <a style={{ textDecoration: "none" }} className="text-light">
                                <div style={{ position: "relative" }}>
                                    <img
                                        src={video.image.url}
                                        style={{
                                            width: "100%",
                                            height: "180px",
                                            objectFit: "cover",
                                        }}
                                    />
                                    <span
                                        className="badge bg-dark text-light p-2"
                                        style={{ position: "absolute", top: "0", right: "0" }}
                                    >
                                        {parseInt(video.video_length / 60) +
                                            ":" +
                                            (parseInt(video.video_length % 60) < 10
                                                ? "0" + parseInt(video.video_length % 60)
                                                : parseInt(video.video_length % 60))}
                                    </span>
                                </div>
                                <div className="d-flex flex-column pb-2">
                                    <p className="my-3 text-break">{video.title}</p>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <Link href={`/channel/${video.uploadedBy._id}`}>
                                            <div className="text-light d-flex align-items-center">
                                                <img
                                                    src={video.uploadedBy.profile_image.url}
                                                    style={{
                                                        width: "40px",
                                                        height: "40px",
                                                        objectFit: "cover",
                                                        borderRadius: "50%",
                                                    }}
                                                />
                                                <span className="ms-2">
                                                    {video.uploadedBy.name}
                                                </span>
                                            </div>
                                        </Link>
                                        <p className="text-secondary">{video.view} views</p>
                                    </div>
                                </div>
                            </a>
                        </Link>
                    </div>
                ))}
            </div>
        </InfiniteScroll>
    );
};

export default HomeVideos;
