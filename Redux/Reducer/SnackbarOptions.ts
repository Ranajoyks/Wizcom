import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type SnackbarState = "Open" | "Close"

export interface SnackbarOptionsState {
  State: SnackbarState,
  Text: string,
  ShowButton: boolean,
  OnButtonClick?: () => void,
  onDismiss?: () => void
}

const initialState: SnackbarOptionsState = {
  OnButtonClick: undefined,
  ShowButton: false,
  State: "Close",
  Text: ""
}

const SnackbarOptions = createSlice({
  name: 'SnackbarOptions',
  initialState,
  reducers: {
    Show: (state, action: PayloadAction<string>) => {
      state.Text = action.payload
      state.State = "Open"
    },
    Close: (state) => {
      state.Text = ""
      state.State = "Close"
    },

    Clear: (state) => {
      return initialState
    },
  }
})

export default SnackbarOptions;