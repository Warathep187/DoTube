import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Videos from "./Videos";
import Link from "next/link";
import Playlists from "./Playlists";

const BottomList = () => {
    const router = useRouter();
    const [isShowVideos, setIsShowVideos] = useState(true);

    return (
        <div className="p-4 mx-auto">
            <div className="d-flex">
                    <button
                        className={`btn btn-outline-primary w-100 my-2 ${
                            isShowVideos && "bg-primary text-light"
                        }`}
                        onClick={() => setIsShowVideos(true)}
                    >
                        Videos
                    </button>
                    <button
                        className={`btn btn-outline-primary w-100 my-2 ${
                            !isShowVideos && "bg-primary text-light"
                        }`}
                        onClick={() => setIsShowVideos(false)}
                    >
                        Playlists
                    </button>
            </div>
            <div>{isShowVideos && <Videos />}{!isShowVideos && <Playlists onlyDisplay={true} />}</div>
        </div>
    );
};

export default BottomList;
