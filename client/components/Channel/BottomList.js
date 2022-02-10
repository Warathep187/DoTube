import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Videos from "../Video/Videos";
import Link from "next/link";
import Playlists from "../../components/Playlist/Playlists";

const BottomList = () => {
    const router = useRouter();
    const [isShowVideos, setIsShowVideos] = useState(true);

    useEffect(() => {
        if (router.query.show) {
            if (router.query.show === "video") {
                setIsShowVideos(true);
            } else if (router.query.show === "playlist") {
                setIsShowVideos(false);
            } else {
                setIsShowVideos(true);
            }
        }
    }, [router.query.show]);

    return (
        <div className="p-4 mx-auto">
            <div className="d-flex">
                <Link href="/channel?show=video">
                    <button
                        className={`btn btn-outline-primary w-100 my-2 ${
                            isShowVideos && "bg-primary text-light"
                        }`}
                    >
                        Videos
                    </button>
                </Link>
                <Link href="/channel?show=playlist">
                    <button
                        className={`btn btn-outline-primary w-100 my-2 ${
                            !isShowVideos && "bg-primary text-light"
                        }`}
                    >
                        Playlists
                    </button>
                </Link>
            </div>
            <div>{isShowVideos && <Videos />}{!isShowVideos && <Playlists onlyDisplay={true} />}</div>
        </div>
    );
};

export default BottomList;
