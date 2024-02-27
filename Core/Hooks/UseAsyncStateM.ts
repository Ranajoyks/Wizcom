import { useState } from "react";

const useAsyncState = <T,>(initialState: T | undefined = undefined) => {
    const [state, setState] = useState(initialState);

    const asyncSetState = (value: T) => {
        return new Promise(resolve => {
            setState(value);
            setState((current) => {
                resolve(current);
                return current;
            });
        });
    };

    return [state, asyncSetState];
};

export default useAsyncState