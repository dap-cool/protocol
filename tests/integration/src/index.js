import {AnchorProvider, web3} from "@project-serum/anchor";
import {
    buildMetaData, decrypt,
    defaultLitArgs,
    encrypt, getDatumPda, getIncrementPda,
    getProgram,
    getProvider,
    init,
    markAsImmutable,
    provision, uploadFile, increment
} from "@dap-cool/sdk";
import {getPhantom} from "./phantom";
import {PhantomWallet} from "./wallet";
import {saveAs} from "file-saver";

// get phantom
const phantom = await getPhantom();
// build wallet
const wallet = new PhantomWallet(phantom);
// build connection
const network = web3.clusterApiUrl("mainnet-beta");
console.log(network);
const connection = new web3.Connection(network, AnchorProvider.defaultOptions());
// build provider & program
const provider = getProvider(wallet, connection);
const program = getProgram(provider);
// set mint
const mint = new web3.PublicKey("SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y");

async function e2e() {
    await upload();
    await download();
}

async function upload() {
    // select files
    const files = document.getElementById("gg-sd-zip").files;
    // build encryption args
    // // this is specifying which mint-address you want to "gate" with
    const litArgs = defaultLitArgs(mint.toString());
    // encrypt
    const encrypted = await encrypt(files, litArgs);
    // provision storage on shdw drive
    // // this takes about 15seconds to provision decentralized storage
    // // you'll want to notify your app what is happening
    // // these methods are intentionally seperated to provide opportunity to notify progress
    const provisioned = await provision(connection, provider.wallet, encrypted.file);
    // uploaded encrypted file
    // // this is super fast thanks to shadow-drive throughput
    // // comparable to an AWS S3 upload
    const url = await uploadFile(encrypted.file, provisioned.drive, provisioned.account);
    // build metadata
    const metadata = buildMetaData(encrypted.key, litArgs, "e2e-demo");
    // upload metadata
    await uploadFile(metadata, provisioned.drive, provisioned.account);
    // mark as immutable
    // // this takes about 15seconds again to mark the storage as immutable
    // // technically this optional but we highly recommend it to promote web3 ethos
    await markAsImmutable(provisioned.drive, provisioned.account);
    // publish url to solana
    // // this is encoding the shadow-drive URL inside a solana pda
    // // which means we can deterministically find it & don't need a centralized index
    // // typically very fast (as fast as any other rpc transaction)
    await increment(program, provider, mint, url);
}

async function download() {
    // get increment pda
    // // deterministically find how many times this user has uploaded behind this mint
    const incrementPda = await getIncrementPda(program, mint, provider.wallet.publicKey);
    // get datum (of latest upload)
    // // deterministically find the URL of the latest upload
    const datumPda = await getDatumPda(program, mint, provider.wallet.publicKey, incrementPda.increment);
    // fetch & decrypt files
    // // super fast thanks to shadow-drive, LIT, and a bunch of WASM
    // // does not charge any gas but does require a message signature (to prove ownership of the mint)
    const decryptedZip = await decrypt(datumPda.url);
    // download zip
    downloadZip(decryptedZip);
}

export function downloadZip(zip) {
    // download
    console.log("download file")
    zip.generateAsync({type: "blob"})
        .then(function (blob) {
            saveAs(blob, "decrypted.zip");
        });
}

app.ports.init.subscribe(async function () {
    await init(program, provider, mint);
})

app.ports.e2e.subscribe(async function () {
    await e2e();
});
