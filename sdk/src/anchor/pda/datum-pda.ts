import {Program, Address} from "@project-serum/anchor";
import {PublicKey} from "@solana/web3.js";
import {DapProtocol} from "../idl";

export interface Datum {
    mint: PublicKey
    uploader: PublicKey
    increment: number
    shadow: {
        account: PublicKey,
        url: string
    }
    pda: Address
}

export async function getDatumPda(
    program: Program<DapProtocol>,
    mint: PublicKey,
    uploader: PublicKey,
    increment: number
): Promise<Datum> {
    const fetched = await fetchDatumPda(program, mint, uploader, increment);
    return {
        mint: fetched.datum.mint,
        uploader: fetched.datum.authority,
        increment: fetched.datum.seed,
        shadow: {
            account: fetched.datum.shadow,
            url: buildUrl(fetched.datum.shadow)
        },
        pda: fetched.pda
    }
}

export async function deriveDatumPda(
    program: Program<DapProtocol>,
    mint: PublicKey,
    uploader: PublicKey,
    increment: number
): Promise<Address> {
    // derive pda
    let pda: Address, _;
    [pda, _] = await PublicKey.findProgramAddress(
        [
            mint.toBuffer(),
            uploader.toBuffer(),
            Buffer.from([increment])
        ],
        program.programId
    );
    return pda
}

async function fetchDatumPda(
    program: Program<DapProtocol>,
    mint: PublicKey,
    uploader: PublicKey,
    increment: number
): Promise<{ pda: Address, datum: any }> {
    // derive pda
    const pda: Address = await deriveDatumPda(
        program,
        mint,
        uploader,
        increment
    );
    // fetch pda
    const datum: any = await program.account.datum.fetch(
        pda
    );
    return {
        pda,
        datum
    }
}

const URL_PREFIX = "https://shdw-drive.genesysgo.net/";

function buildUrl(shadowAccount) {
    return (URL_PREFIX + shadowAccount.toString() + "/")
}
