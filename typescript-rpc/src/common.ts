export interface ServiceApi {
    add(a: number, b: number): Promise<number>;
    repeat(a: string, b: number): Promise<string>;
}