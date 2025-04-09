export const getPinataData = (cid) => {
  return `https://gateway.pinata.cloud/ipfs/${cid.replace("ipfs://", "")}`;
};
