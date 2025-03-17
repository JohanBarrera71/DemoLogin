import { Outlet } from "react-router";
import classes from "./ApplicationLayout.module.scss";
import Header from "../Header/Header";

export default function ApplicationLayout() {
  return (
    <div className={classes.root}>
      <Header />
      <main className={classes.container}>
        <Outlet />
      </main>
    </div>
  );
}
