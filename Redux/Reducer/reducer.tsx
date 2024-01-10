const initialState = {
    searchTerm: '',
  };
  
  export const searchReducer = (state = initialState, action: { type: any; payload: any; }) => {
    switch (action.type) {
      case 'SET_SEARCH_TERM':
        return { ...state, searchTerm: action.payload };
      default:
        return state;
    }
  };