import Image from "../../../views/Image";
import { getGoogleSheetData } from "../../../utils/nexaflow";
import { getPinataData } from "../../../utils/pinata";


const fetchSheetData = async (cid) => {
  try {
    const data = await getGoogleSheetData();
    if (data && data?.length) {
      const heading = data.shift();
      const result = await Promise.all(
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

      );
      return result.filter(obj => obj?.cid === `ipfs://${cid}`)

    }
  } catch (error) {
    console.log(error);
  }
};



export async function generateMetadata({ params }) {
  const hash = (await params).hash;
  try {
    const image = `https://ipfs.io/ipfs/${hash}`
    return {
      title: "Stellar NFT Logo",
      description: "Shared content from IPFS",
      openGraph: {
        type: "website",
        url: `/share/${hash}`,
        title: "Stellar NFT Logo",
        description: "Shared content from IPFS",
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: "Stellar NFT Logo"
          }
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "Stellar NFT Logo",
        description: "Shared content from IPFS",
        images: [image]
      },
    };
  } catch (error) {
    console.error("Metadata generation error:", error);
    return {
      title: "Error Loading Image",
      description: "Unable to fetch image metadata",
      openGraph: {
        type: "website",
        title: "Error Loading Image",
        description: "Unable to fetch image metadata",
        images: [
          {
            url: `/fallback-image.png`,
            width: 1200,
            height: 630,
          }
        ]
      }
    };
  }
}


async function page({ params }) {
  const hash = (await params).hash;
  const data = await fetchSheetData(hash);
  return (
    <Image hash={hash} data={data[0]} />
  )
}

export default page