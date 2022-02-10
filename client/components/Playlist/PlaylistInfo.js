import moment from "moment";
import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Link from "next/link";
import Resizer from "react-image-file-resizer";
import axios from "axios";

const PlaylistInfo = ({ info, purchased, isWaiting, setIsWaiting }) => {
    const {
        data: { _id },
    } = useSelector((state) => state.profileSlice);
    const [image, setImage] = useState("");
    const [show, setShow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const handleClose = () => setShow(false);

    const resizeFile = (file) =>
        new Promise((resolve) => {
            Resizer.imageFileResizer(
                file,
                300,
                300,
                "JPEG",
                100,
                0,
                (uri) => {
                    resolve(uri);
                },
                "base64"
            );
        });

    const imageChangeHandler = async (e) => {
        const file = e.target.files[0];
        const image = await resizeFile(file);
        setImage(image);
    };

    const buyButton =
        purchased === null ? (
            ""
        ) : purchased ? (
            <span className="fs-5 text-success">Purchased</span>
        ) : (
            <button className="btn btn-outline-success px-3" onClick={() => setShow(true)}>
                Buy now
            </button>
        );

    const createPaymentHandler = async () => {
        if(!image) {
            toast.error("Slip image is required");
        }else {
            setIsLoading(true);
            try {
                const {data} = await axios.post("/api/payment/create", {playlistId: info._id, image});
                toast(data.message);
                setIsWaiting(true);
                setShow(false);
                setImage("");
            }catch(e) {
                console.log(e);
                toast.error(e.response.data);
            }
            setIsLoading(false);
        }
    }

    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Buy Now</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="border ps-3 pt-2 rounded-2 mb-3">
                        <p className="fs-5">MR. DoTube Mojoji <br /> <span>Kasikorn <span className="fw-bold">123-456-7891-2</span></span></p>
                    </div>
                    <div>
                        <span>Upload slip image</span>
                        <input type="file" accept="image/*" className="form-control" onChange={imageChangeHandler} />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-primary" className="px-5" onClick={createPaymentHandler} disabled={isLoading || !image}>{isLoading ? "Buying": "Buy"}</Button>
                </Modal.Footer>
            </Modal>
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
                                <Link href={`/channel/${info && info.createdBy._id}`}>
                                    <a className="text-decoration-none text-secondary">
                                        <img
                                            src={info && info.createdBy.profile_image.url}
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
                        {info.paid ? (
                            <div>
                                <span className="badge bg-danger">paid</span>
                                <span className="badge bg-success mx-2">{info.price} THB</span>
                                <span className="badge bg-secondary">Bought {info.bought}</span>
                            </div>
                        ) : (
                            <span className="badge bg-success">free</span>
                        )}
                        {((info && info.createdBy._id || "") != _id && !isWaiting) && buyButton}
                        {isWaiting && <p className="fs-5 fw-bold text-warning">Waiting..</p>}
                    </div>
                </div>
            </div>
        </>
    );
};

export default PlaylistInfo;
