import LeftNav from "../../components/Admin/LeftNav";
import { useEffect, useState } from "react";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import Link from "next/link";
import moment from "moment";
import SearchBar from "../../components/Admin/Search/SearchBar";
import Head from "next/head";

const AdminMainPage = () => {
    const [users, setUsers] = useState([]);
    const [management, setManagement] = useState({
        limit: 5,
        skip: 0,
    });
    const [isEmpty, setIsEmpty] = useState(false);

    const { limit, skip } = management;

    const fetchAllUserHandler = async () => {
        try {
            const { data } = await axios.post("/api/admin/get-all-users", { limit, skip });
            if (data.users.length < 5) {
                setIsEmpty(true);
            }
            setManagement({
                ...management,
                skip: [...users, ...data.users].length,
            });
            setUsers([...users, ...data.users]);
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        fetchAllUserHandler();
        return () => {};
    }, []);

    return (
        <LeftNav>
            <Head>
                <title>Dotube | Admin</title>
                <meta name="description" content="Dotube" />
            </Head>
            <div className="my-1">
            <SearchBar />
            </div>
            <div className="text-light px-5">
                <div className="d-flex align-items-center mx-auto">
                    <img
                        src="/static/images/admin.png"
                        style={{ width: "150px", height: "150px", objectFit: "cover" }}
                    />
                    <p className="display-4 ms-3">
                        Welcome back, <span className="fw-bold text-primary">Dotube Admin</span>
                    </p>
                </div>
                <div className="row mt-3">
                    <div className="col-6 mx-1">
                        <div className="py-2 mt-2 p-3 shadow rounded-2" style={{height: "395px", overflowY: "scroll"}}>
                        <p className="fs-4 fw-bold text-secondary">All channels</p>
                        <hr className="bg-primary" />
                            <InfiniteScroll
                                dataLength={users.length}
                                next={fetchAllUserHandler}
                                hasMore={!isEmpty}
                                loader={
                                    <div className="text-center">
                                        <img src="/static/images/loading.gif" />
                                    </div>
                                }
                                endMessage={""}
                            >
                                {users.map((user, index) => (
                                    <div className="p-2" key={index}>
                                        <Link href={`/admin/channel/${user._id}`}>
                                            <div className="d-flex align-items-center" style={{cursor: "pointer" }}>
                                                <img
                                                    src={user.profile_image.url}
                                                    style={{
                                                        width: "50px",
                                                        height: "50px",
                                                        objectFit: "cover",
                                                        borderRadius: "50%",
                                                    }}
                                                />
                                                <div className="ms-2">
                                                    <span className="fs-5 fw-bold">{user.name}</span><br />
                                                    <span className="text-secondary">{moment(user.createdAt).fromNow()}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </InfiniteScroll>
                        </div>
                    </div>
                    <div className="col-5 mx-1">
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                    </div>
                </div>
            </div>
        </LeftNav>
    );
};

export default AdminMainPage;
