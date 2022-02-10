import LeftNav from "../../components/Admin/LeftNav";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Modal, Button } from "react-bootstrap";
import moment from "moment";
import Link from "next/link";
import Head from "next/head";;

const payment = () => {
    const [payments, setPayments] = useState([]);
    const [display, setDisplay] = useState({
        buyer: "",
        confirm: false,
        owner_playlist: "",
        playlist: {
            image: {},
            price: 0,
            title: "",
            _id: "",
        },
        slip_image: {},
    });
    const [show, setShow] = useState(false);
    const [cancelShow, setCancelShow] = useState(false);
    const [reason, setReason] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [curPayment, setCurPayment] = useState("");

    const handleClose = () => setShow(false);

    useEffect(async () => {
        try {
            const { data } = await axios.get("/api/admin/waiting-payments");
            setPayments(data);
        } catch (e) {
            console.log(e);
        }
    }, []);

    const displayInformation = (id) => {
        const index = payments.findIndex((v) => v._id == id);
        if (index !== -1) {
            setCurPayment(id);
            setDisplay(payments[index]);
            setShow(true);
        }
    };

    const showCancelMenu = (id) => {
        setCancelShow(true);
        setCurPayment(id);
    };

    const cancelPaymentHandler = async () => {
        if (reason === "") {
            toast.error("Reason is required");
        } else if (!["Incorrect amount", "Invalid slip"].includes(reason)) {
            toast.error("Reason is invalid");
        } else {
            setIsLoading(true);
            try {
                const { data } = await axios.put("/api/admin/cancel-payment", {
                    id: curPayment,
                    reason,
                });
                toast(data.message);
                const mapping = payments.map((payment, index) => {
                    if (payment._id == curPayment) {
                        payment.cancel = true;
                        payment.reason = reason;
                        return payment;
                    } else {
                        return payment;
                    }
                });
                setPayments(mapping);
                setCancelShow(false);
                setCurPayment("");
            } catch (e) {
                toast.error(e.response.data);
            }
            setIsLoading(false);
        }
    };

    const confirmPaymentHandler = async () => {
        const answer = window.confirm("Are you sure you want to confirm this payment?");
        if(answer) {
            setIsLoading(true);
            try {
                const {data} = await axios.put("/api/admin/confirm-payment", {id: curPayment});
                toast(data.message);
                const mapping = payments.map((payment, index) => {
                    if (payment._id == curPayment) {
                        payment.confirm = true;
                        return payment;
                    } else {
                        return payment;
                    }
                });
                setPayments(mapping);
                setShow(false);
                setCurPayment("");
            }catch(e) {
                toast.error(e.response.data);
            }
            setIsLoading(false);
        }
    }

    return (
        <LeftNav>
            <Head>
                <title>Dotube | Payments</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <Modal show={cancelShow} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Modal heading</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <span>Reason</span>
                    <select
                        className="form-select"
                        aria-label="Default select example"
                        onChange={(e) => setReason(e.target.value)}
                    >
                        <option value="">Open this select reasons</option>
                        <option value="Incorrect amount">Incorrect amount</option>
                        <option value="Invalid slip">Invalid slip</option>
                    </select>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="outline-danger"
                        onClick={cancelPaymentHandler}
                        disabled={!reason || isLoading}
                    >
                        {isLoading ? "Canceling.." : "Cancel payment"}
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Modal heading</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {display.playlist === null ? (
                        <p className="fs-5 fw-bold text-danger text-center">
                            Playlist has been deleted.
                        </p>
                    ) : (
                        <Link href={`/admin/playlist/${display.playlist._id}`}>
                            <div
                                className="d-flex align-items-center justify-content-center mb-3"
                                style={{ cursor: "pointer" }}
                            >
                                <img
                                    src={display.playlist.image.url}
                                    style={{
                                        width: "50px",
                                        height: "50px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                    }}
                                />
                                <span className="fs-5 fw-bold text-secondary ms-2">
                                    {display.playlist.title}
                                </span>
                            </div>
                        </Link>
                    )}
                    <div className="w-100 d-flex">
                        <img
                            src={display.slip_image.url}
                            style={{ width: "50%", height: "300px", objectFit: "cover" }}
                        />
                        <div className="ms-2">
                            <p>
                                Price <b>{display.playlist === null ? "-" : display.playlist.price} THB</b>
                            </p>
                            <p>
                                Bought at{" "}
                                <b>{moment(display.createdAt).format("d/MM/YYY HH:mm")}</b>
                            </p>
                            <p>
                                Status{" "}
                                {!display.cancel && !display.confirm && (
                                    <span className="text-warning fw-bold">Waiting</span>
                                )}
                                {display.cancel && !display.confirm && (
                                    <span className="text-danger fw-bold">Canceled</span>
                                )}
                                {!display.cancel && display.confirm && (
                                    <span className="text-success fw-bold">Confirmed</span>
                                )}
                            </p>
                            {display.cancel && (
                                <p className="text-danger fw-bold">{display.reason}</p>
                            )}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-success" onClick={confirmPaymentHandler} disabled={isLoading}>
                        {isLoading ? "Confirming..": "Confirm"}
                    </Button>
                </Modal.Footer>
            </Modal>
            <div className="pt-2 px-5 text-light">
                <p className="display-3">Payments</p>
                <hr className="bg-primary" />
                <div>
                    <table className="table table-striped text-light">
                        <thead>
                            <tr>
                                <th scope="col">Playlist</th>
                                <th scope="col">Buyer</th>
                                <th scope="col">Bought at</th>
                                <th scope="col">Status</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((payment, index) => (
                                <tr className="text-light" key={index}>
                                    <td
                                        onClick={() => displayInformation(payment._id)}
                                        style={{ cursor: "pointer" }}
                                        className="text-light"
                                    >
                                        {payment.playlist === null ? (
                                            <span className="text-danger fw-bold">Deleted</span>
                                        ) : payment.playlist.title.length > 32 ? (
                                            payment.playlist.title.slice(0, 30)
                                        ) : (
                                            payment.playlist.title
                                        )}
                                    </td>
                                    <td>
                                        <Link href={`/admin/channel/${payment.buyer}`}>
                                            <a>{payment.buyer}</a>
                                        </Link>
                                    </td>
                                    <td className="text-light">
                                        {moment(payment.createdAt).format("YYYY-MM-DD HH:mm")}
                                    </td>
                                    <td>
                                        {!payment.cancel && !payment.confirm && <span className="text-warning">Waiting</span>}
                                        {payment.cancel && !payment.confirm && 
                                            <span className="text-danger">Canceled</span>
                                        }
                                        {payment.confirm && !payment.cancel && <span className="text-success">Confirmed</span>}
                                    </td>
                                    <td>
                                        {payment.cancel && !payment.confirm && 
                                            <span className="text-danger">Canceled</span>
                                        }
                                        {!payment.cancel && !payment.confirm && <img
                                                src="/static/icons/cancel.png"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => showCancelMenu(payment._id)}
                                            />}
                                        {!payment.cancel && payment.confirm && <span className="text-success">Confirmed</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </LeftNav>
    );
};

export default payment;
