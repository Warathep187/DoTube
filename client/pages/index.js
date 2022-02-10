import Head from "next/head";
import LeftNav from "../components/LeftNav";
import Recommend from "../components/Home/Recommend";
import HomeVideos from "../components/Home/HomeVideos";
import SearchBar from "../components/Search/SearchBar";

export default function Home() {
    return (
        <LeftNav>
            <Head>
                <title>Dotube</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <SearchBar />
            <Recommend />
            <HomeVideos />
        </LeftNav>
    );
}
