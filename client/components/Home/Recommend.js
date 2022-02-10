import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

const Recommend = () => {
    const [videos, setVideos] = useState([]);

    useEffect(async () => {
        try {
            const { data } = await axios.get("/api/home/video/recommend-videos");
            setVideos(data);
        } catch (e) {}
    }, []);

    return (
        <div className="px-2">
            <p className="fw-bold fs-4 text-secondary">Recommended videos</p>
            <div className="row">
                {videos.map((video, index) => (
                    <div
                        className="col-3 shadow-sm rounded-2 w-25 border border-secondary"
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
                                <div className="d-flex flex-column px-3 pb-3">
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
            <hr className="bg-primary mt-4" />
        </div>
    );
};

export default Recommend;
