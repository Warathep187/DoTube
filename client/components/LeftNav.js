import Link from "next/link";
import { Button } from "react-bootstrap";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Router from "next/router";

const LeftNav = ({ children }) => {
    const [path, setPath] = useState("");
    const [fifthSub, setFifthSub] = useState([]);
    const [allSub, setAllSub] = useState([]);
    const [recommendedUser, setRecommendedUser] = useState([]);

    const [isShowAll, setIsShowAll] = useState(false);

    const fetchRecommendedUser = async () => {
        try {
            const { data } = await axios.get("/api/recommended");
            setRecommendedUser(data);
        } catch (e) {
            toast.error(e.response.data);
        }
    };

    const getSubscription = async () => {
        if (process.browser) {
            setPath(window.location.pathname);
        }
        try {
            const { data } = await axios.get("/api/subscriptions");
            setFifthSub(data.subscriptions.slice(0, 5));
            setAllSub(data.subscriptions);
            fetchRecommendedUser();
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(async () => {
        try {
            const { data } = await axios.get("/api/check-user");
            getSubscription();
        } catch (e) {
            if (e.response.status === 401) {
                Router.push("/login");
            } else {
                Router.push("/");
            }
        }
        return () => {}
    }, []);

    const allSubContent = (
        <>
            {allSub.map((sub, index) => (
                <a
                    className="d-block ms-3 text-light mb-2"
                    style={{ textDecoration: "none" }}
                    key={index}
                    href={`/channel/${sub._id}`}
                >
                    <img
                        src={sub.profile_image.url}
                        style={{
                            width: "38px",
                            hight: "38px",
                            borderRadius: "50%",
                            objectFit: "cover",
                        }}
                    />
                    <span className="ms-2">
                        {sub.name.length > 15 ? sub.name.slice(0, 15) + ".." : sub.name}
                    </span>
                </a>
            ))}
            <span
                className="text-primary ms-2 mt-2"
                style={{ cursor: "pointer" }}
                onClick={() => setIsShowAll(false)}
            >
                Show less
            </span>
        </>
    );

    const recommendedContent = recommendedUser.map((user, index) => (
        <a
            className="d-block ms-3 text-light mb-2"
            key={index}
            href={`/channel/${user._id}`}
            style={{ textDecoration: "none" }}
        >
            <img
                src={user.profile_image.url}
                style={{
                    width: "38px",
                    hight: "38px",
                    borderRadius: "50%",
                    objectFit: "cover",
                }}
            />
            <span className="ms-2">
                {user.name.length > 15 ? user.name.slice(0, 15) + ".." : user.name}
            </span>
        </a>
    ));

    const fifthSubContent = (
        <>
            {fifthSub.map((sub, index) => (
                <a
                    href={`/channel/${sub._id}`}
                    className="d-block ms-3 text-light mb-2"
                    key={index}
                    style={{ textDecoration: "none" }}
                >
                    <img
                        src={sub.profile_image.url}
                        style={{
                            width: "38px",
                            hight: "38px",
                            borderRadius: "50%",
                            objectFit: "cover",
                        }}
                    />
                    <span className="ms-2">
                        {sub.name.length > 15 ? sub.name.slice(0, 15) + ".." : sub.name}
                    </span>
                </a>
            ))}
            {allSub.length < 6 ? (
                ""
            ) : (
                <span
                    className="text-primary ms-2 mt-2"
                    style={{ cursor: "pointer" }}
                    onClick={() => setIsShowAll(true)}
                >
                    Show {allSub.length - 5} more
                </span>
            )}
        </>
    );

    return (
        <div className="row w-100">
            <div
                className="col-2 border-bottom pb-3 mt-2"
                style={{ height: "668px", overflowY: "scroll" }}
            >
                <div>
                    <div className="w-100">
                        <Link href="/video">
                            <Button
                                variant="outline-primary"
                                className={`w-100 py-3 ${
                                    path === "/video" && "bg-primary text-light"
                                }`}
                            >
                                My Video
                            </Button>
                        </Link>
                    </div>
                    <div>
                        <Link href="/playlist">
                            <Button
                                variant="outline-primary"
                                className={`w-100 py-3 ${
                                    path === "/playlist" && "bg-primary text-light"
                                }`}
                            >
                                My Playlist
                            </Button>
                        </Link>
                    </div>
                    <div>
                        <Link href="/purchasing?show=processing">
                            <Button
                                variant="outline-primary"
                                className={`w-100 py-3 ${
                                    path === "/purchasing" && "bg-primary text-light"
                                }`}
                            >
                                Purchasing
                            </Button>
                        </Link>
                    </div>
                    <div>
                        <Link href="/notification">
                            <Button
                                variant="outline-primary"
                                className={`w-100 py-3 ${
                                    path === "/notification" && "bg-primary text-light"
                                }`}
                            >
                                Notification
                            </Button>
                        </Link>
                    </div>
                    <div>
                        <Link href="/history">
                            <Button
                                variant="outline-primary"
                                className={`w-100 py-3 ${
                                    path === "/history" && "bg-primary text-light"
                                }`}
                            >
                                History
                            </Button>
                        </Link>
                    </div>
                    <div>
                        <Link href="/watch-later">
                            <Button
                                variant="outline-primary"
                                className={`w-100 py-3 ${
                                    path === "/watch-later" && "bg-primary text-light"
                                }`}
                            >
                                Watch Later
                            </Button>
                        </Link>
                    </div>
                </div>
                <hr className="bg-light mt-4" />
                <div>
                    <p className="text-secondary fs-5 fw-bold ms-2">SUBSCRIPTIONS</p>
                    <div>{isShowAll ? allSubContent : fifthSubContent}</div>
                </div>
                <hr className="bg-light" />
                <div className=" mt-3">
                    <p className="text-secondary fs-5 fw-bold ms-2">RECOMMENDED</p>
                    <div>{recommendedContent}</div>
                </div>
            </div>
            <div className="col-10">{children}</div>
        </div>
    );
};

export default LeftNav;
