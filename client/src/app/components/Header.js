import { motion } from "framer-motion";

import { Menu, MenuItem, MenuButton } from "@szhsin/react-menu";
import { walletFn } from "../views/Home";
import { useDispatch, useSelector } from "react-redux";
import { profileFn, profileState } from "../redux/profileSlice";
import { logoutFn } from "../redux/logoutSlice";
import { getBalance } from "../utils/saveUtils";
import Link from "next/link";
import Image from "next/image";

const logo = "/logo.png";

function Header() {
  const dispatch = useDispatch();

  const account = useSelector(profileState);
  const connectWallet = async (key) => {
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

  const disconnect = () => dispatch(logoutFn());
  return (
    <header className='z-50 px-3 bg-black position-relative'>
      <nav className='container flex items-center justify-between px-1 py-6 mx-auto text-white sm:px-6'>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className='text-xl font-bold'
        >
          <Link href='/' className='flex items-center space-x-2 '>
            <Image width={200} height={200} src={logo} alt='Stellar Logo NFT' className='object-contain w-8 h-8'></Image>
            <span className='hidden text-2xl font-bold sm:block'>
              Stellar Logo NFT
            </span>
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className='flex justify-center space-x-8'
        >
          <div className='relative z-50 flex space-x-4'>
            <Link
              href='/gallery'
              className='px-4 py-2 text-white transition-colors hover:text-gray-500'
            >
              Gallery
            </Link>
            <Menu
              gap={6}
              menuButton={
                <MenuButton className='w-[150px] relative !ml-0 z-50  text-black  transition-colors bg-white rounded'>
                  {account?.wallet
                    ? `${account?.wallet.slice(0, 6)}...${account?.wallet.slice(
                      account?.wallet?.length - 6,
                      account?.wallet?.length
                    )}`
                    : "Connect Wallet"}
                </MenuButton>
              }
            >
              <div className=''>
                {!account?.wallet && (
                  <>
                    <MenuItem
                      className='flex items-center justify-center '
                      onClick={() => connectWallet("albedo")}
                    >
                      Albedo
                    </MenuItem>
                    <MenuItem
                      className='flex items-center justify-center '
                      onClick={() => connectWallet("freighter")}
                    >
                      Freighter
                    </MenuItem>
                  </>
                )}
                {account?.wallet ? (
                  <MenuItem
                    onClick={disconnect}
                    className='text-center text-black '
                  >
                    Disconnect
                  </MenuItem>
                ) : null}
              </div>
            </Menu>
          </div>
        </motion.div>
      </nav>
    </header>
  );
}

export default Header;
