import axios from "axios";
import { useState, useEffect } from "react";
import Link from "next/link";
import moment from "moment";

const PlaylistSelling = () => {
    const [list, setList] = useState([]);

    useEffect(async () => {
        try {
            const { data } = await axios.get("/api/payment/selling");
            setList(data);
            console.log(data);
        } catch (e) {
            console.log(e);
        }
    }, []);

    return (
        <div className="mx-5 mt-3">
            <p className="display-4 text-light">Playlist selling</p>
            <hr className="bg-primary" />
            {list.map((l, index) => (
                <div key={index} className="p-3 shadow rounded-2 my-2">
                    <div>
                        <Link href={`/channel/${l.buyer._id}`}>
                            <a className="text-light text-decoration-none">
                                <img
                                    src={l.buyer.profile_image.url}
                                    style={{
                                        width: "50px",
                                        height: "50px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                    }}
                                />
                                <span className="ms-2">{l.buyer.name} bought your playlist </span>
                            </a>
                        </Link>
                        <span className="text-light"><Link href={`/playlist/${l.playlist._id}`}><a>( {l.playlist.title} )</a></Link></span>
                    </div>
                    <div className="text-end text-light">
                        <span>{moment(l.updatedAt).fromNow()}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PlaylistSelling;
