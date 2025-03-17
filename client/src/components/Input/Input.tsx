import { InputHTMLAttributes } from "react";
import classes from "./Input.module.scss";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: string;
  size?: "sm" | "md" | "lg";
};

export default function Input({ label, size, width, ...others }: InputProps) {
  return (
    <div className={`${classes.root} ${classes[size || "lg"]}`}>
      {label ? (
        <label className={classes.label} htmlFor={others.id}>
          {label}
        </label>
      ) : null}
      <input {...others} style={{ width: width ? `${width}px` : "100%," }} />
    </div>
  );
}
