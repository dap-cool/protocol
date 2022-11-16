import {AnchorProvider, web3} from "@project-serum/anchor";
import {
    encodeMetadata, decrypt,
    defaultLitArgs,
    encrypt, getDatumPda, getIncrementPda,
    getProgram,
    getProvider,
    markAsImmutable,
    provision, uploadMultipleFiles, increment,
    buildClient, editMetaData, getMetaData, filter,
    deriveIncrementPda, getManyIncrementPdaByUploader, getManyDatumPda
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
    await uploadMutable();
    await editMetadata();
    await getMany();
    await download();
}

async function uploadMutable() {
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
    // build metadata
    const metadata = {
        key: encrypted.key,
        lit: litArgs,
        title: "e2e-demo",
        zip: {
            count: files.length,
            types: Array.from(files).map(file => file.type)
        },
        timestamp: Date.now()
    }
    const encodedMetadata = encodeMetadata(metadata);
    // uploaded encrypted file & metadata
    // // this is super fast thanks to shadow-drive throughput
    // // comparable to an AWS S3 upload
    await uploadMultipleFiles(
        [encrypted.file, encodedMetadata],
        provisioned.drive,
        provisioned.account
    );
    // publish url to solana
    // // this is encoding the shadow-drive public key on-chain via solana program-derived-address
    // // which means we can deterministically find it & don't need a centralized index
    // // typically very fast (as fast as any other rpc transaction)
    await increment(program, provider, mint, provisioned.account);
}

async function editMetadata() {
    // edit metadata before marking as immutable
    // // create new shadow client
    const drive = await buildClient(connection, provider.wallet);
    // // deterministically find latest upload
    const incrementPda = await deriveIncrementPda(program, mint, provider.wallet.publicKey);
    const fetchedIncrement = await getIncrementPda(program, incrementPda);
    const datumPda = await getDatumPda(program, mint, provider.wallet.publicKey, fetchedIncrement.increment);
    // // fetch existing metadata from latest uploader
    // // has stuff for decryption that we need to copy to new metadata
    const oldMetadata = await getMetaData(datumPda.shadow.url);
    // // this is super fast because shadow-drive is already provisioned
    // // throughput is comparable to an AWS S3 upload
    await editMetaData(drive, datumPda.shadow.account, oldMetadata, "new-title");
    // mark as immutable
    // // this takes about 15seconds again to mark the storage as immutable
    // // technically this optional but we highly recommend it to promote web3 ethos
    await markAsImmutable(drive, datumPda.shadow.account);
}

async function getMany() {
    // derive dummy public-key with no uploads for testing
    const dummy = web3.Keypair.generate();
    // // deterministically find all uploads with duplicate uploader
    const incrementArray = await getManyIncrementPdaByUploader(
        program,
        mint,
        [provider.wallet.publicKey,
            provider.wallet.publicKey, // intentionally duplicated
            dummy.publicKey
        ]
    );
    console.log("increment array -->", incrementArray);
    const datumArray = await getManyDatumPda(program, incrementArray);
    console.log("datum array -->", datumArray);
}

async function download() {
    // get increment pda
    // // deterministically find how many times this user has uploaded behind this mint
    const incrementPda = await deriveIncrementPda(program, mint, provider.wallet.publicKey);
    const fetchedIncrement = await getIncrementPda(program, incrementPda);
    // get datum (of latest upload)
    // // deterministically find the URL of the latest upload
    let datumPda = await getDatumPda(program, mint, provider.wallet.publicKey, fetchedIncrement.increment);
    // fetch metadata (of latest upload) from shadow-drive
    const metadata = await getMetaData(datumPda.shadow.url);
    // fetch & decrypt files
    // // super fast thanks to shadow-drive, LIT, and a bunch of WASM
    // // does not charge any gas but does require a message signature (to prove ownership of the mint)
    const decryptedZip = await decrypt(datumPda.shadow.url, metadata);
    // download zip
    downloadZip(decryptedZip);
    // mark upload as filtered
    // // this provides a method for UIs to not render certain uploads
    // // if an uploader chooses without actually removing the upload from the blockchain
    // // so we guarantee legacy users of the upload can still access the files
    await filter(program, provider, mint, fetchedIncrement.increment);
    datumPda = await getDatumPda(program, mint, provider.wallet.publicKey, fetchedIncrement.increment);
    console.log(datumPda);
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
    // derive tariff
    let pdaTariff, _;
    [pdaTariff, _] = await web3.PublicKey.findProgramAddress(
        [
            Buffer.from("tarifftariff")
        ],
        program.programId
    )
    // invoke init tariff
    await program.methods
        .initializeTariff()
        .accounts({
            tariff: pdaTariff,
            payer: provider.wallet.publicKey,
        }).rpc();
    // fetch account
    let tariff = await program.account.tariff.fetch(
        pdaTariff
    );
    console.log(tariff);
})

app.ports.e2e.subscribe(async function () {
    await e2e();
});
