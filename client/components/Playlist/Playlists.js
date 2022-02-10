import { useState, useEffect } from "react";
import Playlist from "./Playlist";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import { toast } from "react-toastify";

const Playlists = ({ onlyDisplay, newPlaylist }) => {
    const [playlists, setPlaylists] = useState([]);
    const [management, setManagement] = useState({
        limit: 5,
        skip: 0,
    });
    const [isEmpty, setIsEmpty] = useState(false);

    const { limit, skip } = management;

    useEffect(() => {
        if (newPlaylist) {
            setPlaylists([newPlaylist, ...playlists]);
        }
    }, [newPlaylist]);

    const fetchPlaylistHandler = async () => {
        try {
            const { data } = await axios.post("/api/playlist/playlists", { limit, skip });
            if (data.length < 5) {
                setIsEmpty(true);
            }
            setManagement({
                ...management,
                skip: [...playlists, ...data].length,
            });
            setPlaylists([...playlists, ...data]);
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        fetchPlaylistHandler();
    }, []);

    const deleteHandler = async (id) => {
        const answer = window.confirm("Are you sure you want to delete this playlist?");
        if (answer) {
            try {
                const { data } = await axios.delete(`/api/playlist/${id}`);
                const filtered = playlists.filter((val) => val._id !== id);
                setPlaylists(filtered);
            } catch (e) {
                toast.error(e.response.data);
            }
        }
    };

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
                    <Playlist
                        onDeleteHandler={deleteHandler}
                        key={index}
                        onlyDisplay={onlyDisplay === true}
                        playlist={playlist}
                    />
                ))}
            </InfiniteScroll>
        </div>
    );
};

export default Playlists;
