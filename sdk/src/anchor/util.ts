import {Program, AnchorProvider} from "@project-serum/anchor";
import {PROGRAM_ID} from "./config.js";
import {DapProtocol, IDL} from "./idl";
import {Connection} from "@solana/web3.js";

export {DapProtocol} from "./idl"

export function getProgram(provider: AnchorProvider): Program<DapProtocol> {
    return new Program(IDL, PROGRAM_ID, provider);
}

export function getProvider(wallet: any, connection: Connection): AnchorProvider {
    return new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
}
