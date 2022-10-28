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
    await drive.uploadFile(account, file, version);
}

export async function editMetaData(file, drive, account, oldMetaData, newTitle) {
    console.log("edit metadata on shdw drive");
    const url = buildUrl(account) + "meta.json";
    const newMetaData = buildMetaData(oldMetaData.key, oldMetaData.lit, newTitle);
    await drive.editFile(account, url, newMetaData, version);
}

export function buildMetaData(key, litArgs, title) {
    const meta = {
        key: key,
        lit: litArgs,
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

const URL_PREFIX = "https://shdw-drive.genesysgo.net/";

function buildUrl(shadowAccount) {
    return (URL_PREFIX + shadowAccount.toString() + "/")
}
