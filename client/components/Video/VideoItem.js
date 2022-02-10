import Link from "next/link";
import moment from "moment";

const VideoItem = ({ video, wordLength, canManage, onDeleteVideoHandler }) => {
    const minute = parseInt(video.video_length / 60);
    const second = parseInt(video.video_length % 60);

    return (
        <div
            className="d-flex px-3 pb-2 flex-column"
        >
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
                    <Link href={`/watch?v=${video._id}`}>
                        <p className="fs-5 fw-bold ms-2 text-light" style={{ cursor: "pointer" }}>
                            {video.title.length > wordLength
                                ? video.title.slice(0, wordLength - 2) + "..."
                                : video.title}
                        </p>
                    </Link>
                </div>
                {canManage && (
                    <div>
                        <Link href={`/video/edit/${video._id}`}>
                            <a>
                                <img
                                    src="/static/icons/edit.png"
                                    style={{
                                        width: "30px",
                                        height: "30px",
                                        objectFit: "cover",
                                    }}
                                />
                            </a>
                        </Link>
                        <a className="ms-1" style={{ cursor: "pointer" }} onClick={() => onDeleteVideoHandler(video._id)}>
                            <img
                                src="/static/icons/trash.png"
                                style={{
                                    width: "30px",
                                    height: "30px",
                                    objectFit: "cover",
                                }}
                            />
                        </a>
                    </div>
                )}
            </div>
            <div className="d-flex align-items-end ms-auto">
                <span className="badge bg-secondary text-light me-2 px-2">
                    {minute + ":" + (second < 10 ? "0" + second : second)}
                </span>
                <span className="text-primary me-2">{video.view} views</span>
                <span className="text-secondary">{moment(video.createdAt).fromNow()}</span>
            </div>
            <hr className="bg-primary my-1" />
        </div>
    );
};

export default VideoItem;
