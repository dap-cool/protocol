export const LIT_MAIN_NET = "solana";
export const LIT_DEV_NET = "solanaDevnet";

export function solRpcConditions(args, chain) {
    return [
        {
            method: args.method,
            params: [args.mint],
            pdaParams: [],
            pdaInterface: {offset: 0, fields: {}},
            pdaKey: "",
            chain,
            returnValueTest: {
                key: args.returnValueTest.key, // "$.amount"
                comparator: args.returnValueTest.comparator, // ">"
                value: args.returnValueTest.value, // "0"
            },
        },
    ]
}

export function defaultSolRpcConditions(mint, chain) {
    return solRpcConditions(defaultArgs(mint), chain)
}

function defaultArgs(mint) {
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
