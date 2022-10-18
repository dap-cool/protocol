import {web3} from "@project-serum/anchor";

/**
 * Get Increment PDA
 * @param program - Program
 * @param mint - PublicKey
 * @param uploader - PublicKey
 * @returns {Promise<{mint, uploader, increment: (number|*), pda}>}
 */
export async function getIncrementPda(program, mint, uploader) {
    let response;
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

export async function deriveIncrementPda(program, mint, uploader) {
    // derive pda
    let pda, _;
    [pda, _] = await web3.PublicKey.findProgramAddress(
        [
            mint.toBuffer(),
            uploader.toBuffer(),
        ],
        program.programId
    );
    return pda
}


async function fetchIncrementPda(program, mint, uploader) {
    // derive pda
    const pda = await deriveIncrementPda(program, mint, uploader);
    // fetch pda
    const increment = await program.account.increment.fetch(pda);
    return {
        pda,
        increment
    }
}
