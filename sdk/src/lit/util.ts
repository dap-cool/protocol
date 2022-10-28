import {LitArgs} from "../metadata";

export const LIT_MAIN_NET = "solana" // mainnet only because of shadow-drive

export interface SolRpcConditions {
    method: string
    params: string[]
    pdaParams: any
    pdaInterface: any
    pdaKey: any
    chain: string
    returnValueTest: {
        key: string
        comparator: string
        value: string
    }
}

/**
 * Build the Sol-RPC-Conditions for en/decrypting via LIT Network.
 *
 * @param litArgs {LitArgs} - typically built with @defaultArgs
 * @returns {SolRpcConditions[]}
 */
export function solRpcConditions(litArgs: LitArgs): SolRpcConditions[] {
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
 * @returns {LitArgs}
 */
export function defaultLitArgs(mint: string): LitArgs {
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
