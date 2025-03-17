import { ButtonHTMLAttributes } from "react";
import classes from "./Button.module.scss";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  outline?: boolean;
  size?: "sm" | "md" | "lg";
};

export default function Button({
  outline,
  size = "lg",
  className,
  children,
  ...others
}: ButtonProps) {
  return (
    <button
      {...others}
      className={`${classes.root} ${outline ? classes.outline : ""} ${
        classes[size]
      } ${className}`}
    >
      {children}
    </button>
  );
}
