import {web3} from "@project-serum/anchor";

export async function deriveTariffPda(program) {
    let pda, _;
    [pda, _] = await web3.PublicKey.findProgramAddress(
        [
            Buffer.from("tarifftariff")
        ],
        program.programId
    )
    return pda
}
