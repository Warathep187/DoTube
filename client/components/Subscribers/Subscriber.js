import Link from "next/link";

const Subscriber = ({ subscriber }) => {
    return (
        <Link href={`/channel/${subscriber._id}`}>
            <a
                className="d-flex align-items-center my-2 text-secondary px-3"
                style={{ textDecoration: "none" }}
            >
                <img
                    src={subscriber.profile_image.url}
                    style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        objectFit: "cover",
                    }}
                />
                <span className="ms-2 fs-5 fw-bold">{subscriber.name}</span>
            </a>
        </Link>
    );
};

export default Subscriber;
