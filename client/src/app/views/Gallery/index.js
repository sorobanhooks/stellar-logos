'use client'

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { formatAddress, formatNumber, readContract } from "../../utils/saveUtils";
import { getGoogleSheetData } from "../../utils/nexaflow";
import { useSelector } from "react-redux";
import { profileState } from "../../redux/profileSlice";
import { getPinataData } from "../../utils/pinata";
import { Loader } from "../../components/Loader";
import { IoArrowBackOutline } from "react-icons/io5";
import { contractFn, contractObj, twitterShare } from "../../utils/constants";
import Tranfer from "../../components/Transfer";
import { RiFileTransferLine } from "react-icons/ri";
import { BsTwitterX } from "react-icons/bs";
import { TwitterShareButton } from "react-share";
import { FiEye } from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";

const placeholder = "/placeholder.jpeg";

function Gallery() {
  const profile = useSelector(profileState);
  const [page, setPage] = useState("all");
  const [images, setImages] = useState("");
  const [transfer, setTransfer] = useState("");
  const [myNft, setMyNft] = useState("");
  const [loading, setLoading] = useState({ nftList: false, myNft: false });
  const [nftList, setNftList] = useState("");
  const nftPage = useRef({ list: 0, myNft: 0 });
  const [tokenId, setTokenId] = useState("");

  const observer = useRef(null);

  const heading = ["id", "cid", "wallet"];

  const fetchSheetData = async () => {
    try {
      const data = await getGoogleSheetData();

      if (data && data?.length) {
        const heading = data.shift();
        const resultArr = await Promise.all(
          data
            .map(async (arr) => {
              const obj = arr.reduce((acc, item, i) => {
                acc[heading[i]] = item;
                return acc;
              }, {});

              if (obj.image) {
                obj.cid = obj.image;
                obj.image = getPinataData(obj.image);
              }

              return obj;
            })
            .reverse()
        );
        setImages(resultArr);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAllData = async () => {
    try {
      const lastId =
        nftPage.current.list - 10 < 0 ? 0 : nftPage.current.list - 10;

      const args = [formatNumber(lastId), formatNumber(10)];
      setLoading((loading) => ({ ...loading, nftList: true }));
      const contractData = await readContract(
        contractFn.getAllMintedTokens,
        args
      );

      if (contractData && contractData.length) {
        const contractResult = await Promise.all(
          contractData.map(async (arr) => {
            const obj = arr.reduce((acc, item, i) => {
              acc[heading[i]] = item;
              return acc;
            }, {});
            return obj;
          })
        );

        if (contractResult && contractResult.length) {
          setNftList((nftList) => {
            if (!nftList) {
              return contractResult;
            }
            const oldNft = new Set(nftList.map((item) => item.id));
            const newNft = contractResult.filter(
              (item) => !oldNft.has(item.id)
            );
            const merged = [...nftList, ...newNft];
            nftPage.current = {
              ...nftPage.current,
              list: merged[merged.length - 1].id,
            };
            return merged;
          });
        }
      } else {
        setNftList([]);
      }
      setLoading((loading) => ({ ...loading, nftList: false }));
    } catch (error) {
      console.log(error);
      setLoading((loading) => ({ ...loading, nftList: false }));
    }
  };

  const fetchMyNft = async (tokenId) => {
    try {
      const lastId = tokenId - 10 <= 0 ? 0 : tokenId - 10;

      if (tokenId === lastId) return;

      // console.log(`Fetching NFTs: ${lastId} to ${tokenId}`);

      setLoading((loading) => ({ ...loading, myNft: true }));

      const args = [
        formatAddress(profile.wallet),
        formatNumber(lastId),
        formatNumber(10),
      ];
      const data = await readContract(contractFn.myTokens, args);

      if (data && data.length) {
        const contractResult = await Promise.all(
          data.map((arr) =>
            arr.reduce((acc, item, i) => {
              acc[heading[i]] = item;
              return acc;
            }, {})
          )
        );

        if (contractResult.length) {
          setMyNft((nftList) => {
            const existingIds = new Set(nftList && nftList?.map((item) => item.id));
            const newNfts = contractResult.filter((item) => !existingIds.has(item.id));
            const mergedNfts = [...(nftList || []), ...newNfts];

            nftPage.current = {
              ...nftPage.current,
              myNft: lastId,
            };
            return mergedNfts;
          });
        }
      }

      if ((!data || !data.length) && lastId > 0) {
        await fetchMyNft(lastId);
      }

      if (!data && lastId === 0 && !myNft) {
        setMyNft([]);
        nftPage.current = {
          ...nftPage.current,
          myNft: 0,
        };
      }
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    } finally {
      setLoading((loading) => ({ ...loading, myNft: false }));
    }
  };

  const getData = (id) => {
    try {
      const filterImage = images.filter((obj) => +obj?.id === id);
      return filterImage?.[0];
    } catch (error) {
      return "";
    }
  };

  useEffect(() => {
    fetchSheetData();
    readContract(contractFn.maxTokenId).then((data) => {
      nftPage.current.list = data;
      // nftPage.current.myNft = data - 10 < 0 ? 0 : data - 10;
      nftPage.current.myNft = data;
      setTokenId(data);
      fetchAllData();
      profile.wallet && fetchMyNft(nftPage.current.myNft);
    });
    if (!profile.wallet) {
      setPage("all");
      setMyNft("");
    }
  }, [profile.wallet]);

  const handlePage = async (page) => {
    setPage(page);
  };

  const elementRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          page === "account" ? fetchMyNft(nftPage.current.myNft) : fetchAllData();
        }
      });

      if (node) observer.current.observe(node);
    },
    [page]
  );

  return (
    <div className='relative flex flex-col items-center mb-10'>
      <Link href='/' className='absolute left-6 top-7'>
        <IoArrowBackOutline size={30} />
      </Link>
      <p className='mt-4 text-3xl text-center'>Gallery</p>
      <div className='flex items-center gap-5 my-10'>
        <button
          className={`duration-300 ease-in-out p-2 rounded-md hover:bg-white hover:text-black ${page === "all" ? "bg-white text-black" : "text-white"
            }`}
          onClick={() => handlePage("all")}
        >
          Recent Minted
        </button>
        <button
          onClick={() => handlePage("account")}
          disabled={!profile?.wallet}
          className={`duration-300 ease-in-out p-2 rounded-md ${profile.wallet ? "hover:bg-white hover:text-black" : "opacity-45"
            } ${page === "account" ? "bg-white text-black " : "text-white"}`}
        >
          My Stellar Logos
        </button>
      </div>
      {page === "account" ? (
        <NFT
          data={myNft}
          elementRef={elementRef}
          page={page}
          setTransfer={setTransfer}
          getData={getData}
          key={nftPage.current.myNft}
          loading={loading.myNft}
        />
      ) : (
        <NFT
          key={nftPage.current.list}
          data={nftList}
          elementRef={elementRef}
          page={page}
          setTransfer={setTransfer}
          getData={getData}
          loading={loading.nftList}
        />
      )}

      {transfer ? (
        <Tranfer
          setPopup={setTransfer}
          handleClose={() => {
            setMyNft("");
            nftPage.current.myNft = +tokenId;
            fetchMyNft(nftPage.current.myNft);
          }}
          popup={transfer}
        />
      ) : null}
    </div>
  );
}

