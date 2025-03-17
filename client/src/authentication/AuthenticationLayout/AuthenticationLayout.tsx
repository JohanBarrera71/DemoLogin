import { Outlet } from "react-router";
import classes from "./AuthenticationLayout.module.scss";

export default function AuthenticationLayout() {
  return (
    <div className={classes.root}>
      <header className={classes.container}>
        <a href="/" className={classes.logoInfo}>
          <img src="/vite.svg" className={classes.logo} />
          <h1>Demo Login</h1>
        </a>
      </header>
      <main className={classes.container}>
        <Outlet />
      </main>
      <footer>
        <ul className={classes.container}>
          <li>
            <img src="/vite.svg" alt="" />
            <span>@ 2025</span>
          </li>
        </ul>
      </footer>
    </div>
  );
}
