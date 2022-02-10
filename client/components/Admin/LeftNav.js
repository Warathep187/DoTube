import Link from "next/link";
import { Button } from "react-bootstrap";
import { useEffect, useState } from "react";
import axios from "axios";
import Router from "next/router";

const LeftNav = ({ children }) => {
    const [path, setPath] = useState("");

    useEffect(async () => {
        try {
            if (process.browser) {
                setPath(window.location.pathname);
            }
            const { data } = await axios.get("/api/admin/check-admin");
        } catch (e) {
            if (e.response.status === 403) {
                Router.back();
            } else {
                Router.push("/login");
            }
        }
        return () => {};
    }, []);

    return (
        <div className="row w-100">
            <div
                className="col-2 border-bottom pb-3 mt-2"
                style={{ height: "661px", overflowY: "scroll" }}
            >
                <div>
                    <div className="w-100">
                        <Link href="/admin/payment">
                            <Button
                                variant="outline-primary"
                                className={`w-100 py-3 ${
                                    path === "/admin/payment" && "bg-primary text-light"
                                }`}
                            >
                                Payments
                            </Button>
                        </Link>
                    </div>
                </div>
                <hr className="bg-light mt-4" />
            </div>
            <div className="col-10">{children}</div>
        </div>
    );
};

export default LeftNav;