export default Gallery;

const NFT = memo(
  ({ data, elementRef, getData, page, setTransfer, loading }) => {
    const handleClick = (hash) => {
      window.open(contractObj.transaction + hash, "_blank");
    };

    return (
      <div className='flex w-[70%]  mx-auto gap-3 flex-wrap  justify-center sm:justify-start '>
        {data && data.length ? (
          data.map((obj, index) => {
            const info = getData(obj?.id);
            return (
              <div
                key={obj?.id}
                className='relative flex flex-col items-start h-48 gap-2 p-3 duration-300 ease-in-out bg-white rounded-sm cursor-pointer w-44 hover:scale-105'
                onClick={() => page !== "account" && handleClick(info?.hash)}
                ref={index + 1 === data.length ? elementRef : null}
              >
                <Image
                  width={400} height={400}
                  className='object-contain w-full h-full m-auto'
                  src={info?.image || placeholder}
                  alt="NFT Image"
                />
                {page === "account" ? (
                  <div className='absolute top-0 left-0 flex items-center justify-center w-full h-full bg-black bg-opacity-50 opacity-0 hover:opacity-100'>
                    <div className='flex items-center justify-center p-2 text-black bg-white rounded-md '>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTransfer(obj?.id);
                        }}
                        className='p-1 bg-black bg-opacity-0 rounded-md hover:bg-opacity-10 '
                      >
                        <RiFileTransferLine size={20} />
                      </button>
                      <TwitterShareButton url={twitterShare(info.cid)}>
                        <button className='p-1 bg-black bg-opacity-0 rounded-md hover:bg-opacity-10 '>
                          <BsTwitterX size={18} />
                        </button>
                      </TwitterShareButton>
                      <button
                        className='p-1 bg-black bg-opacity-0 rounded-md hover:bg-opacity-10 '
                        onClick={() => handleClick(info?.hash)}
                      >
                        <FiEye />
                      </button>
                    </div>
                  </div>
                ) : null}
                <span className='absolute bottom-0 text-sm font-bold text-black'>
                  Stellar logo #{obj?.id}
                </span>
              </div>
            );
          })
        ) : data && !data.length ? (
          <div className='h-[60vh] flex items-center flex-col  w-full justify-center'>
            <p className='text-lg '>No Nft Found</p>
            <Link href='/' className='p-2 mt-4 text-black bg-white rounded-md'>
              Mint Now
            </Link>
          </div>
        ) : (
          <div className='h-[60vh] flex items-center w-full justify-center'>
            <Loader />
          </div>
        )}

        {loading && data.length ? (
          <div className='flex items-center justify-center w-full mt-3 '>
            <Loader />
          </div>
        ) : null}
      </div>
    );
  }
);

NFT.displayName = 'NFT';