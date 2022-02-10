import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import VideoItem from "./VideoItem";
import axios from "axios";
import {toast} from "react-toastify";

const Videos = ({ newVideo }) => {
    const [videos, setVideos] = useState([]);
    const [management, setManagement] = useState({
        limit: 5,
        skip: 0,
    });
    const { limit, skip } = management;
    const [isEmpty, setIsEmpty] = useState(false);

    const fetchVideoHandler = async () => {
        try {
            const { data } = await axios.post("/api/video/videos", { limit, skip });
            if (data.length < 5) {
                setIsEmpty(true);
            }
            setManagement({
                ...management,
                skip: [...videos, ...data].length,
            });
            setVideos([...videos, ...data]);
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        if (newVideo && newVideo.title) {
            setVideos([newVideo, ...videos]);
        }
    }, [newVideo]);

    useEffect(() => {
        fetchVideoHandler();
    }, []);

    const deleteVideoHandler = async (id) => {
        const answer = window.confirm('Are you sure you want to delete this video');
        if(answer) {
            try {
                const {data} = await axios.delete("/api/video/"+id);
                toast("Deleted successfully");
                const filtered = videos.filter(v => v._id !== id);
                setVideos(filtered);
            }catch(e) {
                toast.error(e.response.data);
            }
        }
    }

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
                    <VideoItem key={index} video={v} canManage={true} wordLength={52} onDeleteVideoHandler={deleteVideoHandler} />
                ))}
            </InfiniteScroll>
        </div>
    );
};

export default Videos;
