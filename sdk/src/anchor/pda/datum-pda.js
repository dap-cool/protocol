import {web3} from "@project-serum/anchor";

/**
 * Get Datum PDA
 * @param program - Program
 * @param mint - PublicKey
 * @param uploader - PublicKey
 * @param increment {number}
 * @returns {Promise<{mint, uploader, increment, pda, url}>}
 */
export async function getDatumPda(program, mint, uploader, increment) {
    let response;
    try {
        const fetched = await fetchDatumPda(program, mint, uploader, increment);
        response = {
            mint: fetched.datum.mint,
            uploader: fetched.datum.authority,
            increment: fetched.datum.seed,
            url: decodeUrl(fetched.datum.url),
            pda: fetched.pda
        }
    } catch (error) {
        console.log(error);
        let msg = "could not find pda-datum with uploader: {" + uploader.toString();
        msg = msg + "} " + "and mint: {" + mint.toString();
        msg = msg + "} " + "and increment: {" + increment.toString() + "}";
        console.log(msg);
        response = null;
    }
    return response
}

export async function deriveDatumPda(program, mint, uploader, increment) {
    // derive pda
    let pda, _;
    [pda, _] = await web3.PublicKey.findProgramAddress(
        [
            mint.toBuffer(),
            uploader.toBuffer(),
            Buffer.from([increment])
        ],
        program.programId
    );
    return pda
}

async function fetchDatumPda(program, mint, uploader, increment) {
    // derive pda
    const pda = await deriveDatumPda(program, mint, uploader, increment);
    // fetch pda
    const datum = await program.account.datum.fetch(
        pda
    );
    return {
        pda,
        datum
    }
}

function decodeUrl(encodedUrl) {
    const textDecoder = new TextDecoder(); // wasteful but avoids potential collisions in global js bundle
    return textDecoder.decode(new Uint8Array(encodedUrl));
}
