import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import PlaylistInfo from "../../components/Playlist/PlaylistInfo";
import Router from "next/router";
import VideoItem from "../../components/Video/VideoItem";
import { useSelector } from "react-redux";
import {toast} from "react-toastify";
import Head from "next/head";

const PlaylistPage = () => {
    const {
        data: { _id },
    } = useSelector((state) => state.profileSlice);
    const router = useRouter();
    const [playlist, setPlaylist] = useState({
        createdBy: {profile_image: {}}
    });
    const [purchased, setPurchased] = useState(null);
    const [isWaiting, setIsWaiting] = useState(false);
    const [videos, setVideos] = useState([]);

    const fetchVideosHandler = async (id) => {
        try {
            const { data } = await axios.get("/api/view-playlist/videos/" + id);
            setVideos(data);
        } catch (e) {
            if (e.response.status === 401) {
                Router.replace("/login");
            } else if (e.response.status === 403) {
                Router.replace("/");
            } else if (e.response.status === 404) {
                Router.push("/404");
            }
        }
    };

    useEffect(async () => {
        try {
            const { data } = await axios.get("/api/check-user");
        } catch (e) {
            if (e.response.status === 401) {
                Router.push("/login");
            } else {
                Router.push("/");
            }
        }
    }, []);

    useEffect(async () => {
        const { id } = router.query;
        if (id) {
            try {
                const { data } = await axios.get("/api/view-playlist/" + id);
                setPlaylist(data.playlist);
                if (data.purchased === true || data.purchased === false) {
                    setPurchased(data.purchased);
                }
                if (data.isWaiting) {
                    setIsWaiting(data.isWaiting);
                }
                fetchVideosHandler(id);
            } catch (e) {
                if (e.response.status === 401) {
                    Router.replace("/login");
                } else if (e.response.status === 403) {
                    Router.replace("/");
                } else if (e.response.status === 404) {
                    Router.replace("/404");
                }
            }
        }
    }, [router]);

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
        <>
            <Head>
                <title>Dotube | {playlist.title}</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <div className="container">
                <PlaylistInfo info={playlist} purchased={purchased} isWaiting={isWaiting} setIsWaiting={setIsWaiting} />
                <hr className="bg-primary mt-4 mb-3" />
                <div className="w-75 mx-auto pb-3">
                    <p className="fs-4 fw-bold text-secondary">{videos.length} videos</p>
                    {videos.map((video, index) => (
                        <VideoItem key={index} video={video} canManage={_id == video.uploadedBy} onDeleteVideoHandler={deleteVideoHandler} />
                    ))}
                </div>
            </div>
        </>
    );
};

export default PlaylistPage;
