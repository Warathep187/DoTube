import { useState, useEffect } from "react";
import LeftNav from "../../../components/Admin/LeftNav";
import axios from "axios";
import { useRouter } from "next/router";
import moment from "moment";
import Link from "next/link";
import { toast } from "react-toastify";

const Videos = () => {
    const router = useRouter();
    const [videos, setVideos] = useState([]);

    useEffect(async () => {
        const { id } = router.query;
        if (id) {
            try {
                const { data } = await axios.get("/api/admin/get-playlist-videos/" + id);
                setVideos(data);
            } catch (e) {
                console.log(e);
            }
        }
    }, [router]);

    const deleteVideoHandler = async (id) => {
        const answer = window.confirm('Are you sure you want to delete this video?');
        if(answer) {
            try {
                const {data} = await axios.delete("/api/admin/delete-video/"+id);
                toast(data.message);
                const filtered = videos.filter(v => v._id !== id);
                setVideos(filtered);
            }catch(e) {
                toast.error(e.response.data);
            }
        }
    }

    return (
        <div className="w-75 mx-auto">
            {videos.map((video, index) => (
                <div className="d-flex px-3 pb-2 flex-column" key={index}>
                    <div className="d-flex justify-content-between">
                        <div className="d-flex">
                            <img
                                src={video.image.url}
                                style={{
                                    width: "140px",
                                    height: "90px",
                                    objectFit: "cover",
                                    borderRadius: "10px",
                                }}
                            />
                            <Link href={`/admin/watch?v=${video._id}`}>
                                <p
                                    className="fs-5 fw-bold ms-2 text-light"
                                    style={{ cursor: "pointer" }}
                                >
                                    {video.title.length > 32
                                        ? video.title.slice(0, 30) + "..."
                                        : video.title}
                                </p>
                            </Link>
                        </div>
                        <div>
                            <a
                                className="ms-1"
                                style={{ cursor: "pointer" }}
                                onClick={() => deleteVideoHandler(video._id)}
                            >
                                <img
                                    src="/static/icons/trash.png"
                                    style={{
                                        width: "20px",
                                        height: "20px",
                                        objectFit: "cover",
                                    }}
                                />
                            </a>
                        </div>
                    </div>
                    <div className="d-flex align-items-end ms-auto">
                        <span className="badge bg-secondary text-light me-2 px-2">
                            {parseInt(video.video_length / 60) +
                                ":" +
                                (parseInt(video.video_length % 60) < 10
                                    ? "0" + parseInt(video.video_length % 60)
                                    : parseInt(video.video_length % 60))}
                        </span>
                        <span className="text-primary me-2">{video.view} views</span>
                        <span className="text-secondary">{moment(video.createdAt).fromNow()}</span>
                    </div>
                    <hr className="bg-primary my-1" />
                </div>
            ))}
        </div>
    );
};

export default Videos;
