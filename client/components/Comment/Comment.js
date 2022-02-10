import Link from "next/link";
import moment from "moment";

const Comment = ({ comment, _id, onLikeHandler, onUnlikeHandler, onDeleteCommentHandler }) => {
    return (
        <div className="p-3">
            <div className="d-flex align-items-center justify-content-between">
                <Link href={`/channel/${comment.commentedBy._id}`}>
                    <a className="d-flex align-items-center text-decoration-none text-light">
                        <img
                            src={comment.commentedBy.profile_image.url}
                            style={{ width: "50px", height: "50px", objectFit: "cover" }}
                            className="rounded-circle"
                        />
                        <p className="ms-2">{comment.commentedBy.name}</p>
                    </a>
                </Link>
                {comment.commentedBy._id == _id && <img src="/static/icons/bin.png" style={{width: "25px", height: "25px", cursor: "pointer"}} onClick={() => onDeleteCommentHandler(comment._id)} />}
            </div>
            <div className="px-3 py-2 text-wrap text-start">
                <p>{comment.content}</p>
            </div>
            <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                    {comment.isLike ? (
                        <img
                            src="/static/icons/heart.png"
                            style={{ width: "35px", height: "35px", cursor: "pointer" }}
                            onClick={() => onUnlikeHandler(comment._id)}
                        />
                    ) : (
                        <img
                            src="/static/icons/heart-empty.png"
                            style={{ width: "35px", height: "35px", cursor: "pointer" }}
                            onClick={() => onLikeHandler(comment._id)}
                        />
                    )}
                    <span className="badge text-light ms-1">{comment.likes}</span>
                </div>
                <span className="badge text-light">{moment(comment.createdAt).fromNow()}</span>
            </div>
        </div>
    );
};

export default Comment;
