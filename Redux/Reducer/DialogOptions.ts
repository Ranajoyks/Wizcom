import { createSlice, PayloadAction } from '@reduxjs/toolkit'



export interface DialogOptionsState {
    ButtonMode: "YesNo" | "YesNoCancel" | "Yes" | "Ok" | "OKCancel"
    BodyText: string,
    OnDismiss?: () => void,
    OnActionTaken?: (ButtonType: "Yes" | "No" | "Cancel", InputValue?: string) => void
}

const initialState: DialogOptionsState = {
    ButtonMode: 'YesNo',
    BodyText: '',
}



const DialogOptions = createSlice({
    name: 'DialogOptions',
    initialState,
    reducers: {
        ShowDialog: (state, action: PayloadAction<DialogOptionsState>) => {
            state = action.payload
        }
    }
})

export default DialogOptions;