import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'

import { ChatUser } from '../../Entity/ChatUser'
import UIHelper from '../../Core/UIHelper'
import { Chat } from '../../Entity/Chat'
import { RootState } from '../Store'
import AppDBHelper from '../../Core/AppDBHelper'
import { act } from 'react-test-renderer'
import User from '../../Entity/User'

export interface AuthenticationOptionsState {
    User?: User
}

const initialState: AuthenticationOptionsState = {
    User: undefined
}

const AuthenticationOptions = createSlice({
    name: 'AuthenticationOptions',
    initialState,
    reducers: {
        LogOut: (state) => {
            state.User = undefined
        },
        LogIn: (state, action: PayloadAction<User>) => {
            state.User = action.payload
        },
    }
})



export default AuthenticationOptions;