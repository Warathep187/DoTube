import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import InfiniteScroll from "react-infinite-scroll-component";
import Link from "next/link";
import moment from "moment";
import {toast} from "react-toastify"

const Comments = () => {
    const router = useRouter();
    const [comments, setComments] = useState([]);
    const [management, setManagement] = useState({
        limit: 5,
        skip: 0,
    });
    const [isEmpty, setIsEmpty] = useState(false);

    const { limit, skip } = management;

    const fetchCommentsHandler = async () => {
        const { v } = router.query;
        if(v) {
            try {
                const { data } = await axios.post(`/api/admin/comments/${v}`, { limit, skip });
                if (data.length < 5) {
                    setIsEmpty(true);
                }
                setManagement({ ...management, skip: [...comments, ...data].length });
                setComments([...comments, ...data]);
            } catch (e) {
                console.log(e);
            }
        }
    };

    useEffect(async () => {
        const { v } = router.query;
        if (v) {
            return fetchCommentsHandler();
        }
    }, [router]);

    const deleteCommentHandler = async (id) => {
        const answer = window.confirm("Are you sure you want to delete this comment?");
        if(answer) {
            try {
                const {data} = await axios.delete(`/api/admin/delete-comment/${id}`);
                toast(data.message);
                const filtered = comments.filter(v => v._id != id);
                setComments(filtered);
            }catch(e) {
                toast.error(e.response.data);
            }
        }
    }

    return (
        <div className="mb-5">
            <p className="fs-4 fw-bold text-secondary">Comments</p>
            <div className="text-light">
                <InfiniteScroll
                    dataLength={comments.length}
                    next={fetchCommentsHandler}
                    hasMore={!isEmpty}
                    loader={
                        <div className="text-center">
                            <img src="/static/images/loading.gif" />
                        </div>
                    }
                    endMessage={""}
                >
                    {comments.map((comment, index) => (
                        <div className="p-3 shadow-sm my-1" key={index}>
                            <div className="d-flex align-items-center justify-content-between">
                                <Link href={`/admin/channel/${comment.commentedBy._id}`}>
                                    <a className="d-flex align-items-center text-decoration-none text-light">
                                        <img
                                            src={comment.commentedBy.profile_image.url}
                                            style={{
                                                width: "40px",
                                                height: "40px",
                                                objectFit: "cover",
                                            }}
                                            className="rounded-circle"
                                        />
                                        <p className="ms-2">{comment.commentedBy.name}</p>
                                    </a>
                                </Link>
                                <img
                                    src="/static/icons/bin.png"
                                    style={{ width: "25px", height: "25px", cursor: "pointer" }}
                                    onClick={() => deleteCommentHandler(comment._id)}
                                />
                            </div>
                            <div className="px-3 py-2 text-wrap text-start">
                                <p>{comment.content}</p>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>
                                    {comment.like} likes
                                </span>
                                <span className="badge text-light">
                                    {moment(comment.createdAt).fromNow()}
                                </span>
                            </div>
                        </div>
                    ))}
                </InfiniteScroll>
            </div>
        </div>
    );
};

export default Comments;
