import { createSlice, PayloadAction } from '@reduxjs/toolkit'



export interface PageOptionsState {
    IsPageLoading: boolean
}

const initialState: PageOptionsState = {
    IsPageLoading: false,
}

const PageOptions = createSlice({
    name: 'PageOptions',
    initialState,
    reducers: {
        ShowPageLoader: (state, action: PayloadAction<boolean>) => {
            state.IsPageLoading = action.payload
        }
    }
})

export default PageOptions;