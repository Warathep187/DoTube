import { useEffect, useState } from "react";
import LeftNav from "../components/LeftNav";
import SearchBar from "../components//Search/SearchBar";
import axios from "axios";
import { useRouter } from "next/router";
import Link from "next/link";
import moment from "moment";
import Head from "next/head";

const search = () => {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [videos, setVideos] = useState([]);

    useEffect(async () => {
        try {
            const { data } = await axios.get("/api/check-user");
        } catch (e) {
            if (e.response.status === 401) {
                router.replace("/login");
            } else {
                router.replace("/");
            }
        }
    }, []);

    useEffect(async () => {
        const { key } = router.query;
        if (key) {
            try {
                const { data } = await axios.post("/api/video/search-page", { key });
                setUsers(data.users);
                setPlaylists(data.playlists);
                setVideos(data.videos);
            } catch (e) {
                console.log(e);
            }
        }
    }, [router]);

    const usersContent = users.map((user, index) => (
        <div
            className="text-light my-2 shadow-sm w-50 rounded-3 py-1 px-3"
            key={index}
            style={{ cursor: "pointer" }}
        >
            <Link href={`/channel/${user._id}`}>
                <div className="d-flex align-items-center">
                    <img
                        src={user.profile_image.url}
                        style={{
                            width: "70px",
                            height: "70px",
                            objectFit: "cover",
                            borderRadius: "50%",
                        }}
                    />
                    <div>
                        <p className="fs-5 fw-bold ms-2">
                            {user.name}
                            <br />
                            <span className="badge text-secondary mt-2">
                                {user.subscribers} subscribers
                            </span>
                        </p>
                    </div>
                </div>
            </Link>
        </div>
    ));

    const playlistsContent = playlists.map((playlist, index) => (
        <div
            className="text-light my-2 shadow-sm w-50 rounded-3 py-1 px-3"
            key={index}
            style={{ cursor: "pointer" }}
        >
            <Link href={`/playlist/${playlist._id}`}>
                <div className="d-flex">
                    <div className="d-flex me-2" style={{ position: "relative" }}>
                        <img
                            src={playlist.image.url}
                            style={{ width: "250px", height: "180px", objectFit: "cover" }}
                            className="rounded-2"
                        />
                    </div>
                    <div>
                        <span className="fs-5">
                            {playlist.title}
                            <br />
                            <span className="badge text-secondary">
                                <span className="text-primary">
                                    {moment(playlist.createdAt).fromNow()}
                                </span>
                            </span>
                        </span>
                        <div className="mt-2">
                            <Link href={`/channel/${playlist.createdBy._id}`}>
                                <div className="d-flex align-items-center">
                                    <img
                                        src={playlist.createdBy.profile_image.url}
                                        style={{
                                            width: "35px",
                                            height: "35px",
                                            objectFit: "cover",
                                            borderRadius: "50%",
                                        }}
                                    />
                                    <span className="badge text-secondary">
                                        {playlist.createdBy.name}
                                    </span>
                                </div>
                            </Link>
                        </div>
                        <div className="mt-4">
                            {playlist.paid ? (
                                <>
                                    <span className="badge bg-danger">paid</span>
                                    <span className="badge bg-warning ms-1">
                                        {playlist.price} THB
                                    </span>
                                </>
                            ) : (
                                <span className="badge bg-success">free</span>
                            )}
                            <span className="badge bg-secondary ms-1">
                                bought {playlist.bought}
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    ));

    const videosContent = videos.map((video, index) => (
        <div
            className="text-light my-2 shadow-sm w-50 rounded-3 py-1 px-3"
            key={index}
            style={{ cursor: "pointer" }}
        >
            <Link href={`/watch?v=${video._id}`}>
                <div className="d-flex">
                    <div className="d-flex me-2" style={{position: 'relative'}}>
                        <img
                            src={video.image.url}
                            style={{ width: "250px", height: "180px", objectFit: "cover" }}
                            className="rounded-2"
                        />
                        <span className="badge bg-dark text-light p-2" style={{position: "absolute", bottom: "0", right: "0"}}>
                            {parseInt(video.video_length / 60) +
                                ":" +
                                (parseInt(video.video_length % 60) <
                            10
                                ? "0" + parseInt(video.video_length % 60)
                                : parseInt(video.video_length % 60))}
                        </span>
                    </div>
                    <div>
                        <span className="fs-5">
                            {video.title}
                            <br />
                            <span className="badge text-secondary">
                                {video.view} views{" "}
                                <span className="text-primary">
                                    {moment(video.createdAt).fromNow()}
                                </span>
                            </span>
                        </span>
                        <div className="mt-3">
                            <Link href={`/channel/${video.uploadedBy._id}`}>
                                <div className="d-flex align-items-center">
                                    <img
                                        src={video.uploadedBy.profile_image.url}
                                        style={{
                                            width: "35px",
                                            height: "35px",
                                            objectFit: "cover",
                                            borderRadius: "50%",
                                        }}
                                    />
                                    <span className="badge text-secondary">
                                        {video.uploadedBy.name}
                                    </span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    ));

    return (
        <LeftNav>
            <Head>
                <title>Dotube | {router.query.key ? router.query.key : ""}</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <SearchBar />
            <div className="px-3 pb-4">
                <div className="px-3">
                    <span className="fs-4 fw-bold text-secondary">Found {users.length} users</span>
                    <hr className="bg-primary" />
                    {usersContent}
                </div>
                <div className="px-3">
                    <span className="fs-4 fw-bold text-secondary">
                        Found {playlists.length} playlists
                    </span>
                    <hr className="bg-primary" />
                    {playlistsContent}
                </div>
                <div className="mt-3 px-3">
                    <span className="fs-4 fw-bold text-secondary">
                        Found {videos.length} videos
                    </span>
                    <hr className="bg-primary" />
                    {videosContent}
                </div>
            </div>
        </LeftNav>
    );
};

export default search;
