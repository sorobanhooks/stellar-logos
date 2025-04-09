"use client"
import { motion } from "framer-motion";
import { FaXTwitter as Twitter } from "react-icons/fa6";
import { Menu, MenuItem, MenuButton } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/zoom.css";
import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  ALBEDO_ID,
  FREIGHTER_ID,
} from "@creit.tech/stellar-wallets-kit";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { BtnLoader } from "../../components/Loader";
import { contractFn, contractObj, envObj, social } from "../../utils/constants";
import { Logo } from "../../components/Logo";
import { ColorPicker } from "../../components/ColorPicker";
import { useEffect, useRef, useState } from "react";
import {
  getBalance,
  mintFn,
  pinToIPFS,
  readContract,
  saveSvgAsImage,
} from "../../utils/saveUtils";
import { useColorTransition } from "../../hooks/useColorTransition";
import { postGoogleSheetData } from "../../utils/nexaflow";
import { profileFn, profileState } from "../../redux/profileSlice";
import Share from "../../components/Share"

export const walletFn = (key) => {
  return new StellarWalletsKit({
    network: envObj.network === 'testnet' ? WalletNetwork.TESTNET : WalletNetwork.PUBLIC,
    selectedWalletId: key === "albedo" ? ALBEDO_ID : FREIGHTER_ID,
    modules: allowAllModules(),
  });
};

