import Link from "next/link";
import moment from "moment";

const AlertPlaylist = ({ notification }) => {
    return (
        <div className="text-light my-2 p-2">
            <div className="d-flex align-items-center justify-content-between">
                <Link href={`/channel/${notification.from_user._id}`}>
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
                            <b>{notification.from_user.name}</b> has published new playlist{" "}
                            <img
                                src="/static/icons/playlist.png"
                                style={{ width: "22px", height: "22px" }}
                            />
                        </span>
                    </a>
                </Link>
                <Link href={`/playlist/${notification.playlist_id}`}>
                    <a title="go to playlist">
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

export default AlertPlaylist;
