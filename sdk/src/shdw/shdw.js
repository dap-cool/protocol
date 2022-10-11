import {web3} from "@project-serum/anchor";
import {ShdwDrive} from "@shadow-drive/sdk";
import {version} from "./config";

export async function provision(connection, uploader, file) {
    // build drive client
    console.log("build shdw client with finalized commitment");
    // build connection with finalized commitment for initial account creation
    const finalizedConnection = new web3.Connection(connection.rpcEndpoint, "finalized");
    const drive = await new ShdwDrive(finalizedConnection, uploader).init();
    // create storage account
    console.log("create shdw storage account");
    const size = (((file.size / 1000000) + 2).toString()).split(".")[0] + "MB";
    console.log(size);
    const createStorageResponse = await drive.createStorageAccount("dap-cool", size, version)
    const account = new web3.PublicKey(createStorageResponse.shdw_bucket);
    return {drive, account}
}

export async function markAsImmutable(drive, account) {
    console.log("mark account as immutable");
    // time out for 1 second to give RPC time to resolve account
    await new Promise(r => setTimeout(r, 1000));
    await drive.makeStorageImmutable(account, version);
}

export async function uploadFile(file, drive, account) {
    console.log("upload file to shdw drive");
    const url = (await drive.uploadFile(account, file, version)).finalized_locations[0];
    return url.replace(file.name, "");
}

export function buildMetaData(key, lit, title) {
    const meta = {
        key: key,
        lit: lit,
        title: title
    }
    const json = JSON.stringify(meta);
    const textEncoder = new TextEncoder();
    const bytes = textEncoder.encode(json);
    const blob = new Blob([bytes], {
        type: "application/json;charset=utf-8"
    });
    return new File([blob], "meta.json");
}
