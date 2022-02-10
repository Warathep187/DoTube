import { useEffect, useState } from "react";
import axios from "axios";
import Router from "next/router";
import TopInfo from "../../components/Channel/TopInfo";
import LeftNav from "../../components/LeftNav";
import BottomList from "../../components/Channel/BottomList";
import Head from "next/head";

const channel = () => {
    const [data, setData] = useState({
        _id: "",
        name: "",
        profile_image: {
            url: "",
            key: "",
        },
        subscribers: [],
    });

    useEffect(async () => {
        try {
            const { data } = await axios.get("/api/channel");
            setData(data);
        } catch (e) {
            if(e.response.status === 401) {
                Router.push("/login");
            }else {
                Router.replace("/");
            }
            
        }
    }, []);

    return (
        <LeftNav>
            <Head>
                <title>Dotube | Channel</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <div className="mx-auto w-100 p-4">
                <TopInfo data={data} onSetData={setData} />
                <BottomList />
            </div>
        </LeftNav>
    );
};

export default channel;
