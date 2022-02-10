import { Modal } from "react-bootstrap";
import { useState } from "react";
import axios from "axios";
import Subscriber from "../Subscribers/Subscriber";
import Router from "next/router";

const TopInfo = ({ data }) => {
    const [subscriberFetched, setSubscriberFetched] = useState([]);
    const [showSubscribers, setShowSubscribers] = useState(false);

    const { name, profile_image, subscribers } = data;

    const fetchSubscribers = async () => {
        setShowSubscribers(true);
        try {
            const { data } = await axios.get("/api/channel/subscribers");
            setSubscriberFetched(data.subscribers);
        } catch (e) {
            toast(e.response.data);
        }
    };

    return (
        <>
            <Modal show={showSubscribers} onHide={() => setShowSubscribers(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>SUBSCRIBERS</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ height: "500px", overflowY: "scroll" }}>
                    {subscriberFetched.map((subscriber, index) => (
                        <Subscriber key={index} subscriber={subscriber} />
                    ))}
                </Modal.Body>
            </Modal>
            <div className="w-100 text-light">
                <div className="mx-auto d-flex align-items-center">
                    <img
                        src={`${profile_image.url}`}
                        style={{
                            width: "100px",
                            height: "100px",
                            borderRadius: "50%",
                            objectFit: "cover",
                        }}
                    />
                    <span className="mx-3 fs-2 fw-bold">{name}</span>
                    <img
                        src="/static/icons/edit.png"
                        title="edit name"
                        style={{ cursor: "pointer" }}
                        onClick={() => Router.push("/channel/edit")}
                    />
                </div>
                <div>
                    <p className="fs-3 mt-2">
                        <span
                            className="badge bg-primary"
                            style={{ cursor: "pointer" }}
                            onClick={() => fetchSubscribers()}
                        >
                            {subscribers.length} Subscribers
                        </span>
                    </p>
                </div>
                <hr />
            </div>
        </>
    );
};

export default TopInfo;
