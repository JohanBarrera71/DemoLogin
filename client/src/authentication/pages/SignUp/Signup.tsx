import { FormEvent, useState } from "react";
import Input from "../../../components/Input/Input";
import Box from "../../components/Box/Box";
import classes from "./Signup.module.scss";
import Button from "../../../components/Button/Button";
import Separator from "../../components/Separator/Separator";
import { Link, useNavigate } from "react-router";
import { useAuthentication } from "../../context/AuthContextProvider";

export default function Signup() {
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuthentication();

  const doSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = e.currentTarget.email.value;
    const password = e.currentTarget.password.value;
    const fullname = e.currentTarget.fullname.value;
    const confirmPassword = e.currentTarget.confirmPassword.value;
    const photoProfile = e.currentTarget.photoProfile.files[0];

    if (!photoProfile) {
      setErrorMessage("Please upload a profile picture.");
      return;
    }

    setIsLoading(true);

    try {
      await signup(email, password, fullname, confirmPassword, photoProfile);
      navigate("/");
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An error ocurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={classes.root}>
      <Box>
        <h1>Sign up</h1>
        <form onSubmit={doSignup}>
          <Input type="email" id="email" label="Email" />
          <Input type="text" id="fullname" label="Full Name" />
          <Input type="password" id="password" label="Password" />
          <Input
            type="password"
            id="confirmPassword"
            label="Confirm Password"
          />
          <div>
            <label htmlFor="phtotProfile">Profile Picture:</label>
            <input
              type="file"
              id="photoProfile"
              name="photoProfile"
              accept="image/*"
            />
          </div>
          {errorMessage && <p className={classes.error}>{errorMessage}</p>}
          <Button type="submit" disabled={isLoading}>
            Join
          </Button>
        </form>
        <Separator>Or</Separator>
        <div className={classes.register}>
          Already on Demo Login? <Link to="/authentication/login">Sign in</Link>
        </div>
      </Box>
    </div>
  );
}
