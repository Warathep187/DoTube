import { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import Comment from "./Comment";
import InfiniteScroll from "react-infinite-scroll-component";
import {useSelector} from "react-redux";

const Comments = () => {
    const router = useRouter();
    const {data: {_id}} = useSelector(state => state.profileSlice);
    const [content, setContent] = useState("");
    const [show, setShow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [comments, setComments] = useState([]);
    const [isEmpty, setIsEmpty] = useState(false);
    const [management, setManagement] = useState({
        limit: 5,
        skip: 0,
    });

    const { limit, skip } = management;

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const commentHandler = async () => {
        if (content.trim() === "") {
            toast.error("Comment is required");
        } else if (content.trim() > 512) {
            toast.error("Comment is too long");
        } else {
            setIsLoading(true);
            const { v } = router.query;
            try {
                const { data } = await axios.post("/api/comment", { content, videoId: v });
                toast(data.message);
                setComments([data.comment, ...comments]);
                setContent("");
                setShow(false);
            } catch (e) {
                toast.error(e.response.data);
            }
            setIsLoading(false);
        }
    };

    const fetchCommentHandler = async (v) => {
        try {
            const { v } = router.query;
            const { data } = await axios.post("/api/comments", { limit, skip, v });
            if (data.length < 5) {
                setIsEmpty(true);
            }
            setComments([...comments, ...data]);
            setManagement({
                ...management,
                skip: [...comments, ...data].length,
            });
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        const { v } = router.query;
        if (v) {
            fetchCommentHandler(v);
        }
    }, [router]);

    const likeHandler = async (commentId) => {
        try {
            const updated = comments.map((comment, index) => {
                if (comment._id == commentId) {
                    return { ...comment, likes: comment.likes+1, isLike: true };
                }
                return comment;
            });
            setComments(updated);
            const { data } = await axios.put("/api/comment/like", { commentId, v: router.query.v });
            if (data.ok) {
                toast("Liked❤")
            }
        } catch (e) {
            toast.error(e.response.data);
            const newComment = comments.map((comment, idx) => {
                if (comment._id == commentId) {
                    return {...comment, isLike: false, likes: comment.likes-1}
                }
                return comment;
            });
            setComments(newComment);
        }
    };

    const unlikeHandler = async (commentId) => {
        try {
            const newComment = comments.map((comment, idx) => {
                if (comment._id == commentId) {
                    return {...comment, isLike: false, likes: comment.likes-1}
                }
                return comment;
            });
            setComments(newComment);
            const { data } = await axios.put("/api/comment/unlike", {
                commentId,
                v: router.query.v,
            });
            if (data.ok) {
                toast("Unlike💔")
            }
        } catch (e) {
            toast.error(e.response.data);
            const updated = comments.map((comment, index) => {
                if (comment._id == commentId) {
                    return { ...comment, likes: comment.likes+1, isLike: true };
                }
                return comment;
            });
            setComments(updated);
        }
    };

    const deleteCommentHandler = async (commentId) => {
        const answer = window.confirm('Are you sure you want to delete this comment');
        if(answer) {
            try {
                const {data} = await axios.delete(`/api/comment/${commentId}`);
                const filtered = comments.filter(v => v._id != commentId);
                setComments(filtered);
                toast(data.message);
            }catch(e) {
                toast.error(e.response.data);
            }
        }
    }

    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>New comment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <span>{content.length} / 512</span>
                    <div className="form-floating">
                        <textarea
                            className="form-control"
                            placeholder="Leave a comment here"
                            id="floatingTextarea"
                            style={{ height: "200px" }}
                            onChange={(e) => setContent(e.target.value)}
                            maxLength={512}
                            value={content}
                        />
                        <label htmlFor="floatingTextarea">Comments</label>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="primary"
                        onClick={commentHandler}
                        disabled={isLoading || !content}
                    >
                        {isLoading ? "Commenting" : "Comment"}
                    </Button>
                </Modal.Footer>
            </Modal>
            <div className="text-light px-4 mt-4">
                <div className="d-flex justify-content-between">
                    <p className="fs-4 fw-bold">Comment</p>
                    <button className="btn btn-outline-primary" onClick={handleShow}>
                        New comment
                    </button>
                </div>
                <hr className="bg-light" />
                <div className="p-2">
                    <InfiniteScroll
                        dataLength={comments.length}
                        next={fetchCommentHandler}
                        hasMore={!isEmpty}
                        loader={
                            <div className="text-center">
                                <img src="/static/images/loading.gif" />
                            </div>
                        }
                        endMessage={""}
                    >
                        {comments.map((comment, index) => (
                            <Comment
                                key={index}
                                _id={_id}
                                comment={comment}
                                onLikeHandler={likeHandler}
                                onUnlikeHandler={unlikeHandler}
                                onDeleteCommentHandler={deleteCommentHandler}
                            />
                        ))}
                    </InfiniteScroll>
                </div>
            </div>
        </>
    );
};

export default Comments;
