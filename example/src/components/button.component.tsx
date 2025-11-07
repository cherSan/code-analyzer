import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({
                                                  children,
                                                  onClick,
                                                  variant = 'primary'
                                              }) => {
    const unusedVariable = 'This should trigger lint warning'; // Линтер должен это поймать

    return (
        <button
            className={`btn btn-${variant}`}
            onClick={onClick}
            style={{ padding: '10px' }}
        >
            {children}
        </button>
    );
};

// Еще один неиспользуемый компонент для теста
const UnusedComponent = () => {
    return <div>Never used</div>;
};