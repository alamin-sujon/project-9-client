import ChatWidget from "@/components/shared/chatWidget";
import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar";
import React from "react";
const CommonLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <div className="">
        <Navbar />
        <div className=" mx-auto min-h-[calc(100vh-80px)]  px-5 md:px-0">
          {children}
        </div>
        <ChatWidget />
        <Footer />
      </div>
    </div>
  );
};

export default CommonLayout;
