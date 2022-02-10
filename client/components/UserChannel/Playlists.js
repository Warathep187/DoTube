import { useState, useEffect } from "react";
import Playlist from "../Playlist/Playlist";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import { useRouter } from "next/router";

const Playlists = ({ onlyDisplay }) => {
    const router = useRouter();
    const [playlists, setPlaylists] = useState([]);
    const [management, setManagement] = useState({
        limit: 5,
        skip: 0,
    });
    const [isEmpty, setIsEmpty] = useState(false);

    const { limit, skip } = management;

    const fetchPlaylistHandler = async () => {
        try {
            const { data } = await axios.post("/api/playlist/get-user-playlists", {
                id: router.query.id,
                limit,
                skip,
            });
            if (data.length < 5) {
                setIsEmpty(true);
            }
            setManagement({
                ...management,
                skip: [...playlists, ...data].length,
            });
            setPlaylists(data);
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        if (router.query.id) {
            fetchPlaylistHandler();
        }
    }, [router]);

    return (
        <div className="text-light p-3">
            <InfiniteScroll
                dataLength={playlists.length}
                next={fetchPlaylistHandler}
                hasMore={!isEmpty}
                loader={
                    <div className="text-center">
                        <img src="/static/images/loading.gif" />
                    </div>
                }
                endMessage={""}
            >
                {playlists.map((playlist, index) => (
                    <Playlist key={index} onlyDisplay={onlyDisplay === true} playlist={playlist} />
                ))}
            </InfiniteScroll>
        </div>
    );
};

export default Playlists;
