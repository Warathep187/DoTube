import Head from "next/head";

const Custom404 = () => {
    return (
        <>
            <Head>
                <title>Dotube | Page not found</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <div>
                <div className="container-fluid">
                    <div className="text-center text-light">
                        <div className="mx-auto mb-3">
                            <img
                                src="/static/images/404.png"
                                style={{ width: "500px", hight: "350px" }}
                            />
                        </div>
                        <p className="mb-5">Page Not Found</p>
                        <p className="mb-0">It looks like you found a glitch in the matrix...</p>
                        <a href="/">← Back to Home page</a>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Custom404;
