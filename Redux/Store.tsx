import { combineReducers } from 'redux';
import { searchReducer } from './Reducer/reducer';

const rootReducer = combineReducers({
  // other reducers,
  search: searchReducer,
});

export default rootReducer;