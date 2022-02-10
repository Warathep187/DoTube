import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Processing from "../components/Purchasing/Processing";
import Purchased from "../components/Purchasing/Purchased";
import PlaylistSelling from "../components/Purchasing/PlaylistSelling";
import LeftNav from "../components/LeftNav";
import Link from "next/link";
import Head from "next/head";

const purchasing = () => {
    const router = useRouter();
    const [show, setShow] = useState("processing");

    useEffect(async () => {
        const { show } = router.query;
        if (show === "processing" || show === "purchased" || show === "selling") {
            setShow(show);
        } else {
            router.replace("/purchasing?show=processing")
            setShow("processing");
        }
    }, [router.query.show]);

    return (
        <LeftNav>
            <Head>
                <title>Dotube | {router.query.show}</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <div className="px-5">
                <div className="d-flex px-5">
                    <Link href="/purchasing?show=processing">
                        <button
                            onClick={() => setShow("processing")}
                            className={`btn btn-outline-primary w-100 ${
                                show === "processing" && "active"
                            }`}
                        >
                            Processing
                        </button>
                    </Link>
                    <Link href="/purchasing?show=purchased">
                        <button
                            onClick={() => setShow("purchased")}
                            className={`btn btn-outline-primary w-100 ${
                                show === "purchased" && "active"
                            }`}
                        >
                            Purchased
                        </button>
                    </Link>
                    <Link href="/purchasing?show=selling">
                        <button
                            onClick={() => setShow("selling")}
                            className={`btn btn-outline-primary w-100 ${
                                show === "selling" && "active"
                            }`}
                        >
                            Playlist selling
                        </button>
                    </Link>
                </div>
            </div>
            <div className="px-5">
                {show === "processing" && <Processing />}
                {show === "purchased" && <Purchased />}
                {show === "selling" && <PlaylistSelling />}
            </div>
        </LeftNav>
    );
};

export default purchasing;
