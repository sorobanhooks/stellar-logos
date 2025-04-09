import * as StellarSdk from "@stellar/stellar-sdk";
import { walletFn } from "../views/Home";
import { contractObj, envObj } from "./constants";
import toast from "react-hot-toast";
import axios from "axios";
import { store } from "../redux";

const network = envObj.network === 'testnet' ? StellarSdk.Networks.TESTNET : StellarSdk.Networks.PUBLIC;

export const saveSvgAsImage = (
  svgElement,
  gradient,
  qualityFactor = 2 // Scale factor for higher resolution
) => {
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();

  const imageSize = 512; // Original size of the image content
  const padding = 50; // Space around the image
  const canvasSize = imageSize + 2 * padding; // Total canvas size including padding

  const scaledCanvasSize = canvasSize * qualityFactor; // Scale canvas for better resolution
  const scaledImageSize = imageSize * qualityFactor; // Scale image content
  const scaledPadding = padding * qualityFactor; // Scale padding

  canvas.width = scaledCanvasSize;
  canvas.height = scaledCanvasSize;

  return new Promise((resolve) => {
    img.onload = () => {
      if (ctx) {
        // Fill the background with white (optional)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the image with padding at higher resolution
        ctx.drawImage(
          img,
          scaledPadding,
          scaledPadding,
          scaledImageSize,
          scaledImageSize
        );

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File(
                [blob],
                `logo-gradient-${gradient.start.r}-${gradient.start.g}-${gradient.start.b}-${gradient.end.r}-${gradient.end.g}-${gradient.end.b}.png`,
                {
                  type: "image/png",
                }
              );
              resolve(file);
            } else {
              resolve(undefined);
            }
          },
          "image/png",
          1.0 // Maximum quality for the PNG
        );
      } else {
        resolve(undefined);
      }
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  });
};

const horizonUrl = contractObj.horizon;
const ISSUING_ACCOUNT_PUBLIC_KEY = contractObj.address;

export const getBalance = async (userPublicKey) => {
  const server = new StellarSdk.Horizon.Server(horizonUrl);
  try {
    const account = await server.loadAccount(userPublicKey);
    return account.balances;
  } catch (error) {
    console.log(error);
  }
};

export const readContract = async (fnName, args = []) => {
  try {
    const server = new StellarSdk.rpc.Server(contractObj.soroban);
    const sourceAccount = await server.getAccount(
      contractObj.fetchAddress
    );

    let transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: network,
    })
      .addOperation(
        StellarSdk.Operation.invokeContractFunction({
          function: fnName,
          contract: ISSUING_ACCOUNT_PUBLIC_KEY,
          args,
        })
      )
      .setTimeout(30)
      .build();

    const result = await server.simulateTransaction(transaction);
    // console.log(result);

    const tx = await StellarSdk.scValToNative(result?.result?.retval);
    // console.log("read contract result", tx, fnName);
    return tx;
  } catch (error) {
    console.log(error, fnName);
  }
};

export const mintFn = async (
  publicKey,
  tokenUri,
  provider,
  bulk
) => {
  try {
    const server = new StellarSdk.rpc.Server(contractObj.soroban);
    const sourceAccount = await server.getAccount(publicKey);
    const address = new StellarSdk.Address(publicKey);
    const scAddress = address.toScAddress();
    const ownerArg = StellarSdk.xdr.ScVal.scvAddress(scAddress);
    const tokenUriArg = StellarSdk.xdr.ScVal.scvString(tokenUri);

    const tokenUriArr = bulk
      ? StellarSdk.xdr.ScVal.scvVec(
        tokenUri.map((string) =>
          StellarSdk.xdr.ScVal.scvString(string)
        )
      )
      : null;

    // const getTransactionFee = async () => {
    //   const server = new StellarSdk.rpc.Server(contractObj.soroban);

    //   let builtTransaction = new StellarSdk.TransactionBuilder(sourceAccount, {
    //     fee: StellarSdk.BASE_FEE,
    //     networkPassphrase: network,
    //   })
    //     .addOperation(
    //       StellarSdk.Operation.invokeContractFunction({
    //         function: bulk ? "bulk_mint" : "mint",
    //         contract: ISSUING_ACCOUNT_PUBLIC_KEY,
    //         args: [ownerArg, bulk ? tokenUriArr : tokenUriArg],
    //       })
    //     )
    //     .setTimeout(30)
    //     .build();

    //   return builtTransaction.fee;
    // };

    // const fee = await getTransactionFee();
    // console.log({ fee: parseInt(fee) });

    let builtTransaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      networkPassphrase: network,
      fee: StellarSdk.BASE_FEE,
    })
      .addOperation(
        StellarSdk.Operation.invokeContractFunction({
          function: bulk ? "bulk_mint" : "mint",
          contract: ISSUING_ACCOUNT_PUBLIC_KEY,
          args: [ownerArg, bulk ? tokenUriArr : tokenUriArg],
        })
      )
      .setTimeout(30)
      .build();

    // console.log(`builtTransaction=${builtTransaction.toXDR()}`);

    let preparedTransaction = await server.prepareTransaction(builtTransaction);

    const signedXDR = await walletFn(provider).signTransaction(
      preparedTransaction.toXDR(),
      {
        address: publicKey,
        networkPassphrase: network,
      }
    );

    const signedTransaction = new StellarSdk.Transaction(
      signedXDR.signedTxXdr,
      network
    );

    let sendResponse = await server.sendTransaction(signedTransaction);
    // console.log(`Sent transaction: ${JSON.stringify(sendResponse)}`);

    if (sendResponse.status === "PENDING") {
      let getResponse = await server.getTransaction(sendResponse.hash);
      while (getResponse.status === "NOT_FOUND") {
        // console.log("Waiting for transaction confirmation...");
        getResponse = await server.getTransaction(sendResponse.hash);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // console.log(`getTransaction response: ${JSON.stringify(getResponse)}`);

      if (getResponse.status === "SUCCESS") {
        const eventResult = await server.getEvents({
          startLedger: getResponse.latestLedger,
          filters: [
            {
              type: "contract",
              contractIds: [ISSUING_ACCOUNT_PUBLIC_KEY],
            },
          ],
        });

        let transactionMeta = getResponse.resultMetaXdr;
        // console.log(
        //   transactionMeta,
        //   transactionMeta?.v3().sorobanMeta()?.returnValue
        // );

        let returnValue = transactionMeta?.v3()?.sorobanMeta()?.returnValue();
        // console.log(`Transaction result: ${returnValue?.value()}`);

        const token_id = eventResult?.events?.[0]?.value?.value();
        // console.log({ eventResult, token_id });

        toast.success("Minted Successfully");
        return { hash: getResponse?.txHash, token_id };
      } else {
        throw `Transaction failed: ${getResponse.resultXdr}`;
      }
    } else {
      throw sendResponse.errorResult;
    }
  } catch (error) {
    toast.error("Transaction Failed, Try again");
    console.log("error", error);
    return null;
  }
};

