import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface backendInterface {
    getMatchSummary(key: string): Promise<string>;
    listMatchKeys(): Promise<Array<string>>;
    saveMatchSummary(key: string, data: string): Promise<void>;
}
