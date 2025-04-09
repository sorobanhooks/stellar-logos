import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { transferFn } from "../utils/saveUtils";
import { useSelector } from "react-redux";
import { profileState } from "../redux/profileSlice";
import { BtnLoader } from "./Loader";

function Tranfer({ setPopup, popup, handleClose }) {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  const profile = useSelector(profileState);

  const closePopup = () => {
    setPopup(false);
    setInputValue(""); // Reset input when closing the popup
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await transferFn(
        profile?.wallet,
        inputValue,
        popup,
        profile?.provider
      );
      setLoading(false);
      setInputValue("");
      setPopup("");
      handleClose();
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
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
        className='flex flex-col justify-center w-[80%] sm:w-[60%] lg:w-[35%] '
      >
        <div className='relative flex items-center justify-center'>
          <h2 className='text-xl font-medium text-center text-black'>
            Transfer
          </h2>
          <div
            style={{ color: "white", cursor: "pointer" }}
            onClick={closePopup}
            className='absolute right-0 p-2 bg-red-600'
          >
            <IoMdClose />
          </div>
        </div>
        <label className='mt-5 text-sm font-medium text-left text-black sm:text-md'>
          Recipient Address
        </label>

        <input
          type='text'
          value={inputValue}
          onChange={handleInputChange}
          className='text-sm'
          placeholder='Enter recipient address'
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            color: "black",
          }}
        />
        <br />

        <button
          onClick={handleSubmit}
          className='flex items-center justify-center gap-3 text-white'
          disabled={!inputValue.trim() || loading}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "4px",
            backgroundColor: inputValue.trim() ? "black" : "#ccc",
            color: "white",
            cursor: inputValue.trim() ? "pointer" : "not-allowed",
          }}
        >
          Submit {loading ? <BtnLoader /> : null}
        </button>
      </div>
    </div>
  );
}

export default Tranfer;
