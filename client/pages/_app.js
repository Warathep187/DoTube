import "bootstrap/dist/css/bootstrap.min.css";
import TopNav from "../components/TopNav";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Provider } from "react-redux";
import store from "../store";

function MyApp({ Component, pageProps }) {
    return (
        <Provider store={store}>
            <TopNav>
                <ToastContainer position="top-right" autoClose={3000} pauseOnFocusLoss={false} />
                <Component {...pageProps} />
            </TopNav>
        </Provider>
    );
}

export default MyApp;
