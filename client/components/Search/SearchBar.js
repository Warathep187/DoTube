import { useState } from "react";
import axios from "axios";
import Router from "next/router";

const SearchBar = () => {
    const [searching, setSearching] = useState("");
    const [values, setValues] = useState([]);

    const typingHandler = async (e) => {
        setSearching(e.target.value);
        if (e.target.value.trim() !== "") {
            try {
                const { data } = await axios.post("/api/video/search", {
                    key: e.target.value.trim(),
                });
                setValues(data);
            } catch (e) {
                console.log(e);
            }
        }
    };

    const searchHandler = (e) => {
        e.preventDefault();
        Router.push(`/search?key=${searching}`);
    }

    return (
        <div className="w-100">
            <form onSubmit={searchHandler} >
            <div className="w-50 mx-auto mb-3">
                <input
                    className="form-control"
                    list="datalistOptions"
                    placeholder="Type to search..."
                    onChange={typingHandler}
                    value={searching}
                />
                <datalist id="datalistOptions">
                    {values.map((value, index) => {
                        if(value.name) {
                            return <option key={index} value={value.name}>{value.name}</option>
                        }else {
                            return <option key={index} value={value.title}>{value.title}</option>
                        }
                    })}
                </datalist>
            </div>
            </form>
        </div>
    );
};

export default SearchBar;
