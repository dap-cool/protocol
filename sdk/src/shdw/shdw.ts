import {ShadowFile, ShdwDrive} from "@shadow-drive/sdk";
import {version} from "./config";
import {Metadata, encodeMetadata} from "../metadata";
import {Connection, PublicKey} from "@solana/web3.js";

export async function client(connection: any, uploader: any): Promise<ShdwDrive> {
    console.log("build shdw client with finalized commitment");
    // build connection with finalized commitment for initial account creation
    const finalizedConnection = new Connection(connection.rpcEndpoint, "finalized");
    return await new ShdwDrive(finalizedConnection, uploader).init();
}

export async function provision(
    connection: any,
    uploader: any,
    file: File
): Promise<{ drive: ShdwDrive, account: PublicKey }> {
    // build drive client
    const drive = await client(connection, uploader);
    // create storage account
    console.log("create shdw storage account");
    const size = (((file.size / 1000000) + 2).toString()).split(".")[0] + "MB";
    console.log(size);
    const createStorageResponse = await drive.createStorageAccount("dap-cool", size, version)
    const account = new PublicKey(createStorageResponse.shdw_bucket);
    return {drive, account}
}

export async function markAsImmutable(drive: ShdwDrive, account: PublicKey): Promise<void> {
    console.log("mark account as immutable");
    // time out for 1 second to give RPC time to resolve account
    await new Promise(r => setTimeout(r, 1000));
    await drive.makeStorageImmutable(account, version);
}

export async function uploadMultipleFiles(files: File[], drive: ShdwDrive, account: PublicKey): Promise<void> {
    console.log("uploading multiple files to shdw drive");
    const shadowFiles: ShadowFile[] = await Promise.all(
        files.map(async (file) => {
            const arrayBuffer = await file.arrayBuffer();
            console.log(arrayBuffer);
            return {
                name: file.name,
                file: Buffer.from(arrayBuffer)
            } as ShadowFile
        })
    );
    console.log(shadowFiles)
    await drive.uploadMultipleFiles(account, shadowFiles)
}

export async function uploadFile(file: File, drive: ShdwDrive, account: PublicKey): Promise<void> {
    console.log("upload file to shdw drive");
    await drive.uploadFile(account, file, version);
}

export async function editMetaData(
    drive: ShdwDrive,
    account: PublicKey,
    oldMetaData: Metadata,
    newTitle: string
): Promise<void> {
    console.log("edit metadata on shdw drive");
    const url = buildUrl(account) + "meta.json";
    const newMetadata = {
        key: oldMetaData.key,
        lit: oldMetaData.lit,
        title: newTitle
    }
    const encoded = encodeMetadata(newMetadata);
    await drive.editFile(account, url, encoded, version);
}

const URL_PREFIX = "https://shdw-drive.genesysgo.net/";

function buildUrl(shadowAccount: PublicKey) {
    return (URL_PREFIX + shadowAccount.toString() + "/")
}
