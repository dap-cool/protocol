import {PublicKey} from "@solana/web3.js";
import {AnchorProvider, Program} from "@project-serum/anchor";
import {DapProtocol} from "../idl";
import {deriveDatumPda} from "../pda";

export async function filter(
    program: Program<DapProtocol>,
    provider: AnchorProvider,
    mint: PublicKey,
    index: number
): Promise<void> {
    // derive pda datum
    const pdaDatum = await deriveDatumPda(
        program,
        mint,
        provider.wallet.publicKey,
        index
    );
    // invoke rpc
    await program.methods
        .filterAsset(index as any)
        .accounts({
            datum: pdaDatum,
            mint: mint,
            authority: provider.wallet.publicKey
        }).rpc()
}
