import React from "react";
import Navbar from "../component/Navbar";
import { Outlet } from "react-router-dom";

const Layout = () => (
    <>
        <Navbar />
        <div className="container-fluid">
            <div>
                <Outlet />
            </div>
        </div>
    </>
);

export default Layout;