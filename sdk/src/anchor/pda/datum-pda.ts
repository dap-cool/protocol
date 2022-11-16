import {Program, Address} from "@project-serum/anchor";
import {PublicKey} from "@solana/web3.js";
import {DapProtocol} from "../idl";
import {Increment} from "./increment-pda";

export interface Datum {
    mint: PublicKey
    uploader: PublicKey
    index: number
    filtered: boolean
    shadow: {
        account: PublicKey,
        url: string
    }
}

interface Raw {
    mint: PublicKey
    authority: PublicKey
    index: number
    filtered: boolean
    shadow: PublicKey
}

export async function getManyDatumPda(
    program: Program<DapProtocol>,
    mint: PublicKey,
    increments: Increment[],
): Promise<Datum[]> {
    return (await Promise.all(
        // build index range for each increment
        increments.flatMap(async (increment) => {
            // derive datum pda for each index
            const pdaArray: (PublicKey | string)[] = await Promise.all(
                Array.from(new Array(increment.increment), async (_, i) => {
                    return await deriveDatumPda(program, mint, increment.uploader, i + 1)
                })
            );
            // fetch all pda-array in batch
            const fetched: (Object | null)[] = await program.account.datum.fetchMultiple(pdaArray);
            // filter nulls & map obj to interface
            return fetched.filter(Boolean).map(object => {
                const raw = object as Raw;
                return {
                    mint: raw.mint,
                    uploader: raw.authority,
                    index: raw.index,
                    filtered: raw.filtered,
                    shadow: {
                        account: raw.shadow,
                        url: buildUrl(raw.shadow)
                    }
                } as Datum
            })
        })
    )).flatMap<Datum>((x) => x)
}

export async function getDatumPda(
    program: Program<DapProtocol>,
    mint: PublicKey,
    uploader: PublicKey,
    index: number
): Promise<Datum> {
    const fetched = await fetchDatumPda(program, mint, uploader, index);
    return {
        mint: fetched.datum.mint,
        uploader: fetched.datum.authority,
        index: index,
        filtered: fetched.datum.filtered,
        shadow: {
            account: fetched.datum.shadow,
            url: buildUrl(fetched.datum.shadow)
        }
    }
}

export async function deriveDatumPda(
    program: Program<DapProtocol>,
    mint: PublicKey,
    uploader: PublicKey,
    index: number
): Promise<Address> {
    // derive pda
    let pda: Address, _;
    [pda, _] = await PublicKey.findProgramAddress(
        [
            mint.toBuffer(),
            uploader.toBuffer(),
            Buffer.from([index])
        ],
        program.programId
    );
    return pda
}

async function fetchDatumPda(
    program: Program<DapProtocol>,
    mint: PublicKey,
    uploader: PublicKey,
    index: number
): Promise<{ pda: Address, datum: any }> {
    // derive pda
    const pda: Address = await deriveDatumPda(
        program,
        mint,
        uploader,
        index
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
