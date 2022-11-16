import {PublicKey, SystemProgram} from "@solana/web3.js";
import {AnchorProvider, Program} from "@project-serum/anchor";
import {Increment, getIncrementPda, deriveDatumPda, deriveIncrementPda} from "../pda";
import {deriveTariffPda} from "../pda/tariff-pda"
import {BOSS} from "../config";
import {DapProtocol} from "../idl";

export async function increment(
    program: Program<DapProtocol>,
    provider: AnchorProvider,
    mint: PublicKey,
    shadowAccount: PublicKey
): Promise<void> {
    // derive increment pda
    const incrementPda = await deriveIncrementPda(program, mint, provider.wallet.publicKey);
    // fetch increment pda
    const maybeIncrement: Increment | null = await getIncrementPda(
        program,
        incrementPda
    );
    let increment: Increment;
    if (maybeIncrement) {
        increment = maybeIncrement;
    } else {
        // dne --> init
        console.log("found new uploader -- initializing their increment")
        await init(program, provider, mint);
        increment = {
            mint: mint,
            uploader: provider.wallet.publicKey,
            increment: 0
        }
    }
    const newIncrement: number = increment.increment + 1;
    // derive pda datum
    const datumPda = await deriveDatumPda(
        program,
        mint,
        provider.wallet.publicKey,
        newIncrement
    );
    // derive tariff
    const tariffPda = await deriveTariffPda(
        program
    );
    const index: any = newIncrement;
    const shadow: any = shadowAccount;
    // invoke rpc
    await program.methods
        .publishAsset(index, shadow)
        .accounts({
            datum: datumPda,
            increment: incrementPda,
            mint: mint,
            tariff: tariffPda,
            tariffAuthority: BOSS,
            payer: provider.wallet.publicKey,
        })
        .rpc();
}

export async function init(
    program: Program<DapProtocol>,
    provider: AnchorProvider,
    mint: PublicKey
): Promise<void> {
    // derive increment pda
    const incrementPda = await deriveIncrementPda(
        program,
        mint,
        provider.wallet.publicKey
    );
    // invoke rpc
    await program.methods
        .initializeIncrement()
        .accounts({
            increment: incrementPda,
            mint: mint,
            payer: provider.wallet.publicKey,
            systemProgram: SystemProgram.programId
        }).rpc();
}
