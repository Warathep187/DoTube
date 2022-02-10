import axios from "axios";
import { useState, useEffect } from "react";
import Link from "next/link";

const Purchased = () => {
    const [list, setList] = useState([]);

    useEffect(async() => {
        try {
            const { data } = await axios.get("/api/payment/purchased");
            setList(data.playlists);
            console.log(data.playlists);
        } catch (e) {
            console.log(e);
        }
        return () => {}
    }, []);

    return (
        <div className="mx-5 mt-3">
            <p className="display-4 text-light">Purchased list</p>
            <hr className="bg-primary" />
            <table className="table table-dark table-striped table-hover">
                <thead>
                    <tr>
                        <th scope="col">Playlist</th>
                        <th scope="col">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {list.map((l, index) => (
                        <tr key={index} style={{ cursor: "pointer" }}>
                            <td className="p-2">
                                <Link href={`/playlist/${l._id}`}>
                                    <a className="text-light text-decoration-none">
                                        <img
                                            src={l.image.url}
                                            style={{
                                                width: "50px",
                                                height: "50px",
                                                borderRadius: "50%",
                                                objectFit: "cover",
                                            }}
                                        />
                                        <span className="fs-5 fw-bold ms-2">{l.title.length>32 ? l.title.slice(0, 30)+".." : l.title}</span>
                                    </a>
                                </Link>
                            </td>
                            <td><span className="text-success fs-5 fw-bold">Purchased</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Purchased;
