import axios from "axios";
import { useState, useEffect } from "react";
import moment from "moment";
import { Modal } from "react-bootstrap";
import Link from "next/link";

const Processing = () => {
    const [list, setList] = useState([]);
    const [displayData, setDisplayData] = useState({
        buyer: "",
        confirm: false,
        owner_playlist: "",
        playlist: {
            image: {},
            price: 0,
            title: "",
            _id: "",
        },
        slip_image: {},
    });
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);

    useEffect(async () => {
        try {
            const { data } = await axios.get("/api/payment/processing");
            setList(data);
        } catch (e) {
            console.log(e);
        }
    }, []);

    const viewPaymentHandler = (id) => {
        const index = list.findIndex((val) => val._id == id);
        setDisplayData(list[index]);
        setShow(true);
    };

    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Payment Information</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {displayData.playlist === null ? (
                        <p className="fs-5 fw-bold text-danger text-center">
                            Playlist has been deleted.
                        </p>
                    ) : (
                        <Link href={`/playlist/${displayData.playlist._id}`}>
                            <div
                                className="d-flex align-items-center justify-content-center mb-3"
                                style={{ cursor: "pointer" }}
                            >
                                <img
                                    src={displayData.playlist.image.url}
                                    style={{
                                        width: "50px",
                                        height: "50px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                    }}
                                />
                                <span className="fs-5 fw-bold text-secondary ms-2">
                                    {displayData.playlist.title}
                                </span>
                            </div>
                        </Link>
                    )}
                    <div className="w-100 d-flex">
                        <img
                            src={displayData.slip_image.url}
                            style={{ width: "50%", height: "300px", objectFit: "cover" }}
                        />
                        <div className="ms-2">
                            <p>
                                Price <b>{displayData.playlist === null ? "-" : displayData.playlist.price} THB</b>
                            </p>
                            <p>
                                Bought at{" "}
                                <b>{moment(displayData.createdAt).format("d/MM/YYY HH:mm")}</b>
                            </p>
                            <p>
                                Status{" "}
                                {!displayData.cancel && (
                                    <span className="text-warning fw-bold">Waiting</span>
                                )}
                                {displayData.cancel && (
                                    <span className="text-danger fw-bold">Canceled</span>
                                )}
                            </p>
                            {displayData.cancel && (
                                <p className="text-danger fw-bold">{displayData.reason}</p>
                            )}
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
            <div className="mx-5 mt-3">
                <p className="display-4 text-light">Processing</p>
                <hr className="bg-primary" />
                <table className="table table-dark table-striped">
                    <thead>
                        <tr>
                            <th scope="col">Playlist</th>
                            <th scope="col">Price</th>
                            <th scope="col">Bought at</th>
                            <th scope="col">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((l, index) => (
                            <tr
                                key={index}
                                style={{ cursor: "pointer" }}
                                onClick={() => viewPaymentHandler(l._id)}
                            >
                                <td>{l.playlist === null ? <span className="text-danger">Deleted</span> : l.playlist.title}</td>
                                <td>{l.playlist === null ? "-": l.playlist.price} THB</td>
                                <td>{moment(l.createdAt).format("d/MM/YYY HH:mm")}</td>
                                <td>
                                    {!l.cancel && (
                                        <span className="text-warning">Waiting..</span>
                                    )}
                                    {l.cancel && (
                                        <span className="text-danger">Canceled</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default Processing;
