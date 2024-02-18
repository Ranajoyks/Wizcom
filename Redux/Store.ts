import { configureStore } from '@reduxjs/toolkit'
import SnackbarOptions from './Reducer/SnackbarOptions'
import PageOptions from './Reducer/PageOptions'
import NotificationOptions from './Reducer/NotificationOptions'
import DialogOptions from './Reducer/DialogOptions'
import MHeaderOptions from './Reducer/MHeaderOptions'
import OneToOneChatOptions from './Reducer/OneToOneChatOptions'
import GroupChatOptions from './Reducer/GroupChatOptions'




export const store = configureStore({
  reducer: {
    SnackbarOptions: SnackbarOptions.reducer,
    PageOptions: PageOptions.reducer,
    GroupChatOptions: GroupChatOptions.reducer,
    OneToOneChatOptions: OneToOneChatOptions.reducer,
    NotificationOptions: NotificationOptions.reducer,
    DialogOptions: DialogOptions.reducer,
    MHeaderOptions: MHeaderOptions.reducer
  }
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export const ShowPageLoader = (show: boolean) => Promise.resolve(store.dispatch(PageOptions.actions.ShowPageLoader(show)));

export const ShowToastMessage = (message: string) => Promise.resolve(() => {
  store.dispatch(SnackbarOptions.actions.Show(message))
  setTimeout(() => {
    store.dispatch(SnackbarOptions.actions.Close())
  }, 5000)
});