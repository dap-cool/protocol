# Dap Cool 🆒 (Digital Asset Protocol)

Decentralized Protocol for token-gating files

* [Developers / SDK](#developers--sdk)
    * [End-to-end example](#end-to-end-example)
* [Principles](#principles-%EF%B8%8F)
* [Example Use Case](#example-use-case-)
* [How It Works](#how-it-works-%EF%B8%8F)

# Install via npm

```shell
npm i @dap-cool/sdk
```

# Principles ⚖️

* NFTs should provide ownership of encrypted digital assets (metadata)
* Metadata should not be limited to .jpeg profile pictures
    * can be any file(s) or byte-array that you can imagine
* Metadata should be hosted on an immutable decentralized network
* Metadata should be encrypted & can only be decrypted via NFT ownership

# Example Use Case 💿

* Exclusive Music
    * Your favorite indie musician already has a catalog on Spotify & other streaming platforms
    * They release an exclusive project for their biggest fans who are willing to purchase music
        * this release is not made available on streaming platforms or elsewhere
    * 500 copies of this music are printed as an NFT
    * You buy one of the NFTs & can now decrypt the music & even download it
    * The release sold out & there's more fans that missed out on the primary sale
    * After downloading your copy you list your NFT for sale
    * Someone buys from you & now they can decrypt/download

# How it works 🛠️

* Encrypt/decrypt files with an NFT or FT via [LIT Protocol](https://litprotocol.com/)
* Upload/download encrypted files to decentralized immutable storage
  via [Shadow-Drive](https://docs.genesysgo.com/shadow/)
* Track state (who downloaded / how many times) via [Solana Program](./programs/dap-protocol/src/lib.rs)

# Developers / SDK

* The [Solana Program](./programs/dap-protocol/src/lib.rs) provides methods for deterministically finding uploaded files
  via [program-derived-addresses](https://docs.solana.com/developing/programming-model/calling-between-programs#hash-based-generated-program-addresses)

* The [TypeScript SDK](./sdk/src/index.js) provides methods for
    * Encrypting your files with an NFT mint address
        * typically [FileList](https://developer.mozilla.org/en-US/docs/Web/API/FileList) objects from your HTML input
            * zips your file-list before encrypting
        * can be used to encrypt any arbitrary file object
    * Uploading your encrypted files to shadow-drive
    * Deterministically finding the upload URL via solana on-chain state
    * Fetching your encrypted files from shadow-drive
    * Decrypting your encrypted files with the NFT

## End-to-end example

* check out our [integration test](./tests/integration/src/index.js) to see all the imports, how we're bundling, etc.

```javascript
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
```

* [Anchor Macros](https://docs.rs/anchor-lang/latest/anchor_lang/derive.Accounts.html)
