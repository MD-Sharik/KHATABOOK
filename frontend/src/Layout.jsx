import React, { useRef, useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import LoadingBar from "react-top-loading-bar";
import NavBar from "./components/NavBar";

function Layout() {
  const loadingBarRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unlisten = navigate((location, action) => {
      if (action !== "POP") {
        setIsLoading(true);
        loadingBarRef.current.continuousStart();
      }
    });

    return () => {
      unlisten();
    };
  }, [navigate]);

  useEffect(() => {
    if (isLoading) {
      loadingBarRef.current.complete();
      setIsLoading(false);
    }
  }, [location, isLoading]);

  return (
    <>
      <LoadingBar color="#2998ff" ref={loadingBarRef} />
      <NavBar />
      <Outlet />
    </>
  );
}

export default Layout;
