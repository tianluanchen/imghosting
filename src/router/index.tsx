import { createHashRouter, Navigate } from "react-router-dom";
import { getRoutes } from "@/config";
import Layout from "@/layout";

const router = createHashRouter([
    {
        path: "/",
        element: <Layout />,
        children: getRoutes()
    },
    {
        path: "*",
        element: <Navigate to="/"></Navigate>
    }
]);
export default router;
