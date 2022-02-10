import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import Head from "next/head";

const TopInfo = () => {
    const myData = useSelector((state) => state.profileSlice);
    const myId = myData.data._id;
    const router = useRouter();
    const [data, setData] = useState({
        _id: "",
        profile_image: {
            key: "",
            url: "",
        },
        name: "",
        subscribers: 0,
    });
    const { _id, name, profile_image, subscribers } = data;
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isAlert, setIsAlert] = useState(false);

    useEffect(async () => {
        const { id } = router.query;
        if (id) {
            try {
                const { data } = await axios.get(`/api/channel/${id}`);
                if (data.yourself) {
                    return router.replace("/channel");
                }
                setData({ ...data.channel, subscribers: data.subs });
                if (data.isSubscribed) {
                    setIsSubscribed(true);
                }
                if (data.isAlert) {
                    setIsAlert(data.isAlert);
                }
            } catch (e) {
                if (e.response.status === 404) {
                    router.push("/404");
                }
                console.log(e);
            }
        }
    }, [router.query]);

    const subscribeHandler = async () => {
        try {
            const res = await axios.post("/api/channel/subscribe", {
                userId: _id,
            });
            if (res.data.ok) {
                setIsSubscribed(true);
                setData({
                    ...data,
                    subscribers: ++subscribers,
                });
            }
        } catch (e) {
            toast(e.response.data);
        }
    };

    const unsubscribeHandler = async () => {
        try {
            const res = await axios.post("/api/channel/unsubscribe", {
                userId: _id,
            });
            if (res.data.ok) {
                setIsSubscribed(false);
                setData({
                    ...data,
                    subscribers: --subscribers,
                });
            }
        } catch (e) {
            toast(e.response.data);
        }
    };

    const alertHandler = async (channelId) => {
        try {
            setIsAlert(true);
            const res = await axios.put("/api/channel/alert", { channelId });
            toast(res.data.message);
        } catch (e) {
            toast.error(e.response.data);
            setIsAlert(false);
        }
    };

    const removeAlertHandler = async (channelId) => {
        try {
            setIsAlert(false);
            const res = await axios.put("/api/channel/remove-alert", { channelId });
            toast(res.data.message);
        } catch (e) {
            toast.error(e.response.data);
            setIsAlert(true);
        }
    };

    return (
        <>
            <Head>
                <title>Dotube | {name}</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <div className="w-100 text-light px-3">
                <div className="mx-auto d-flex align-items-center">
                    <img
                        src={profile_image.url}
                        style={{
                            width: "100px",
                            height: "100px",
                            borderRadius: "50%",
                            objectFit: "cover",
                        }}
                    />
                    <span className="mx-3 fs-2 fw-bold">{name}</span>
                    <span>
                        {isAlert ? (
                            <img
                                src="/static/icons/bell-on.png"
                                style={{ cursor: "pointer", width: "45px" }}
                                onClick={() => removeAlertHandler(_id)}
                            />
                        ) : (
                            <img
                                src="/static/icons/bell-off.png"
                                style={{ cursor: "pointer", width: "45px" }}
                                onClick={() => alertHandler(_id)}
                            />
                        )}
                    </span>
                </div>
                <div className="d-flex align-items-center mt-3 justify-content-between">
                    <div>
                        <p className="fs-4 fw-bold text-secondary">{subscribers} Subscribers</p>
                    </div>
                    <div>
                        {isSubscribed ? (
                            <button className="btn btn-success px-3" onClick={unsubscribeHandler}>
                                Subscribed
                            </button>
                        ) : (
                            <button
                                className="btn btn-outline-primary px-3"
                                onClick={subscribeHandler}
                            >
                                Subscribe
                            </button>
                        )}
                    </div>
                </div>
                <hr />
            </div>
        </>
    );
};

export default TopInfo;
