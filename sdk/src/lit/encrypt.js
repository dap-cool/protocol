import LitJsSdk from 'lit-js-sdk'
import {LIT_MAIN_NET, solRpcConditions} from "./util";

/**
 * Encrypt files with LIT Network so they can be published on the open-internet.
 *
 * @param files {FileList}
 * @param litArgs - build default with ./util
 * @returns {Promise<{file: File, encryptedSymmetricKey: *}>}
 */
export async function encrypt(files, litArgs) {
    // build client
    const client = new LitJsSdk.LitNodeClient();
    // await for connection
    console.log("connecting to LIT network");
    await client.connect();
    // invoke signature
    console.log("invoking signature request");
    const authSig = await LitJsSdk.checkAndSignAuthMessage({chain: LIT_MAIN_NET});
    // encrypt
    console.log("encrypting files");
    const {encryptedZip, symmetricKey} = await LitJsSdk.zipAndEncryptFiles(
        files
    );
    // push key to network
    console.log("pushing key to network");
    const encryptedSymmetricKey = await client.saveEncryptionKey({
        solRpcConditions: solRpcConditions(litArgs),
        chain: LIT_MAIN_NET,
        authSig: authSig,
        symmetricKey: symmetricKey,
        permanent: true
    });
    // build js file
    const file = new File([encryptedZip], "encrypted.zip")
    return {key: encryptedSymmetricKey, file}
}
