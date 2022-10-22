import {getIncrementPda, deriveDatumPda, deriveIncrementPda} from "./pda";
import {deriveTariffPda} from "./pda/tariff-pda"
import {BOSS} from "./config";
import {web3} from "@project-serum/anchor";

export async function increment(program, provider, mint, url) {
    // derive & fetch increment
    let increment = await getIncrementPda(
        program,
        mint,
        provider.wallet.publicKey
    );
    if (!increment) {
        // dne --> init
        console.log("found new uploader -- initializing their increment")
        await init(program, provider, mint);
        increment = await getIncrementPda(
            program,
            mint,
            provider.wallet.publicKey
        );
    }
    const newIncrement = increment.increment + 1;
    // derive pda datum
    const pdaDatum = await deriveDatumPda(
        program,
        mint,
        provider.wallet.publicKey,
        newIncrement
    );
    // derive tariff
    const pdaTariff = await deriveTariffPda(
        program
    );
    // encode upload url
    const textEncoder = new TextEncoder;
    const encodedPrefix = textEncoder.encode(url);
    // invoke rpc
    await program.methods
        .publishAssets(newIncrement, Buffer.from(encodedPrefix))
        .accounts({
            datum: pdaDatum,
            increment: increment.pda,
            mint: mint,
            tariff: pdaTariff,
            tariffAuthority: BOSS,
            payer: provider.wallet.publicKey,
        })
        .rpc();
}

export async function init(program, provider, mint) {
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
