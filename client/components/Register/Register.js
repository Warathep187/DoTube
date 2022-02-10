const Register = ({enteredData, onDataChangeHandler, onSubmitHandler, isLoading}) => {
    const {email, name, password, confirm} = enteredData;

    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-xl-10 col-lg-12 col-md-9 mb-3 my-2">
                    <div className="card shadow-lg my-3">
                        <div className="card-body p-0">
                            <div className="row">
                                <div className="col-lg-6">
                                    <img
                                        src="/static/images/login.jpg"
                                        style={{ height: "610px", width: "100%", objectFit: "cover" }}
                                    />
                                </div>
                                <div className="col-lg-6">
                                    <div className="p-5">
                                        <div className="text-center mb-4">
                                            <h1>Register</h1>
                                        </div>
                                        <form onSubmit={onSubmitHandler}>
                                            <div className="form-group">
                                                <input
                                                    type="email"
                                                    className="form-control rounded-pill mb-3 p-3"
                                                    placeholder="Enter Email Address..."
                                                    name="email"
                                                    value={email}
                                                    onChange={onDataChangeHandler}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <input
                                                    type="text"
                                                    className="form-control rounded-pill mb-3 p-3"
                                                    placeholder="Enter name..."
                                                    name="name"
                                                    value={name}
                                                    onChange={onDataChangeHandler}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <input
                                                    type="password"
                                                    className="form-control rounded-pill mb-3 p-3"
                                                    placeholder="Enter password..."
                                                    name="password"
                                                    value={password}
                                                    onChange={onDataChangeHandler}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <input
                                                    type="password"
                                                    className="form-control rounded-pill mb-3 p-3"
                                                    placeholder="Confirm password..."
                                                    name="confirm"
                                                    value={confirm}
                                                    onChange={onDataChangeHandler}
                                                />
                                            </div>
                                            <div className="text-end mb-5">
                                                <button className="btn btn-primary w-50 rounded-pill" disabled={isLoading || !email || !name || !password}>
                                                    {isLoading ? "Registering..": "Register"}
                                                </button>
                                            </div>
                                        </form>
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

export default Register;
