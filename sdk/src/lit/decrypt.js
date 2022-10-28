import {LIT_MAIN_NET, solRpcConditions} from "./util";
import LitJsSdk from "lit-js-sdk";
import JSZip from "jszip";

/**
 * 1) Fetch encrypted .zip file from url (shadow-drive)
 * 2) with LIT access-control from metadata fetch the decryption key from LIT Network
 * 3) decrypt
 *
 * @param url {string} - sitting on-chain pointing to shadow-drive
 * @param metadata - metadata sitting on shadow-drive behind url
 * @returns {Promise<JSZip>} - decrypted .zip file
 */
export async function decrypt(url, metadata) {
    // build client
    const client = new LitJsSdk.LitNodeClient();
    // await for connection
    console.log("connecting to LIT network");
    await client.connect();
    // client signature
    console.log("invoking signature request");
    const authSig = await LitJsSdk.checkAndSignAuthMessage({chain: LIT_MAIN_NET});
    // get encryption key
    console.log("getting key from networking");
    // Note, below we convert the encryptedSymmetricKey from a UInt8Array to a hex string.
    // This is because we obtained the encryptedSymmetricKey from "saveEncryptionKey" which returns a UInt8Array.
    // But the getEncryptionKey method expects a hex string.
    const encryptedHexKey = LitJsSdk.uint8arrayToString(metadata.key, "base16");
    const retrievedSymmetricKey = await client.getEncryptionKey({
        solRpcConditions: solRpcConditions(metadata.lit),
        toDecrypt: encryptedHexKey,
        chain: LIT_MAIN_NET,
        authSig
    });
    // get encrypted zip
    console.log("fetching encrypted zip");
    const encryptedZip = await fetch(url + "encrypted.zip")
        .then(response => response.blob());
    // decrypt file
    console.log("decrypting zip file");
    const decrypted = await LitJsSdk.decryptZip(
        encryptedZip,
        retrievedSymmetricKey
    );
    // convert back to zip
    const zip = new JSZip();
    zip.files = decrypted;
    return zip
}
