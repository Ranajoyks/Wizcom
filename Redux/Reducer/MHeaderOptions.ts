export type UserShowMode = "All User" | "Online User"

import { createSlice, PayloadAction } from '@reduxjs/toolkit'



export interface MHeaderOptionsState {
    CurrentSearchText: string,
    UserShowMode: UserShowMode
}

const initialState: MHeaderOptionsState = {
    UserShowMode: "Online User",
    CurrentSearchText: "",

}

const MHeaderOptions = createSlice({
    name: 'MHeaderOptions',
    initialState,
    reducers: {
        UpdateUserShowMode: (state, action: PayloadAction<UserShowMode>) => {
            state.UserShowMode = action.payload
        },
        UpdateSearchText: (state, action: PayloadAction<string>) => {
            state.CurrentSearchText = action.payload
        },

    }
})

export default MHeaderOptions;