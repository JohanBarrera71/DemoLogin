import { Link } from "react-router";
import { useAuthentication } from "../../authentication/context/AuthContextProvider";
import Button from "../Button/Button";
import classes from "./Header.module.scss";

export default function Header() {
  const { logout } = useAuthentication();
  return (
    <header className={classes.root}>
      <div className={classes.container}>
        <div className={classes.left}>
          <img src="/vite.svg" alt="logo" className={classes.logo} />
          <h1 className={classes.title}>Demo Login</h1>
        </div>
        <div className={classes.right}>
          <Button size="md">
            <Link
              to="/logout"
              onClick={(e) => {
                e.preventDefault();
                logout();
              }}
            >
              Logout
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
