import {getIncrementPda, deriveDatumPda} from "./pda";
import {deriveTariffPda} from "./pda/tariff-pda"
import {BOSS} from "./config";

export async function uploadSolana(program, provider, mint, url) {
    // derive & fetch increment
    const increment = await getIncrementPda(
        program,
        mint,
        provider.wallet.publicKey
    );
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
