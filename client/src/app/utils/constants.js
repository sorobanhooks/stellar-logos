export const envObj = {
  pinataDomain: process.env.NEXT_PUBLIC_PINATA_DOMAIN,
  pinataApiToken: process.env.NEXT_PUBLIC_PINATA_API_TOKEN,
  network: process.env.NEXT_PUBLIC_ENV_TYPE,
  nexaflowApiKey: process.env.NEXT_PUBLIC_NEXAFLOW_API_KEY,
  address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
  base_url: process.env.NEXT_PUBLIC_BASE_URL
};

const testnet = {
  address: envObj.address,
  horizon: "https://horizon-testnet.stellar.org",
  soroban: "https://soroban-testnet.stellar.org:443",
  explorer: "https://stellar.expert/explorer/testnet/contract/",
  transaction: "https://stellar.expert/explorer/testnet/tx/",
  account: "https://stellar.expert/explorer/testnet/account/",
  fetchAddress: "GCE2JSKDFV53B3CVIKE3K6JDVRMQJ5FIGH7CP5EDADNQ7Q5GIPJTYP6X",
};

const mainnet = {
  address: envObj.address,
  horizon: "https://horizon.stellar.org/",
  soroban: "https://mainnet.sorobanrpc.com",
  explorer: "https://stellar.expert/explorer/public/contract/",
  transaction: "https://stellar.expert/explorer/public/tx/",
  account: "https://stellar.expert/explorer/public/account/",
  fetchAddress: "GDNSCN33Z7OSUL3X5XJ5E7PB5MTOVYTPRCRHADFPADOR3EEBL4LLJ5NH",
};


export const contractFn = {
  getAllMintedTokens: "get_all_minted_tokens",
  myTokens: "get_tokens",
  maxTokenId: "get_max_token_id",
};

export const nexaflowObj = {
  googleSheetId: "6763b3c5c4843fadfbfcd401",
};

export const contractObj = envObj.network === "testnet" ? testnet : mainnet;

export const social = {
  twitter: "sorobanhooks",
};

export const twitterShare = (link) => `🚀 Just minted my Stellar Community Logo NFT from ${window.location.origin} ! 🔥 Limited community NFTs available - don't miss out!

Mint yours now & own a piece of the Stellar legacy! 🌌

${window.location.origin}/image/${link.replace("ipfs://", "")}

#StellarNFT #Web3 #NFTCommunity  #stellarlogos`;


const image = `${envObj.base_url}/logo.png`

export const metadata = {
  title: "Stellar NFT Logo",
  description: "Own Your Stellar Identity! 10,000 unique logos for the Stellar community.",
  openGraph: {
    type: "website",
    url: envObj.base_url,
    title: "Stellar NFT Logo",
    description: "Own Your Stellar Identity! 10,000 unique logos for the Stellar community.",
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
    description: "Own Your Stellar Identity! 10,000 unique logos for the Stellar community.",
    images: [image]
  },
}