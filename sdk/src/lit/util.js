export const LIT_MAIN_NET = "solana" // mainnet only because of shadow-drive

/**
 * Build the Sol-RPC-Conditions for en/decrypting via LIT Network.
 *
 * @param litArgs - typically built with @defaultArgs
 * @param chain {string} - LIT_MAIN_NET or LIT_DEV_NET
 * @returns {[{pdaParams: *[], chain, method, pdaInterface: {offset: number, fields: {}}, returnValueTest: {comparator, value, key}, params: *[], pdaKey: string}]}
 */
export function solRpcConditions(litArgs) {
    return [
        {
            method: litArgs.method,
            params: [litArgs.mint],
            pdaParams: [],
            pdaInterface: {offset: 0, fields: {}},
            pdaKey: "",
            chain: LIT_MAIN_NET,
            returnValueTest: {
                key: litArgs.returnValueTest.key, // "$.amount"
                comparator: litArgs.returnValueTest.comparator, // ">"
                value: litArgs.returnValueTest.value, // "0"
            },
        },
    ]
}

/**
 * Build default args for LIT Network to en/decrypt with Fungible Tokens as the access-control mechanism.
 *
 * @param mint {string}
 * @returns {{mint, method: string, returnValueTest: {comparator: string, value: string, key: string}}}
 */
export function defaultLitArgs(mint) {
    return {
        method: "balanceOfToken",
        mint: mint,
        returnValueTest: {
            key: "$.amount",
            comparator: ">",
            value: "0"
        }
    }
}
