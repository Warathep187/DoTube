import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import LeftNav from "../components/LeftNav";
import InfiniteScroll from "react-infinite-scroll-component";
import Head from "next/head";

const HistoryPage = () => {
    const [videos, setVideos] = useState([]);
    const [management, setManagement] = useState({
        limit: 8,
        skip: 0
    })
    const [isEmpty, setIsEmpty] = useState(false);

    const {limit, skip} = management;

    const fetchVideosHandler = async () => {
        try {
            const { data } = await axios.post("/api/video/history", { limit, skip});
            if(data.videos.length < 8) {
                setIsEmpty(true);
            }
            setManagement({
                ...management,
                skip: [...videos, ...data.videos].length
            })
            setVideos([...videos, ...data.videos]);
        } catch (e) {
            setVideos([]);
        }
    }

    useEffect(async () => {
        fetchVideosHandler();
    }, []);

    return (
        <LeftNav>
            <Head>
                <title>Dotube | History</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <p className="display-3 text-light">Watch history</p>
            <hr className="bg-primary" />
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
                    {videos.map((video, index) => {
                        return (
                            <div
                                className="col-3 my-1 shadow-sm rounded-2 border border-secondary"
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
                                                    height: "200px",
                                                    objectFit: "cover",
                                                }}
                                            />
                                            <span
                                                className="badge bg-dark text-light p-2"
                                                style={{
                                                    position: "absolute",
                                                    top: "0",
                                                    right: "0",
                                                }}
                                            >
                                                {parseInt(video.video_length / 60) +
                                                    ":" +
                                                    (parseInt(video.video_length % 60) < 10
                                                        ? "0" + parseInt(video.video_length % 60)
                                                        : parseInt(video.video_length % 60))}
                                            </span>
                                        </div>
                                        <div className="d-flex flex-column pb-3">
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
                        );
                    })}
                </div>
            </InfiniteScroll>
        </LeftNav>
    );
};

export default HistoryPage;
