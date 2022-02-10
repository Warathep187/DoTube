import moment from "moment";
import Link from "next/link";

const Playlist = ({ playlist, onDeleteHandler, onlyDisplay }) => {
    return (
        <div className="my-2 px-4">
            <div className="d-flex" style={{ cursor: "pointer" }}>
                <img
                    src={playlist && playlist.image && playlist.image.url}
                    style={{ width: "150px", height: "120px", objectFit: "cover" }}
                />

                <div className="w-100 ms-3">
                    <div className={onlyDisplay ? "" : "d-flex justify-content-between"}>
                        <Link href={`/playlist/${playlist._id}`}>
                            <p className="fs-4 fw-bold">{playlist.title}</p>
                        </Link>
                        {!onlyDisplay && (
                            <div className="d-flex">
                                <Link href={`/playlist/edit/${playlist._id}`}>
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
                                <a className="ms-1" onClick={() => onDeleteHandler(playlist._id)}>
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
                    <div className="d-flex justify-content-between w-100">
                        <div>
                            {playlist.paid ? (
                                <>
                                    <span className="badge bg-danger">paid</span>
                                    <span className="badge text-danger">{playlist.price} THB</span>
                                    <span className="badge text-secondary">
                                        Bought {playlist.bought}
                                    </span>
                                </>
                            ) : (
                                <span className="badge bg-success">free</span>
                            )}
                            {playlist.published ? (
                                <span className="badge bg-primary ms-2">published</span>
                            ) : (
                                <span className="badge bg-warning ms-2">preparing</span>
                            )}
                        </div>
                        <div>
                            <p>
                                created at {moment(playlist.createdAt).format("YYYY/MM/DD HH:mm")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <hr className="bg-primary" />
        </div>
    );
};

export default Playlist;
