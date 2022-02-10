import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";

const Recommend = () => {
    const router = useRouter();
    const [videos, setVideos] = useState([]);

    useEffect(async () => {
        const { v } = router.query;
        if (v) {
            try {
                const { data } = await axios.post("/api/video/recommended-video", { v });
                setVideos(data);
            } catch (e) {
                console.log(e);
                setVideos([]);
            }
        }
    }, [router]);

    return (
        <div>
            <p className="fs-3 fw-bold text-secondary">Recommended</p>
            <div className="d-block">
                {videos.map((video, index) => (
                    <div
                        className="my-3 shadow-sm rounded-2"
                        key={index}
                        style={{ overflow: "hidden" }}
                    >
                        <a
                            href={`/watch?v=${video._id}`}
                            style={{ textDecoration: "none" }}
                            className="text-light"
                        >
                            <div style={{ position: "relative" }}>
                                <img
                                    src={video.image.url}
                                    style={{ width: "100%", height: "180px", objectFit: "cover" }}
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
                            <div className="p-1 px-2 pb-2">
                                <p>{video.title}</p>
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
                                            <span className="ms-2">{video.uploadedBy.name}</span>
                                        </div>
                                    </Link>
                                    <p className="text-secondary">{video.view} views</p>
                                </div>
                            </div>
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Recommend;
