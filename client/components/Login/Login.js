import Link from "next/link";

const Login = ({ enteredData, onSubmitHandler, onChangeHandler, isLoading }) => {
    const { email, password } = enteredData;
    return (
        <div className="container">
            <div className="row justify-content-center">
                <div
                    className="col-xl-10 col-lg-12 col-md-9 mt-1 mb-3"
                    style={{ marginBottom: "50p" }}
                >
                    <div className="card shadow-lg my-5">
                        <div className="card-body p-0">
                            <div className="row">
                                <div className="col-lg-6">
                                    <img
                                        src="/static/images/login.jpg"
                                        style={{
                                            height: "550px",
                                            width: "100%",
                                            objectFit: "cover",
                                        }}
                                    />
                                </div>
                                <div className="col-lg-6">
                                    <div className="p-5">
                                        <div className="text-center mb-4">
                                            <h1 className="">Welcome Back!</h1>
                                        </div>
                                        <form onSubmit={onSubmitHandler}>
                                            <div className="form-group">
                                                <input
                                                    type="email"
                                                    className="form-control rounded-pill mb-3 p-3"
                                                    placeholder="Enter Email Address..."
                                                    name="email"
                                                    value={email}
                                                    onChange={onChangeHandler}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <input
                                                    type="password"
                                                    className="form-control rounded-pill mb-3 p-3"
                                                    placeholder="Password"
                                                    name="password"
                                                    value={password}
                                                    onChange={onChangeHandler}
                                                />
                                            </div>
                                            <div className="text-end mb-5">
                                                <button
                                                    className="btn btn-primary w-50 rounded-pill"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? (
                                                        "Logging In..."
                                                    ) : (
                                                        "Login"
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                        <hr />
                                        <div className="text-center">
                                            <Link href="/forgot-password">
                                                <a className="text-decoration-none">
                                                    Forgot Password?
                                                </a>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
