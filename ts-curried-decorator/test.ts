import { expect } from "chai";
import { curried } from "./index";

describe('curried()', function() {
    it('2 parameter function', () => {
        const f = curried((a: number, b: number) => a+b);
        const f1 = f(1);
        expect(f(1,2)).eq(3);
        expect(f1(2)).eq(3);
    });

    it('3 parameter function', () => {
        const f = curried((a: number, b: number, c: number) => a+b+c);
        const f1 = f(1);
        const f2 = f(1, 2);
        const f3 = f1(2);
        expect(f(1, 2, 3)).eq(6);
        expect(f1(2, 3)).eq(6);
        expect(f2(3)).eq(6);
        expect(f3(3)).eq(6);
    });

    it('4 parameter function', () => {
        const f = curried((a: number, b: number, c: number, d: number) => a+b+c+d);
        const f1 = f(1);
        const f2 = f(1, 2);
        const f3 = f2(3);
        expect(f(1, 2, 3, 4)).eq(10);
        expect(f(1, 2)(3, 4)).eq(10);
        expect(f2(3)(4)).eq(10);
        expect(f3(4)).eq(10);
    });

    it('4 parameter function', () => {
        const f = curried((a: number, b: number, c: number, d: number, e: number) => a+b+c+d+e);
        expect(f(1, 2, 3, 4, 5)).eq(15);
        expect(f(1)(2)(3)(4)(5)).eq(15);
        expect(f(1, 2)(3, 4)(5)).eq(15);
    });
})