import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import VideoItem from "../Video/VideoItem";
import axios from "axios";
import { useRouter } from "next/router";

const Videos = () => {
    const router = useRouter();
    const [videos, setVideos] = useState([]);
    const [management, setManagement] = useState({
        limit: 5,
        skip: 0,
    });
    const { limit, skip } = management;
    const [isEmpty, setIsEmpty] = useState(false);

    const fetchVideoHandler = async () => {
        if (router.query.id) {
            try {
                const { data } = await axios.post("/api/video/get-user-videos", {
                    limit,
                    skip,
                    userId: router.query.id,
                });
                if (data.length < 5) {
                    setIsEmpty(true);
                }
                setManagement({
                    ...management,
                    skip: [...videos, ...data].length,
                });
                setVideos([...videos, ...data]);
            } catch (e) {
                console.log(e.response.data);
            }
        }
    };

    useEffect(() => {
        fetchVideoHandler();
    }, [router.query.id]);

    return (
        <div>
            <InfiniteScroll
                dataLength={videos.length}
                next={fetchVideoHandler}
                hasMore={!isEmpty}
                loader={
                    <div className="text-center">
                        <img src="/static/images/loading.gif" />
                    </div>
                }
                endMessage={""}
            >
                {videos.map((v, index) => (
                    <VideoItem key={index} video={v} />
                ))}
            </InfiniteScroll>
        </div>
    );
};

export default Videos;
