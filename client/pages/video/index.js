import { useEffect, useState } from "react";
import axios from "axios";
import Router from "next/router";
import VideoItem from "../../components/Video/VideoItem";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import Resizer from "react-image-file-resizer";
import InfiniteScroll from "react-infinite-scroll-component";
import LeftNav from "../../components/LeftNav";
import Videos from "../../components/Video/Videos";
import Head from "next/head";

const video = () => {
    const [enteredData, setEnteredData] = useState({
        title: "",
        description: "",
        video: {},
        image: "",
    });
    const { title, description, video, image } = enteredData;
    const [show, setShow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [newVideo, setNewVideo] = useState({});

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

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

    const videoChangeHandler = (e) => {
        const file = e.target.files[0];
        setEnteredData({
            ...enteredData,
            video: file,
        });
    };

    const uploadVideoHandler = async (e) => {
        e.preventDefault();
        if (title.trim() === "") {
            toast.error("title is require");
        } else if (description.length === 0) {
            toast.error("Description is require");
        } else if (description.length > 512) {
            toast.error("Description must be less than 512 characters");
        } else if (!video) {
            toast.error("Video clip is require");
        } else if (image.trim().length === "") {
            toast.error("Image is require");
        } else {
            setIsLoading(true);
            try {
                const videoData = new FormData();
                videoData.append("video", video);
                const videoResponse = await axios.post("/api/video/upload-video", videoData);
                uploadContentHandler(
                    {
                        key: videoResponse.data.Key,
                        url: videoResponse.data.Location,
                    },
                    videoResponse.data.sec
                );
            } catch (e) {
                toast(e.response.data);
            }
            setIsLoading(false);
        }
    };

    const uploadContentHandler = async (videoInfo, sec) => {
        try {
            const { data } = await axios.post("/api/video/upload-content", {
                title,
                description,
                video: videoInfo,
                sec,
                image,
            });
            toast(data.message);
            setEnteredData({
                title: "",
                description: "",
                video: {},
                image: "",
            });
            setNewVideo(data.video);
            setShow(false);
        } catch (e) {
            toast(e.response.data);
        }
    };

    return (
        <>
            <Head>
                <title>Dotube | Videos</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <LeftNav>
                <Modal show={show} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Upload video</Modal.Title>
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
                            <span className="mt-2">Video</span>
                            <input
                                type="file"
                                accept="video/*"
                                className="form-control"
                                onChange={videoChangeHandler}
                            />
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="primary"
                            disabled={isLoading || !title || !description || !image}
                            onClick={uploadVideoHandler}
                        >
                            {isLoading ? "Uploading.." : "Upload"}
                        </Button>
                    </Modal.Footer>
                </Modal>
                <div className="w-100 mx-auto text-light">
                    <p className="display-3">My videos</p>
                    <button className="btn btn-outline-primary px-3" onClick={handleShow}>
                        Upload video
                    </button>
                    <hr className="bg-light" />
                    <div className="p-3">
                        <Videos newVideo={newVideo} />
                    </div>
                </div>
            </LeftNav>
        </>
    );
};

export default video;
