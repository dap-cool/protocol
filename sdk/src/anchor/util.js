import {Program, AnchorProvider} from "@project-serum/anchor";
import {PROGRAM_ID} from "./config.js";
import idl from "./idl.json";

export function getProgram(provider) {
    return new Program(idl, PROGRAM_ID, provider);
}

export function getProvider(wallet, connection) {
    new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
}
