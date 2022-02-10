import Link from "next/link";

const PlaylistBox = ({ playlist, purchased }) => {
    return (
        <div className="p-1 rounded-2 border p-2 mb-3 shadow" title="View playlist">
            <Link href={`/playlist/${playlist._id}`}>
                <a className="text-decoration-none">
                    <p className="fs-5 fw-bold">{playlist.title}</p>
                    <span className="badge text-break text-wrap text-start mb-3">
                        {playlist.description.length > 128
                            ? playlist.description.slice(0, 126) + ".."
                            : playlist.description}
                    </span>
                    {purchased ? (
                        <div className="d-flex">
                            <span className="badge text-light bg-success me-auto">purchased</span>
                        </div>
                    ) : (
                        <div className="d-flex justify-content-between">
                            {playlist.paid ? (
                                <span className="badge text-light bg-danger me-auto">paid</span>
                            ) : (
                                <span className="badge text-light bg-success me-auto">free</span>
                            )}
                            {playlist.paid && (
                                <div>
                                    <span className="badge text-light bg-warning me-2">
                                        {playlist.price} THB
                                    </span>
                                    <span className="badge text-light bg-secondary">
                                        bought {playlist.bought}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </a>
            </Link>
        </div>
    );
};

export default PlaylistBox;