function Home() {
  const { gradient, isPaused, togglePause } = useColorTransition();
  const { gradient: btnGradient } = useColorTransition();
  const logoRef = useRef(null);
  const [count, setCount] = useState(1);
  const account = useSelector(profileState);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [share, setShare] = useState('')
  const [totalMint, setTotalMint] = useState(0);


  useEffect(() => {
    readContract(contractFn.maxTokenId).then(data => setTotalMint(data))
  }, [loading, account, share])

  const handleWalletSuccess = async (key) => {
    const { address } = await walletFn(key).getAddress();
    if (address) {
      const balance = await getBalance(address);
      let loginObj = {
        wallet: address,
        balance: balance?.[0]?.balance,
        provider: key,
      };
      dispatch(profileFn(loginObj));
      localStorage.setItem("auth", JSON.stringify(loginObj));
    }
  };

  const handleSave = async () => {
    if (logoRef.current) {
      return await saveSvgAsImage(logoRef.current, gradient);
    }
  };

  const handleDecrease = () => {
    setCount((prevCount) => Math.max(prevCount - 1, 1));
  };

  const handleIncrease = () => {
    setCount((prevCount) => prevCount + 1);
  };

  const addIpfsPrefix = (hash) => `ipfs://${hash}`;

  const mint = async () => {
    try {
      setLoading(true);
      togglePause();

      setTimeout(async () => {
        const file = await handleSave();
        // console.log("file created");
        if (!file) {
          setLoading(false);
          return;
        }

        const formdata = new FormData();
        formdata.append("file", file);

        const nftIpfs = await pinToIPFS(formdata, false);

        if (!nftIpfs) {
          setLoading(false);
          return null;
        }
        const image = addIpfsPrefix(nftIpfs?.IpfsHash);
        const jsonData = {
          image,
          stellar_metadata: {
            network: "public/testnet",
            contract_address: contractObj.address,
          },
          category: "image",
        };

        const pinJsonData = await pinToIPFS(jsonData, true);

        if (!pinJsonData) {
          setLoading(false);
          return null;
        }


        const transaction = await mintFn(
          account?.wallet,
          addIpfsPrefix(pinJsonData?.IpfsHash),
          account?.provider
        );

        if (!transaction) {
          setLoading(false);
          return;
        }

        const sheetData = [
          [transaction?.token_id, account.wallet, image, transaction?.hash],
        ];
        // console.log(sheetData);
        const result = await postGoogleSheetData(sheetData);

        if (!result) {
          setLoading(false);
          return;
        }

        setLoading(false);
        togglePause();
        setShare({
          image,
          hash: transaction?.hash,
          tokenId: transaction?.token_id
        })
        toast.success("Check the Gallery for Minted NFT");
      }, 1500);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const bulkMint = async () => {
    try {
      const results = [];
      setLoading(true);

      const bulkMintInit = async () => {
        const finalData = results.map((obj) =>
          addIpfsPrefix(obj.pinJsonData.IpfsHash)
        );
        // console.log(finalData, "bulk mint data");

        const transaction = await mintFn(
          account?.wallet,
          finalData,
          account?.provider,
          true
        );

        if (!transaction) {
          setLoading(false);
          return;
        }
        // console.log(transaction);
        const sheetData = results.map((obj, i) => [
          transaction?.token_id?.[i]?.value(),
          account.wallet,
          addIpfsPrefix(obj?.nftIpfs?.IpfsHash),
          transaction?.hash,
        ]);
        // console.log(sheetData);
        const result = await postGoogleSheetData(sheetData);

        if (!result) {
          setLoading(false);
          return;
        }
        setLoading(false);
        setShare({
          image: sheetData[0][2],
          hash: sheetData[0][3],
          tokenId: sheetData[0][1]
        })

        toast.success("Check the Gallery for Minted NFT");
      };

      const handleMint = async (remainingCount) => {
        if (remainingCount <= 0) {
          // console.log("All iterations completed:", results);
          bulkMintInit();
          return;
        }

        togglePause();

        const file = await handleSave();
        if (!file) {
          setLoading(false);
          togglePause();
          return;
        }

        const formdata = new FormData();
        formdata.append("file", file);

        const nftIpfs = await pinToIPFS(formdata, false);
        if (!nftIpfs) {
          setLoading(false);
          togglePause();
          return null;
        }

        const image = addIpfsPrefix(nftIpfs?.IpfsHash);
        const jsonData = {
          image,
          stellar_metadata: {
            network: "public/testnet",
            contract_address: contractObj.address,
          },
          category: "image",
        };

        const pinJsonData = await pinToIPFS(jsonData, true);
        if (!pinJsonData) {
          setLoading(false);
          togglePause();
          return null;
        }

        results.push({ nftIpfs, pinJsonData });
        // console.log(`Iteration complete, remaining: ${remainingCount - 1}`);

        togglePause();

        setTimeout(() => handleMint(remainingCount - 1), 1000);
      };

      handleMint(count);
    } catch (error) {
      console.error("Error in bulkMint:", error);
      setLoading(false);
      togglePause();
    }
  };

  // return null;

  return (
    <div className='relative text-black bg-black'>
      <div className='w-full px-4 my-24 text-center '>
        <h1 className='w-full mb-6 text-4xl font-bold text-white md:text-6xl animate-fade-in'>
          🚀 Own Your Stellar Identity! 🌟
        </h1>
        <p className='mb-8 leading-relaxed text-purple-100 sm:text-xl text-md md:text-2xl'>
          10,000 unique logos for the Stellar community. First 1,000 are FREE,
          then just 1 XLM to mint.
          <br />
          Be the face of Stellar — claim your cosmic badge today! 💫
        </p>
      </div>

      <main className='sm:w-[440px] max:w-[320px] overflow-hidden  mx-auto '>
        {/* <div className=' bg-gradient-to-b from-transparent to-black/50' /> */}

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className='relative z-10 flex flex-col items-center justify-center w-full gap-5'
        >
          <div className=' max-w-[320px] sm:max-w-[440px] h-[320px] sm:h-[440px] flex items-center justify-center p-4 sm:p-6 bg-white/90 rounded-xl'>
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
              }}
              className='flex items-center justify-center w-full h-full'
            >
              <Logo ref={logoRef} gradient={gradient} />
            </motion.div>
            <div className='hidden p-8 border bg-black/50 rounded-xl backdrop-blur-sm border-white/10'>
              <ColorPicker gradient={gradient} isAnimating={!isPaused} />
            </div>
          </div>
          {totalMint ? <div className="flex flex-col  items-center bg-white text-black relative z-40 p-3 rounded-lg justify-between max-w-[320px] sm:max-w-[440px] w-full gap-2  shadow-lg">
            <p className="flex-1 font-medium text-md ">
              <span className="font-semibold">Total Minted:</span> {totalMint}
            </p>
            <p className="flex-1 text-sm font-medium ">
              <span className="font-semibold">Only {10000 - totalMint} Remaining </span>
            </p>
            {/* in Free Mint! */}
          </div> : null}
          <div className='flex items-center relative z-40  max-w-[320px] sm:max-w-[440px] w-full gap-2'>
            <div className='flex w-full'>
              <button
                className='px-5 py-2 bg-gray-200 rounded-l sm:px-6'
                onClick={handleDecrease}
              >
                {" "}
                -{" "}
              </button>
              <input
                type='number'
                className='w-16 py-2 text-center sm:w-24'
                value={count}
                readOnly
              />
              <button
                className='px-5 py-2 bg-gray-200 rounded-r sm:px-6'
                onClick={handleIncrease}
              >
                {" "}
                +{" "}
              </button>
            </div>
            <div className='w-full'>
              {!account?.wallet && (
                <Menu
                  gap={3}
                  menuButton={
                    <MenuButton className='w-full h-10 text-sm text-black bg-white rounded '>
                      Connect Wallet
                    </MenuButton>
                  }
                >
                  <MenuItem
                    className='flex w-full overflow-hidden  sm:w-[220px] items-center justify-center h-10 text-center text-black cursor-pointer '
                    onClick={() => handleWalletSuccess("albedo")}
                  >
                    Albedo
                  </MenuItem>
                  <MenuItem
                    className='flex w-full overflow-hidden sm:w-[220px] items-center justify-center h-10 text-center text-black cursor-pointer'
                    onClick={() => handleWalletSuccess("freighter")}
                  >
                    Freighter
                  </MenuItem>
                </Menu>
              )}
              {account?.wallet ? (
                <button
                  style={{
                    background: account?.balance && `linear-gradient(to right, rgb(${btnGradient?.start.r}, ${btnGradient?.start.g}, ${btnGradient?.start.b}), rgb(${btnGradient?.end.r}, ${btnGradient?.end.g}, ${btnGradient?.end.b}))`,
                  }}
                  disabled={!account?.balance || loading}
                  onClick={() => (count === 1 ? mint() : bulkMint())}
                  className={`w-full h-10 flex items-center justify-center gap-3 text-white ${!account.balance ? "bg-red-600" : "bg-green-500"
                    } rounded sm:text-base `}
                >
                  {!account?.balance ? "Insufficient Balance" : "Mint"}
                  {loading ? <BtnLoader /> : null}
                </button>
              ) : null}
            </div>
          </div>

          {/* <div className='flex hidden gap-4 mt-4'>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={togglePause}
              className='flex items-center gap-2 px-6 py-3 font-medium text-white transition-colors rounded-full bg-white/10 hover:bg-white/20'
            >
              {isPaused ? "Resume Animation" : "Pause Animation"}
            </motion.button>
            <SaveButton onClick={handleSave} />
          </div> */}

          {/* <div className='hidden mt-8 text-center'>
            <h2 className='mb-4 text-2xl font-bold text-white'>
              Gradient Color Transitions
            </h2>
            <p className='max-w-2xl text-gray-300'>
              Watch as the logo smoothly transitions through beautiful gradient
              combinations. Pause the animation at any time to save your
              favorite variation.
            </p>
          </div> */}
        </motion.div>
      </main>
      {share ? <Share setPopup={setShare} popup={share} /> : null}

      <div className='sm:w-1/2 max:w-[320px] px-4 mx-auto my-12 text-center'>
        <h3 className='mb-4 text-xl font-semibold text-white'>
          Mainnet Contract Address
        </h3>
        <div
          onClick={() =>
            window.open(
              `${contractObj.explorer}${contractObj.address}`,
              "_blank"
            )
          }
          className='w-full p-4 mx-auto overflow-hidden duration-150 bg-white rounded-lg cursor-pointer text-ellipsis hover:scale-105'
        >
          {contractObj.address}
        </div>
      </div>

      {/* <div className='sm:w-1/2 max:w-[320px] mx-auto mb-12 '>
        <div className='container px-4 mx-auto'>
          <h2 className='mb-8 text-3xl font-bold text-center text-white'>
            Community Buzz
          </h2>
          <div className='w-full h-20 py-4 mb-3 rounded-xl'>
            <Timeline
              dataSource={{
                sourceType: "profile",
                screenName: social.twitter,
              }}
              options={{
                height: "400",
              }}
            />
          </div>
        </div>
      </div> */}

      <footer className='flex items-center justify-center w-full mb-6 mt-52'>
        <div className='flex items-center gap-2 mt-auto'>
          <p className='text-white '>Created By</p>
          <a
            href={`https://twitter.com/${social.twitter}`}
            target='_blank'
            className='flex items-center gap-1 text-white transition-colors hover:text-blue-400'
          >
            <Twitter size={20} />@{social.twitter}
          </a>
        </div>
      </footer>
      {/* <footer className='hidden mb-16'>
        <div className='container flex items-center justify-between px-6 mx-auto'>
          <p className='text-sm text-gray-400'>
            © 2024 Stellar. All rights reserved.
          </p>
          <div className='flex space-x-6'>
            <a
              href='#'
              className='text-gray-400 transition-colors hover:text-white'
            >
              <Github size={20} />
            </a>
           
            <a
              href='#'
              className='text-gray-400 transition-colors hover:text-white'
            >
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </footer> */}
    </div>
  );
}

export default Home;

