// store.ts
import { createStore } from 'redux';

interface AppState {
  inputValue: string;
}

const initialState: AppState = {
  inputValue: '',
};

const reducer = (state: AppState = initialState, action: any) => {
  switch (action.type) {
    case 'SET_INPUT_VALUE':
      return { ...state, inputValue: action.payload };
    default:
      return state;
  }
};

const store = createStore(reducer);

export default store;
