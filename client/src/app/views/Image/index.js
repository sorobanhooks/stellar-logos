import Image from "next/image";
import { contractObj } from "../../utils/constants";

async function NFTImage({ data }) {

  return (
    <div className="flex items-center justify-center w-full h-screen text-white ">
      <div className="w-full max-w-sm p-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-center">NFT</h2>
        <div className="space-y-2">
          <p>
            <span className="font-semibold">Token ID:</span> {data?.id}
          </p>
          <p>
            <span className="font-semibold">Wallet:</span>
            <a className="block truncate duration-150 hover:scale-105" target="_blank" href={`${contractObj.account}${data?.wallet}`} >{`${data?.wallet.slice(0, 10)}...${data?.wallet.slice(
              data?.wallet?.length - 10,
              data?.wallet?.length
            )}`}</a>
          </p>
          <p>
            <span className="block font-semibold ">Transaction Hash:</span>{" "}
            <a href={`${contractObj.transaction}${data?.hash}`} target="_blank" className="block truncate duration-150 hover:scale-105">{data.hash}</a>
          </p>
        </div>
        <div className="mt-6">
          <Image
            width={400}
            height={400}
            src={data?.image}
            alt="NFT Image"
            className="object-contain w-full h-auto rounded-md shadow-md"
          />
        </div>
        <div className="flex flex-col items-center justify-center mt-6">
          <p className="font-semibold">If you haven&lsquo;t minted your NFT </p>
          <a href='/' className='p-2 mt-4 text-black bg-white rounded-md'>
            Mint Now
          </a>
        </div>

      </div>
    </div>
  );
}

export default NFTImage;