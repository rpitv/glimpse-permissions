import { assertPermission, formatScope, globalStack } from "./PermissionTools";
import { PermissionScope } from "./classes/PermissionScope";
import { PermissionTree } from "./classes/PermissionTree";
import { Permission } from "./classes/Permission";
import { AccessDeniedError } from "./classes/AccessDeniedError";

describe("formatScope", () => {
    it("accepts strings as the first argument", () => {
        let str = formatScope("testing 123");
        expect(str).toEqual("testing 123");
        str = formatScope("testing:123:sd oisdf sdoifwj 248");
        expect(str).toEqual("testing:123:sd oisdf sdoifwj 248");
    });

    it("accepts PermissionScopes as the first argument", () => {
        let str = formatScope(new PermissionScope("testing 123"));
        expect(str).toEqual(new PermissionScope("testing 123"));
        str = formatScope(new PermissionScope("testing:123:sd oisdf sdoifwj 248"));
        expect(str).toEqual(new PermissionScope("testing:123:sd oisdf sdoifwj 248"));
    });

    it("places in string variables to the correct spot", () => {
        let str: string = formatScope("test:$1:$2:$1$1", "moo", "cow");
        expect(str).toEqual("test:moo:cow:moomoo");
        str = formatScope("wow $1 is really $2!", "this", "cool");
        expect(str).toEqual("wow this is really cool!");
        str = formatScope("$1$1$1$1$1$2$2$1$2", "a", "a");
        expect(str).toEqual("aaaaaaaaa");
    });

    it("places in non-string variables to the correct spot", () => {
        expect(formatScope("9 + $1 = $2", 10, 21)).toEqual("9 + 10 = 21");
        expect(formatScope("this is... $1", { spa: "rta!!!!" })).toEqual(
            "this is... [object Object]"
        );
    });

    it("does not replace placeholders which don't have a corresponding variable", () => {
        expect(formatScope("$1,$2,$3,$4", "a", "b", "c")).toEqual("a,b,c,$4");
    });

    it("does not place in variables which do not have a placeholder", () => {
        expect(formatScope("$1,$3,$4", "a", "b", "c", "d")).toEqual("a,c,d");
        expect(formatScope("$11", "a")).toEqual("a1");
        expect(formatScope("$9", "a")).toEqual("$9");
    });
});

describe("assertPermission", () => {
    function resetStack(scopeToAdd: string) {
        while (globalStack.peek() !== undefined) {
            globalStack.pop();
        }

        globalStack.push(new PermissionTree(new Permission(scopeToAdd, true)));
    }

    it("accepts PermissionScopes", () => {
        resetStack("testing");
        try {
            assertPermission(new PermissionScope("testing"));
        } catch (e: any) {
            fail("threw an error: " + e.message);
        }
    });

    it("accepts strings", () => {
        resetStack("wow so cool");
        try {
            assertPermission("wow so cool");
        } catch (e: any) {
            fail("threw an error: " + e.message);
        }
    });

    it("formats variables", () => {
        resetStack("glimpse:something:read");
        try {
            assertPermission("glimpse:$1:read", "something");
        } catch (e: any) {
            fail("threw an error: " + e.message);
        }
    });

    it("throws an error if tree stack does not have permissions", () => {
        resetStack("glimpse:something:read");
        expect(() => assertPermission("missing permission", "something")).toThrow(
            AccessDeniedError
        );
    });
});
