import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

const Edit = ({
    playlist,
    setPlaylist,
    isLoading,
    onImageChangeHandler,
    onSubmitHandler,
    imagePreview,
    isEdit,
    setIsEdit,
}) => {
    const router = useRouter();
    const { title, description, image, paid, price, published } = playlist;

    const publishHandler = async () => {
        const answer = window.confirm("Are you sure you want to publish the playlist");
        if (answer) {
            const { id } = router.query;
            try {
                const { data } = await axios.put("/api/playlist/publish", { id });
                toast(data.message);
                setPlaylist({ ...playlist, published: true });
            } catch (e) {
                toast.error(e.response.error);
            }
        }
    };

    return (
        <form onSubmit={onSubmitHandler}>
            <p className="display-3 text-light">Edit playlist</p>
            <hr className="bg-primary" />
            <div className="mb-3 d-flex justify-content-between">
                <div>
                    <img
                        src={imagePreview && imagePreview.url}
                        style={{ width: "250px", height: "200px", objectFit: "cover" }}
                        className="rounded-2"
                    />
                    <input
                        type="file"
                        accept="image/*"
                        className="form-control"
                        disabled={!isEdit}
                        onChange={onImageChangeHandler}
                    />
                </div>
                <div>
                    {published ? (
                        <p className="fs-5 fw-bold text-success">Published</p>
                    ) : (
                        <button
                            type="button"
                            className="btn btn-success px-3"
                            onClick={publishHandler}
                        >
                            Publish
                        </button>
                    )}
                </div>
            </div>
            <div className="mb-3">
                <label htmlFor="1" className="form-label text-light">
                    Title
                </label>
                <input
                    type="text"
                    className="form-control"
                    id="1"
                    placeholder="New title"
                    value={title}
                    onChange={(e) => setPlaylist({ ...playlist, title: e.target.value })}
                    disabled={!isEdit}
                />
            </div>
            <div className="mb-3">
                <label htmlFor="2" className="form-label text-light">
                    Description {description.length} / 512
                </label>
                <textarea
                    className="form-control"
                    placeholder="Leave a comment here"
                    id="2"
                    style={{ height: "200px" }}
                    maxlenth={512}
                    defaultValue={description}
                    onChange={(e) => setPlaylist({ ...playlist, description: e.target.value })}
                    disabled={!isEdit}
                />
            </div>
            <div className="mb-3">
                <div className="form-check form-switch">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="flexSwitchCheckDefault"
                        disabled={!isEdit}
                        onChange={() => {
                            if (paid) {
                                setPlaylist({ ...playlist, price: 0, paid: !paid });
                            } else {
                                setPlaylist({ ...playlist, price: 59, paid: !paid });
                            }
                        }}
                        checked={paid}
                    />
                    <label className="form-check-label text-light" htmlFor="flexSwitchCheckDefault">
                        paid
                    </label>
                </div>
                {paid && (
                    <select
                        className="form-select mt-2"
                        onChange={(e) =>
                            setPlaylist({
                                ...playlist,
                                price: parseInt(e.target.value),
                            })
                        }
                        disabled={!isEdit}
                        defaultValue={price}
                    >
                        <option value={59}>59 THB</option>
                        <option value={99}>99 THB</option>
                        <option value={159}>159 THB</option>
                        <option value={199}>199 THB</option>
                        <option value={259}>259 THB</option>
                        <option value={299}>299 THB</option>
                    </select>
                )}
            </div>
            <div className="text-end">
                <button
                    type="button"
                    className="btn btn-outline-warning px-3 me-2"
                    disabled={isEdit}
                    onClick={() => setIsEdit(true)}
                >
                    Edit
                </button>
                <button
                    className="btn btn-primary px-3"
                    disabled={isLoading || !title || !description || !isEdit}
                >
                    {isLoading ? "Updating.." : "Update"}
                </button>
            </div>
        </form>
    );
};

export default Edit;
