import {AnchorProvider, web3} from "@project-serum/anchor";
import {deriveIncrementPda, getProgram, getProvider, initSolana} from "@dap-cool/sdk";
import {getPhantom} from "./phantom";
import {PhantomWallet} from "./wallet";

app.ports.e2e.subscribe(async function () {
    await e2e();
});

export async function e2e() {
    // get phantom
    const phantom = await getPhantom();
    // build wallet
    const wallet = new PhantomWallet(phantom);
    // build connection
    const network = web3.clusterApiUrl("mainnet-beta");
    console.log(network);
    const connection = new web3.Connection(network, AnchorProvider.defaultOptions());
    // build provider & program
    const provider = getProvider(wallet, connection);
    const program = getProgram(provider);
    // set uploader & mint
    const uploader = provider.wallet.publicKey;
    const mint = new web3.PublicKey("SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y");
    // derive new increment (catalog)
    const incrementPda = await deriveIncrementPda(program, mint, uploader);
    console.log(incrementPda);
}
