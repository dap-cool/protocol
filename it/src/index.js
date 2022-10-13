import {AnchorProvider, web3} from "@project-serum/anchor";
import {
    buildMetaData, decrypt,
    defaultLitArgs, downloadZip,
    encrypt, getDatumPda, getIncrementPda,
    getProgram,
    getProvider,
    initSolana,
    markAsImmutable,
    provision, uploadFile, uploadSolana
} from "@dap-cool/sdk";
import {getPhantom} from "./phantom";
import {PhantomWallet} from "./wallet";

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

async function init() {
    await initSolana(program, provider, mint);
}

async function e2e() {
    await upload();
    await download();
}

async function upload() {
    // select files
    const files = document.getElementById("gg-sd-zip").files;
    // build encryption args
    const litArgs = defaultLitArgs(mint.toString());
    console.log(litArgs);
    // encrypt
    const encrypted = await encrypt(files, litArgs);
    // provision storage on shdw drive
    const provisioned = await provision(connection, provider.wallet, encrypted.file);
    // uploaded encrypted file
    const url = await uploadFile(encrypted.file, provisioned.drive, provisioned.account);
    // build metadata
    const metadata = buildMetaData(encrypted.key, litArgs, "e2e-demo");
    // upload metadata
    await uploadFile(metadata, provisioned.drive, provisioned.account);
    // mark as immutable
    await markAsImmutable(provisioned.drive, provisioned.account);
    // publish url to solana
    await uploadSolana(program, provider, mint, url);
}

async function download() {
    // get increment pda
    const incrementPda = await getIncrementPda(program, mint, provider.wallet.publicKey);
    // get datum (of latest upload)
    const datumPda = await getDatumPda(program, mint, provider.wallet.publicKey, incrementPda.increment);
    // fetch & decrypt files
    const decryptedZip = await decrypt(datumPda.url);
    // download zip
    downloadZip(decryptedZip);
}

app.ports.init.subscribe(async function () {
    await init();
})

app.ports.e2e.subscribe(async function () {
    await e2e();
});
