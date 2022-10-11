import {web3} from "@project-serum/anchor";
import {deriveIncrementPda} from "./pda";

export async function initSolana(provider, program, mint) {
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
            systemProgram: web3.SystemProgram.programId
        }).rpc();
}
