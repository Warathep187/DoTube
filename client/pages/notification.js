import { useState, useEffect } from "react";
import LeftNav from "../components/LeftNav";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import Like from "../components/Notification/Like";
import Comment from "../components/Notification/Comment";
import Subscribe from "../components/Notification/Subscribe";
import LikeComment from "../components/Notification/LikeComment";
import AlertVideo from "../components/Notification/AlertVideo";
import AlertPlaylist from "../components/Notification/AlertPlaylist";
import Head from "next/head";

const notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [management, setManagement] = useState({
        limit: 5,
        skip: 0,
    });
    const [isEmpty, setIsEmpty] = useState(false);

    const { limit, skip } = management;

    const fetNotificationsHandler = async () => {
        try {
            const { data } = await axios.post("/api/notification/notifications", { limit, skip });
            if (data.length < 5) {
                setIsEmpty(true);
            }
            setManagement({
                ...management,
                skip: [...notifications, ...data].length,
            });
            setNotifications([...notifications, ...data]);
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(async () => {
        fetNotificationsHandler();
    }, []);

    return (
        <LeftNav>
            <Head>
                <title>Dotube | Notifications</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <div className="px-3 text-light">
                <p className="display-3">Notifications</p>
                <hr className="bg-primary" />
                <InfiniteScroll
                    dataLength={notifications.length}
                    next={fetNotificationsHandler}
                    hasMore={!isEmpty}
                    loader={
                        <div className="text-center">
                            <img src="/static/images/loading.gif" />
                        </div>
                    }
                    endMessage={""}
                >
                    {notifications.map((notification, index) => {
                        if (notification.type === "like") {
                            return <Like notification={notification} key={index} />;
                        } else if (notification.type === "comment") {
                            return <Comment notification={notification} key={index} />;
                        } else if (notification.type === "subscribe") {
                            return <Subscribe notification={notification} key={index} />;
                        } else if (notification.type === "like_comment") {
                            return <LikeComment notification={notification} key={index} />;
                        } else if (notification.type === "alert_video") {
                            return <AlertVideo notification={notification} key={index} />;
                        } else if (notification.type === "alert_playlist") {
                            return <AlertPlaylist notification={notification} key={index} />;
                        }
                    })}
                </InfiniteScroll>
            </div>
        </LeftNav>
    );
};

export default notification;
