import { Action, combineReducers, configureStore } from '@reduxjs/toolkit'
import SnackbarOptions from './Reducer/SnackbarOptions'
import PageOptions from './Reducer/PageOptions'
import NotificationOptions from './Reducer/NotificationOptions'
import DialogOptions from './Reducer/DialogOptions'
import MHeaderOptions from './Reducer/MHeaderOptions'
import OneToOneChatOptions from './Reducer/OneToOneChatOptions'
import GroupChatOptions from './Reducer/GroupChatOptions'
import AuthenticationOptions from './Reducer/AuthenticationOptions'

const appReducer = combineReducers({
  SnackbarOptions: SnackbarOptions.reducer,
  PageOptions: PageOptions.reducer,
  GroupChatOptions: GroupChatOptions.reducer,
  OneToOneChatOptions: OneToOneChatOptions.reducer,
  NotificationOptions: NotificationOptions.reducer,
  DialogOptions: DialogOptions.reducer,
  MHeaderOptions: MHeaderOptions.reducer,
  AuthenticationOptions: AuthenticationOptions.reducer
});


// export const RESET_ACTION = {
//   type: "RESET"
// }

// export const ResettReducer = (state: RootState, action: Action) => {
//   if (action.type === RESET_ACTION.type) {
//     return appReducer(undefined, { type: '' });
//   }

//   return appReducer(state, action);
// }

export const store = configureStore({
  reducer: appReducer
})


// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof appReducer>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export const ShowPageLoader = (show: boolean) => store.dispatch(PageOptions.actions.ShowPageLoader(show))

export const ShowToastMessage = (message: string) => {
  store.dispatch(SnackbarOptions.actions.Show(message))
  setTimeout(() => {
    store.dispatch(SnackbarOptions.actions.Close())
  }, 5000)
} 