import Link from "next/link";
import moment from "moment";

const AlertVideo = ({ notification }) => {
    return (
        <div className="text-light my-2 p-2">
            <div className="d-flex align-items-center justify-content-between">
                <Link href={notification.from_user._id}>
                    <a style={{ textDecoration: "none" }} className="text-light w-50">
                        <img
                            src={notification.from_user.profile_image.url}
                            style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                objectFit: "cover",
                            }}
                        />
                        <span className="ms-2">
                            <b>{notification.from_user.name}</b> has uploaded new video{" "}
                            <img
                                src="/static/icons/upload.png"
                                style={{ width: "25px", height: "25px" }}
                            />
                        </span>
                    </a>
                </Link>
                <Link href={`/watch?v=${notification.video_id}`}>
                    <a title="go to video">
                        <img src="/static/icons/arrow-right.png" />
                    </a>
                </Link>
            </div>
            <div className="text-end">
                <span className="text-primary">{moment(notification.createdAt).fromNow()}</span>
            </div>
            <hr className="bg-primary" />
        </div>
    );
};

export default AlertVideo;
