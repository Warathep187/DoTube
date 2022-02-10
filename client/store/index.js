import { createSlice, configureStore } from "@reduxjs/toolkit";

const initialProfileState = {
    data: {},
};

const profileSlice = createSlice({
    name: "Profile",
    initialState: initialProfileState,
    reducers: {
        setInitialProfile(state, action) {
            state.data = action.payload.user;
        },
        updateProfile(state, action) {
            state.data = {
                ...state.data,
                name: action.payload.name,
                profile_image: action.payload.profile_image,
            };
        },
        updateSeller(state, action) {
            state.data = {
                ...state.data,
                seller: true,
            };
        },
        removeProfile(state, action) {
            state.data = {};
        }
    },
});

const store = configureStore({
    reducer: {
        profileSlice: profileSlice.reducer,
    },
});

export default store;
export const profileActions = profileSlice.actions;