export const formatAddress = (address) => {
  const fromAddress = new StellarSdk.Address(address);
  const fromScAddress = fromAddress.toScAddress();
  return StellarSdk.xdr.ScVal.scvAddress(fromScAddress);
};

export const formatNumber = (num) => {
  return StellarSdk.xdr.ScVal.scvU32(num);
};

export const transferFn = async (
  publicKey,
  toAddress,
  tokenId,
  provider,
) => {
  try {
    const server = new StellarSdk.rpc.Server(contractObj.soroban);
    const sourceAccount = await server.getAccount(publicKey);

    const formatTokenId = StellarSdk.xdr.ScVal.scvU32(tokenId);

    let builtTransaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      networkPassphrase: network,
      fee: StellarSdk.BASE_FEE,
    })
      .addOperation(
        StellarSdk.Operation.invokeContractFunction({
          function: "transfer",
          contract: ISSUING_ACCOUNT_PUBLIC_KEY,
          args: [
            formatAddress(publicKey),
            formatAddress(toAddress),
            formatTokenId,
          ],
        })
      )
      .setTimeout(30)
      .build();

    // console.log(`builtTransaction=${builtTransaction.toXDR()}`);

    let preparedTransaction = await server.prepareTransaction(builtTransaction);

    const signedXDR = await walletFn(provider).signTransaction(
      preparedTransaction.toXDR(),
      {
        address: publicKey,
        networkPassphrase: network,
      }
    );

    const signedTransaction = new StellarSdk.Transaction(
      signedXDR.signedTxXdr,
      network
    );

    let sendResponse = await server.sendTransaction(signedTransaction);
    // console.log(`Sent transaction: ${JSON.stringify(sendResponse)}`);

    if (sendResponse.status === "PENDING") {
      let getResponse = await server.getTransaction(sendResponse.hash);
      while (getResponse.status === "NOT_FOUND") {
        // console.log("Waiting for transaction confirmation...");
        getResponse = await server.getTransaction(sendResponse.hash);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // console.log(`getTransaction response: ${JSON.stringify(getResponse)}`);

      if (getResponse.status === "SUCCESS") {
        const eventResult = await server.getEvents({
          startLedger: getResponse.latestLedger,
          filters: [
            {
              type: "contract",
              contractIds: [ISSUING_ACCOUNT_PUBLIC_KEY],
            },
          ],
        });

        let transactionMeta = getResponse.resultMetaXdr;
        // console.log(
        //   transactionMeta,
        //   transactionMeta?.v3().sorobanMeta()?.returnValue
        // );

        let returnValue = transactionMeta?.v3()?.sorobanMeta()?.returnValue();
        // console.log(`Transaction result: ${returnValue?.value()}`);

        const token_id = eventResult?.events?.[0]?.value?.value();
        // console.log({ eventResult, token_id });

        toast.success("NFT Transferred Successfully");
        return { hash: getResponse?.txHash, token_id };
      } else {
        throw `Transaction failed: ${getResponse.resultXdr}`;
      }
    } else {
      throw sendResponse.errorResult;
    }
  } catch (error) {
    toast.error("Transaction Failed, Try again");
    console.log("error", error);
    return null;
  }
};

export const pinToIPFS = async (data, isJSON) => {
  try {
    let url = "https://api.pinata.cloud/pinning";
    let options = {};
    if (isJSON) {
      url += "/pinJSONToIPFS";
      options = {
        maxBodyLength: "Infinity",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${envObj.pinataApiToken}`,
        },
      };
    } else {
      url += "/pinFileToIPFS";
      options = {
        maxBodyLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data;`,
          Authorization: `Bearer ${envObj.pinataApiToken}`,
        },
      };
    }
    const result = await axios.post(url, data, options);
    return result?.data;
  } catch (error) {
    console.log(error);
    toast.error("Error Occurred");
    return null;
  }
};
