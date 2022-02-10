import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import LeftNav from "../../../components/Admin/LeftNav";
import Link from "next/link";
import {toast} from "react-toastify";
import moment from "moment";
import Head from "next/head";

const UserChannel = () => {
    const router = useRouter();
    const [info, setInfo] = useState({});
    const [videos, setVideos] = useState([]);
    const [playlists, setPlaylists] = useState([]);

    const getInformationHandler = async (id) => {
        try {
            const { data } = await axios.get(`/api/admin/channel/${id}`);
            setInfo(data.user);
        } catch (e) {
            if (e.response.status === 404) {
                router.back();
            }
        }
    };

    const fetchVideosHandler = async (id) => {
        try {
            const { data } = await axios.get(`/api/admin/channel-videos/${id}`);
            setVideos(data);
        } catch (e) {
        }
    };

    const fetchPlaylistsHandler = async (id) => {
        try {
            const { data } = await axios.get(`/api/admin/channel-playlists/${id}`);
            setPlaylists(data);
        } catch (e) {
        }
    };

    useEffect(async () => {
        const { id } = router.query;
        if (id) {
            getInformationHandler(id);
            fetchVideosHandler(id);
            fetchPlaylistsHandler(id);
        }
    }, [router]);

    const deleteChannelHandler = async () => {
        const { id } = router.query;
        if(id) {
            const answer = window.confirm('Are you sure you want to delete thi channel');
            if(answer) {
                try {
                    const {data} = await axios.delete(`/api/admin/channel/${id}`)
                    toast(data.message);
                    router.back();
                }catch(e) {
                    toast.error(e.data.response);
                }
            }
        }
    };

    return (
        <>
            <Head>
                <title>Dotube | {info.name}</title>
                <meta name="description" content="Dotube" />
            </Head>
            <LeftNav>
                <div className="pt-2 px-4">
                    <div className="d-flex justify-content-between">
                        <div className="d-flex">
                            <div className="d-flex flex-column align-items-center mb-3">
                                <img
                                    src={info && info.profile_image && info.profile_image.url}
                                    style={{
                                        width: "200px",
                                        height: "200px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                    }}
                                />
                                <span className="badge text-light bg-secondary px-3 py-2 mt-4 me-auto">
                                    {info.subscribers} Subscribers
                                </span>
                            </div>
                            <div className="ms-3 text-light">
                                <p className="fs-3 fw-bold">{info.name}</p>
                                <p className="text-secondary">
                                    Email <b className="text-light">{info.email}</b>
                                </p>
                                <p className="text-secondary">
                                    Bank account name{" "}
                                    <b className="text-light">{info.account_name}</b>
                                </p>
                                <p className="text-secondary">
                                    Bank <b className="text-light">{info.bank}</b>
                                </p>
                                <p className="text-secondary">
                                    Bank account number{" "}
                                    <b className="text-light">{info.bank_number}</b>
                                </p>
                            </div>
                        </div>
                        <div>
                            <button className="btn btn-danger" onClick={deleteChannelHandler}>Delete channel</button>
                        </div>
                    </div>
                </div>
                <hr className="bg-primary" />
                <div>
                    <div className="row">
                        <div
                            className="col-5 ms-5 me-3 mx-auto"
                            style={{ height: "340px", overflowY: "scroll" }}
                        >
                            <p className="fs-4 fw-bold text-secondary">Videos</p>
                            <hr className="bg-primary" />
                            <div>
                                {videos.map((video, index) => (
                                    <div key={index}>
                                        <Link href={`/admin/watch?v=${video._id}`}>
                                            <div
                                                className="p-2 d-flex align-items-center text-light"
                                                style={{ cursor: "pointer" }}
                                            >
                                                <div style={{ position: "relative" }}>
                                                    <img
                                                        src={video.image.url}
                                                        className="rounded"
                                                        style={{
                                                            width: "100px",
                                                            height: "80px",
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                    <span
                                                        className="badge text-light bg-dark"
                                                        style={{
                                                            position: "absolute",
                                                            bottom: "0",
                                                            right: "0",
                                                        }}
                                                    >
                                                        {parseInt(video.video_length / 60) +
                                                            ":" +
                                                            (parseInt(video.video_length % 60) < 10
                                                                ? "0" +
                                                                  parseInt(video.video_length % 60)
                                                                : parseInt(
                                                                      video.video_length % 60
                                                                  ))}
                                                    </span>
                                                </div>
                                                <div className="ms-2">
                                                    <span className="fs-5 fw-bold">
                                                        {video.title.length > 32
                                                            ? video.title.slice(0, 30) + ".."
                                                            : video.title}
                                                    </span>
                                                    <br />
                                                    <span className="text-primary">
                                                        {moment(video.createdAt).fromNow()}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="col-5 ms-5" style={{ height: "340px", overflowY: "scroll" }}>
                            <p className="fs-4 fw-bold text-secondary">Playlists</p>
                            <hr className="bg-primary" />
                            <div>
                                {playlists.map((playlist, index) => (
                                    <div key={index}>
                                        <Link href={`/admin/playlist/${playlist._id}`}>
                                            <div className="d-flex text-light p-2" style={{cursor: "pointer" }}>
                                                <div>
                                                    <img
                                                        src={playlist.image.url}
                                                        className="rounded"
                                                        style={{
                                                            width: "100px",
                                                            height: "80px",
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                </div>
                                                <div className="ms-2">
                                                    <span className="fs-5 fw-bold">
                                                        {playlist.title}
                                                    </span>
                                                    <br />
                                                    <span className="text-primary">
                                                        {moment(playlist.createdAt).fromNow()}
                                                    </span>
                                                    <br />
                                                    {playlist.paid ? (
                                                        <>
                                                            <span className="badge bg-danger">
                                                                Paid
                                                            </span>
                                                            <span className="badge bg-warning ms-2">
                                                                {playlist.price}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="badge bg-success">
                                                            Free
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </LeftNav>
        </>
    );
};

export default UserChannel;
