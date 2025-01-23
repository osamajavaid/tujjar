import Image from "next/image";
import loader from "@/assets/loader.gif";

const LoadingPage = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <Image src={loader} height={48} width={48} alt="Loading..." />
    </div>
  );
};

export default LoadingPage;
