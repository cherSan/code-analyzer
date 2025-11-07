import { useState } from 'react';

export const useCounter = (initialValue: number = 0) => {
    const [count, setCount] = useState(initialValue);

    const increment = () => setCount(count + 1);
    const decrement = () => setCount(count - 1);
    const reset = () => setCount(initialValue);

    const unusedFunction = () => {
        console.log('This function is never used');
    };

    return {
        count,
        increment,
        decrement,
        reset
    };
};