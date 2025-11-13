import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {cn} from "@/lib/utils";
import IntrinsicElements = React.JSX.IntrinsicElements;

const text = cva("font-sans", {
    variants: {
        variant: {
            default: "text-gray-100",
            error: "text-red-600",
            warning: "text-yellow-600",
            success: "text-green-600",
            info: "text-blue-600",
        },
        size: {
            small: "text-sm",
            medium: "text-base",
            large: "text-lg",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "medium",
    },
});

export type TextProps = VariantProps<typeof text> & {
    as?: keyof IntrinsicElements;
    children: React.ReactNode;
    className?: string;
};

export const Text: React.FC<TextProps> = ({
                                              as: Component = "span",
                                              variant,
                                              size,
                                              children,
                                              className,
                                              ...props
                                          }) => {
    return (
        <Component className={cn(text({ variant, size }), className)} {...props}>
            {children}
        </Component>
    );
};

const header = cva("font-sans font-bold", {
    variants: {
        variant: {
            default: "text-gray-900",
            error: "text-red-600",
            warning: "text-yellow-600",
            success: "text-green-600",
            info: "text-blue-600",
        },
        level: {
            h1: "text-4xl",
            h2: "text-3xl",
            h3: "text-2xl",
            h4: "text-xl",
            h5: "text-lg",
            h6: "text-base",
        },
    },
    defaultVariants: {
        variant: "default",
        level: "h1",
    },
});

export type HeaderProps = VariantProps<typeof header> & {
    as?: keyof IntrinsicElements;
    children: React.ReactNode;
};

export const Header: React.FC<HeaderProps> = ({
                                                  as: Component,
                                                  variant,
                                                  level,
                                                  children,
                                                  ...props
                                              }) => {
    const Tag = Component || level || "h1";
    return (
        <Tag className={header({ variant, level })} {...props}>
            {children}
        </Tag>
    );
};


const code = cva("font-mono bg-gray-100 rounded p-1", {
    variants: {
        variant: {
            default: "text-gray-800",
            inline: "text-gray-800 bg-gray-100 px-1 py-0.5 rounded",
            block: "text-gray-800 bg-gray-900 text-white p-2 rounded",
        },
        size: {
            small: "text-sm",
            medium: "text-base",
            large: "text-lg",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "medium",
    },
});

export type CodeProps = VariantProps<typeof code> & {
    as?: "code" | "pre";
    children: React.ReactNode;
};

export const Code: React.FC<CodeProps> = ({
                                              as: Component = "code",
                                              variant,
                                              size,
                                              children,
                                              ...props
                                          }) => {
    return (
        <Component className={code({ variant, size })} {...props}>
            {children}
        </Component>
    );
};
