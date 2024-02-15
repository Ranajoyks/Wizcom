import { configureStore } from '@reduxjs/toolkit'
import SnackbarOptions from './Reducer/SnackbarOptions'
import PageOptions from './Reducer/PageOptions'
import ChatUserOptions from './Reducer/ChatUserOptions'
import DialogOptions from './Reducer/DialogOptions'




export const store = configureStore({
  reducer: {
    SnackbarOptions: SnackbarOptions.reducer,
    PageOptions: PageOptions.reducer,
    ChatUserOptions: ChatUserOptions.reducer,
    DialogOptions: DialogOptions.reducer
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