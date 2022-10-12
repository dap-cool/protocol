/*! https://docs.phantom.app/ */
export async function getPhantom() {
    // connect
    const connection = await window.solana.connect();
    console.log("phantom wallet connected");
    // return state to js
    return {windowSolana: window.solana, connection: connection}
}
