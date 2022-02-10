import LeftNav from "../../components/LeftNav";
import { Modal, Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import Resizer from "react-image-file-resizer";
import axios from "axios";
import { toast } from "react-toastify";
import Router from "next/router";
import Playlists from "../../components/Playlist/Playlists";
import Head from "next/head";

const playlistPage = () => {
    const [enteredData, setEnteredData] = useState({
        title: "",
        image: "",
        description: "",
        paid: false,
        price: 0,
    });
    const [show, setShow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [newPlaylist, setNewPlaylist] = useState({});
    const { title, image, description, paid, price } = enteredData;

    const handleShow = () => setShow(true);
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
        setEnteredData({
            ...enteredData,
            image,
        });
    };

    const createPlaylistHandler = async () => {
        if (title.trim().length === 0) {
            toast.error("title required");
        } else if (description.trim().length === 0) {
            toast.error("description required");
        } else if (description.trim().length > 512) {
            toast.error("description must be less than 512 characters");
        } else if (image === "") {
            toast.error("image required");
        } else if (![0, 59, 99, 159, 199, 259, 299].includes(price)) {
            toast.error("Price must be only 59, 99, 159, 199, 259 and 299");
        } else {
            setIsLoading(true);
            try {
                const { data } = await axios.post("/api/playlist/create", {
                    title,
                    description,
                    image,
                    paid,
                    price,
                });
                if(data.redirect) {
                    toast("Complete your bank information for create paid playlist")
                    return Router.push("/channel/edit");
                }
                setNewPlaylist(data.playlist);
                toast(data.message);
                setEnteredData({
                    title: "",
                    description: "",
                    image: "",
                    paid: false,
                    price: 0
                });
                setShow(false);
            } catch (e) {
                toast.error(e.response.data);
            }
            setIsLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Dotube | Playlists</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <LeftNav>
                <Modal show={show} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Create playlist</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form>
                            <span>Title</span>
                            <input
                                type="text"
                                className="form-control"
                                value={title}
                                onChange={(e) =>
                                    setEnteredData({ ...enteredData, title: e.target.value })
                                }
                            />
                            <span className="mt-2">Cover image</span>
                            <input
                                type="file"
                                className="form-control"
                                accept="image/*"
                                onChange={imageChangeHandler}
                            />
                            <span className="mt-2">Description {description.length} / 512</span>
                            <textarea
                                className="form-control"
                                style={{ height: "100px" }}
                                onChange={(e) =>
                                    setEnteredData({ ...enteredData, description: e.target.value })
                                }
                                value={description}
                                maxLength={512}
                            ></textarea>
                            <div className="form-check form-switch mt-2">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    onClick={() => {
                                        if(paid) {
                                            setEnteredData({ ...enteredData, price: 0, paid: !paid })
                                        }else {
                                            setEnteredData({ ...enteredData, price: 59, paid: !paid })
                                        }
                                        
                                    }}
                                />
                                <label className="form-check-label">Paid?</label>
                            </div>
                            {paid && (
                                <select
                                    className="form-select mt-2"
                                    onChange={(e) =>
                                        setEnteredData({
                                            ...enteredData,
                                            price: parseInt(e.target.value),
                                        })
                                    }
                                    defaultValue={59}
                                >
                                    <option value={59}>59 THB</option>
                                    <option value={99}>99 THB</option>
                                    <option value={159}>159 THB</option>
                                    <option value={199}>199 THB</option>
                                    <option value={259}>259 THB</option>
                                    <option value={299}>299 THB</option>
                                </select>
                            )}
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="primary"
                            onClick={createPlaylistHandler}
                            disabled={isLoading || !title || !image || !description}
                        >
                            {isLoading ? "Creating.." : "Create"}
                        </Button>
                    </Modal.Footer>
                </Modal>
                <div className="w-100 mx-auto text-light">
                    <p className="display-3">My Playlist</p>
                    <button className="btn btn-outline-primary px-3" onClick={handleShow}>
                        Create playlist
                    </button>
                    <hr className="bg-light" />
                    <Playlists newPlaylist={newPlaylist} />
                </div>
            </LeftNav>
        </>
    );
};

export default playlistPage;
