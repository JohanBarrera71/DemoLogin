import { useAuthentication } from "./authentication/context/AuthContextProvider";
import classes from "./Home.module.scss";

export default function Home() {
  const { user } = useAuthentication();

  return (
    <div className={classes.root}>
      {user ? (
        <>
          <h1>
            Welcome <span>{user.fullname}</span>
          </h1>
          <img
            src={user.photoProfile ? user.photoProfile : "/vite.svg"}
            alt="user profile"
            className={classes.image}
          />
          <div className={classes.info}>
            <h4>Mail: {user.email}</h4>
            <h3>Full Name: {user.fullname}</h3>
          </div>
        </>
      ) : null}
    </div>
  );
}
