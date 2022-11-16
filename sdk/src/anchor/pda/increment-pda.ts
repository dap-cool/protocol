import {Program, Address} from "@project-serum/anchor";
import {PublicKey} from "@solana/web3.js";
import {DapProtocol} from "../idl";

export interface Increment {
    mint: PublicKey
    uploader: PublicKey
    increment: number
}

interface Raw {
    mint: PublicKey
    authority: PublicKey
    increment: number
}

export async function getManyIncrementPda(
    program: Program<DapProtocol>,
    mint: PublicKey,
    uploaderArray: PublicKey[]
): Promise<Increment[]> {
    // derive pda for each uploader
    const derived: Address[] = await Promise.all(
        uploaderArray.map(async (publicKey) =>
            await deriveIncrementPda(program, mint, publicKey)
        )
    )
    // fetch all PDAs in one batch
    const fetched: (Object | null)[] = await program.account.increment.fetchMultiple(derived);
    // filter nulls & map to interface
    return fetched.filter(Boolean).map(object => {
        const raw = object as Raw;
        return {
            mint: raw.mint,
            uploader: raw.authority,
            increment: raw.increment
        } as Increment
    })
}

export async function getIncrementPda(
    program: Program<DapProtocol>,
    pda: Address,
): Promise<Increment | null> {
    let response: Increment | null;
    try {
        const fetched = await program.account.increment.fetch(pda);
        response = {
            mint: fetched.mint,
            uploader: fetched.authority,
            increment: fetched.increment
        }
    } catch (error) {
        console.log(error);
        response = null
    }
    return response
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

