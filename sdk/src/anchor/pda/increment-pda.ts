import {Program, Address} from "@project-serum/anchor";
import {PublicKey} from "@solana/web3.js";
import {DapProtocol} from "../idl";

export interface Increment {
    mint: PublicKey
    uploader: PublicKey
    increment: number
    pda: Address
}

export async function getIncrementPda(
    program: Program<DapProtocol>,
    mint: PublicKey,
    uploader: PublicKey
): Promise<Increment | null> {
    let response: Increment | null;
    try {
        const fetched = await fetchIncrementPda(program, mint, uploader);
        response = {
            mint: mint,
            uploader: uploader,
            increment: fetched.increment.increment,
            pda: fetched.pda
        }
    } catch (error) {
        console.log(error);
        let msg = "could not find pda-increment with uploader: {" + uploader.toString();
        msg = msg + "} " + "and mint: {" + mint.toString() + "}";
        console.log(msg);
        response = null
    }
    return response
}

export async function getIncrementPdaUnsafe(
    program: Program<DapProtocol>,
    mint: PublicKey,
    uploader: PublicKey
): Promise<Increment> {
    const fetched = await fetchIncrementPda(program, mint, uploader);
    return {
        mint: mint,
        uploader: uploader,
        increment: fetched.increment.increment,
        pda: fetched.pda
    }
}

export async function deriveIncrementPda(
    program: Program<DapProtocol>,
    mint: PublicKey,
    uploader: PublicKey
): Promise<Address> {
    // derive pda
    let pda: Address, _;
    [pda, _] = await PublicKey.findProgramAddress(
        [
            mint.toBuffer(),
            uploader.toBuffer(),
        ],
        program.programId
    );
    return pda
}


async function fetchIncrementPda(
    program: Program<DapProtocol>,
    mint: PublicKey,
    uploader: PublicKey
): Promise<{ pda: Address, increment }> {
    // derive pda
    const pda: Address = await deriveIncrementPda(program, mint, uploader);
    // fetch pda
    const increment: any = await program.account.increment.fetch(pda);
    return {
        pda,
        increment
    }
}
