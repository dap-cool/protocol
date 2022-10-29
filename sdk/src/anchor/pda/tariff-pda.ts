import {Address, Program} from "@project-serum/anchor";
import {PublicKey} from "@solana/web3.js";
import {DapProtocol} from "../idl";

export async function deriveTariffPda(program: Program<DapProtocol>): Promise<Address> {
    let pda: Address, _;
    [pda, _] = await PublicKey.findProgramAddress(
        [
            Buffer.from("tarifftariff")
        ],
        program.programId
    )
    return pda
}
