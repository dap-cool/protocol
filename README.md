# Dap Cool 🆒 (Digital Asset Protocol)

Decentralized Protocol for token-gating files

* [Developers / SDK](#developers--sdk)
    * [End-to-end example](#end-to-end-example)
* [Principles](#principles-)
* [Example Use Case](#example-use-case-)
* [How It Works](#how-it-works-)

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

* The [JavaScript SDK](./sdk/src/index.js) provides methods for
    * Encrypting your files with an NFT mint address
        * typically [FileList](https://developer.mozilla.org/en-US/docs/Web/API/FileList) objects from your HTML input
            * zips your file-list before encrypting
        * can be used to encrypt any arbitrary file object
    * Uploading your encrypted files to shadow-drive
    * Deterministically finding the upload URL via solana on-chain state
    * Fetching your encrypted files from shadow-drive
    * Decrypting your encrypted files with the NFT

## End-to-end example

* check out our [integration test](./it/src/index.js) to see all the imports, how we're bundling, etc.

```javascript
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
    await uploadSolana(program, provider, mint, url);
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
```

* [Anchor Macros](https://docs.rs/anchor-lang/latest/anchor_lang/derive.Accounts.html)
