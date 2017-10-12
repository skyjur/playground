export interface ServiceInterface {
    add(a: number, b: number): Promise<number>;
    repeat(a: string, b: number): Promise<string>;
}