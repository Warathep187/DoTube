import { useState, useEffect } from "react";
import LeftNav from "../../../components/Admin/LeftNav";
import axios from "axios";
import { useRouter } from "next/router";
import moment from "moment";
import Link from "next/link";
import { toast } from "react-toastify";
import Videos from "../../../components/Admin/Playlist/Videos";
import Head from "next/head";

const PlaylistPage = () => {
    const router = useRouter();
    const [info, setInfo] = useState({
        createdBy: {},
    });

    useEffect(async () => {
        const { id } = router.query;
        if (id) {
            try {
                const { data } = await axios.get("/api/admin/playlist/" + id);
                setInfo(data);
            } catch (e) {
                console.log(e);
            }
        }
    }, [router]);

    const deletePlaylistHandler = async () => {
        const answer = window.confirm("Are you sure you want to delete this playlist?");
        if (answer) {
            const { id } = router.query;
            try {
                const { data } = await axios.delete("/api/admin/delete-playlist/" + id);
                toast(data.message);
                router.back();
            } catch (e) {
                toast.error(e.response.data);
            }
        }
    };

    return (
        <LeftNav>
            <Head>
                <title>Dotube | {info.title}</title>
                <meta name="description" content="Dotube" />
            </Head>
            <div className="mx-auto w-75 text-wrap text-light">
                <div className="d-flex mb-2">
                    <div>
                        <img
                            src={info && info.image && info.image.url}
                            style={{ width: "250px", height: "220px", objectFit: "cover" }}
                            className="rounded-2"
                        />
                    </div>
                    <div className="ms-3 w-100">
                        <p className="display-5">{info && info.title}</p>
                        <p>{info && info.description}</p>
                        <div className="d-flex align-items-center justify-content-between text-end mt-3">
                            <div>
                                <Link href={`/admin/channel/${info && info.createdBy._id}`}>
                                    <a className="text-decoration-none text-secondary">
                                        <img
                                            src={
                                                info &&
                                                info.createdBy &&
                                                info.createdBy.profile_image &&
                                                info.createdBy.profile_image.url
                                            }
                                            style={{
                                                width: "40px",
                                                height: "40px",
                                                borderRadius: "50%",
                                                objectFit: "cover",
                                            }}
                                        />
                                        <span className="badge">{info && info.createdBy.name}</span>
                                    </a>
                                </Link>
                            </div>
                            <span>
                                Created at{" "}
                                <span className="text-primary">
                                    {moment(info && info.createdAt).format("YYYY-MM-DD")}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            {info.paid ? (
                                <div>
                                    <span className="badge bg-danger">paid</span>
                                    <span className="badge bg-success mx-2">{info.price} THB</span>
                                    <span className="badge bg-secondary">Bought {info.bought}</span>
                                </div>
                            ) : (
                                <span className="badge bg-success">free</span>
                            )}
                        </div>
                        <div>
                            {info.published ? (
                                <span className="fw-bold text-success">published</span>
                            ) : (
                                <span className="fw-bold text-warning">preparing</span>
                            )}
                            <a
                                className="ms-1"
                                style={{ cursor: "pointer" }}
                                onClick={deletePlaylistHandler}
                            >
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
                    </div>
                </div>
            </div>
            <hr className="bg-primary my-3" />
            <Videos />
        </LeftNav>
    );
};

export default PlaylistPage;
