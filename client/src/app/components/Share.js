import { FaXTwitter as Twitter } from "react-icons/fa6";
import Image from "next/image";
import { IoMdClose } from "react-icons/io";
import { getPinataData } from "../utils/pinata";
import { contractObj, twitterShare } from "../utils/constants";
import { TwitterShareButton } from "react-share";

function Share({ setPopup, popup }) {

  const closePopup = () => {
    setPopup(false);
  };


  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          textAlign: "center",
        }}
        className="flex flex-col justify-center  w-[50%] sm:w-[40%] "
      >
        <div className="flex justify-end">

          <div style={{ color: "white", cursor: "pointer", }} onClick={closePopup} className="p-2 bg-red-600"><IoMdClose /></div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <a href={contractObj?.transaction + popup?.hash} target="_blank" className="duration-200 hover:scale-105" >
            <Image
              style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", }}
              width={400}
              height={400}
              src={getPinataData(popup?.image)}
              alt="NFT Image"
              className='object-contain mt-4 sm:w-[300px] max:w-[150px] h-[250px]'
            />
          </a>
          <br />

          <p className="text-lg font-medium" >NFT Minted Successfully</p>

          <TwitterShareButton url={twitterShare(popup?.image)}>
            <button
              className="flex items-center justify-center gap-2 p-2 mt-4 text-white bg-black rounded-md"
            >
              <Twitter size={20} />
              <p>Share on Twitter</p>
            </button>
          </TwitterShareButton>
        </div>

      </div>
    </div>
  );
};

export default Share;
