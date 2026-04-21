"use client";

import "react-toastify/dist/ReactToastify.css";
import { Flip, ToastContainer } from "react-toastify";

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <ToastContainer
        toastClassName={"rounded-lg w-[calc(100vw-2rem)] max-w-md text-center"}
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Flip}
      />
    </>
  );
};

export default ToastProvider;
