import React from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    size?: Size;
    className?: string;
};

const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    transition: "background-color 120ms ease, opacity 120ms ease",
};

const variantStyles: Record<Variant, React.CSSProperties> = {
    primary: {
        backgroundColor: "#2563eb",
        color: "#fff",
    },
    secondary: {
        backgroundColor: "#e5e7eb",
        color: "#111827",
    },
    ghost: {
        backgroundColor: "transparent",
        color: "#2563eb",
    },
};

const sizeStyles: Record<Size, React.CSSProperties> = {
    sm: { padding: "6px 10px", fontSize: 14 },
    md: { padding: "8px 14px", fontSize: 16 },
    lg: { padding: "12px 18px", fontSize: 18 },
};

const Button: React.FC<ButtonProps> = ({
    children,
    variant = "primary",
    size = "md",
    className,
    style,
    disabled,
    ...rest
}) => {
    const combinedStyle: React.CSSProperties = {
        ...baseStyle,
        ...variantStyles[variant],
        ...sizeStyles[size],
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? "none" : undefined,
        ...style,
    };

    return (
        <button
            {...rest}
            type={rest.type ?? "button"}
            className={className}
            style={combinedStyle}
            aria-disabled={disabled || undefined}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;