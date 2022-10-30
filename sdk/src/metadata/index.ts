export interface LitArgs {
    method: string
    mint: string
    returnValueTest: {
        key: string
        comparator: string
        value: string
    }
}

export interface Metadata {
    key: Uint8Array
    lit: LitArgs
    title: string
    timestamp: number
}

export function encodeMetadata(metadata: Metadata): File {
    const json = JSON.stringify(metadata);
    const textEncoder = new TextEncoder();
    const bytes = textEncoder.encode(json);
    const blob: Blob = new Blob([bytes], {
        type: "application/json;charset=utf-8"
    });
    return new File([blob], "meta.json");
}

export async function getMetaData(url): Promise<Metadata> {
    console.log("fetching meta-data");
    const fetched  = await fetch(url + "meta.json")
        .then(response => response.json());
    const keys = (fetched.key as  { [s: string]: any })
    return {
        key: new Uint8Array(Object.values(keys)),
        lit: fetched.lit,
        title: fetched.title,
        timestamp: fetched.timestamp
    }
}
