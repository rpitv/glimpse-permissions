import { PermissionTree } from "./PermissionTree";
import { Permission } from "./Permission";
import { PermissionState } from "./PermissionState";
import { PermissionScope } from "./PermissionScope";

function generateFilledTree(): PermissionTree {
    const tree = new PermissionTree();
    tree.add(new Permission("glimpse:users:robere2:email:write", true));
    tree.add(new Permission("glimpse:users:robere2:email:read", true));
    tree.add(new Permission("glimpse:users:robere2:name:read", true));
    tree.add(new Permission("glimpse:users:daoj:email:read", true));
    tree.add(new Permission("glimpse:users:daoj:*", true));
    tree.add(new Permission("glimpse:tags:*", true));
    tree.add(new Permission("glimpse:tags:Private:*", false));
    tree.add(new Permission("glimpse:tags:Protected:write", false));
    tree.add(new Permission("glimpse:tags:*", true));
    tree.add(new Permission("glimpse:productions:*:read", true));
    tree.add(new Permission("glimpse:productions:testing:read", false));
    tree.add(new Permission("glimpse:productions:*:read", true));
    return tree;
}

it("applies permissions passed to the constructor", () => {
    const tree = new PermissionTree(
        new Permission("glimpse:test", true),
        new Permission("glimpse:test2:read", false)
    );

    expect(tree.evaluate("glimpse:test")).toEqual(PermissionState.ALLOW);
    expect(tree.evaluate("glimpse:test2:read")).toEqual(PermissionState.DENY);
    expect(tree.evaluate("glimpse:test2")).toEqual(PermissionState.NONE);
});

it("applies permissions passed to the add() function", () => {
    const tree = new PermissionTree();

    expect(tree.evaluate("glimpse:test")).toEqual(PermissionState.NONE);
    expect(tree.evaluate("glimpse:test2:read")).toEqual(PermissionState.NONE);
    expect(tree.evaluate("glimpse:test2")).toEqual(PermissionState.NONE);

    tree.add(new Permission("glimpse:test", true), new Permission("glimpse:test2:read", false));
    expect(tree.evaluate("glimpse:test")).toEqual(PermissionState.ALLOW);
    expect(tree.evaluate("glimpse:test2:read")).toEqual(PermissionState.DENY);
    expect(tree.evaluate("glimpse:test2")).toEqual(PermissionState.NONE);
});

it("correctly evaluates scope states within the tree", () => {
    const tree = generateFilledTree();
    expect(tree.evaluate("glimpse:users:*")).toEqual(PermissionState.NONE);
    expect(tree.evaluate("glimpse:users:robere2:*")).toEqual(PermissionState.NONE);
    expect(tree.evaluate("glimpse:users:robere2")).toEqual(PermissionState.NONE);
    expect(tree.evaluate("glimpse:users:daoj:email:read")).toEqual(PermissionState.ALLOW);
    expect(tree.evaluate("glimpse:users:robere2:daoj:email:read")).toEqual(PermissionState.NONE);
    expect(tree.evaluate("glimpse:tags:*")).toEqual(PermissionState.ALLOW);
    expect(tree.evaluate("glimpse:tags:Private:read")).toEqual(PermissionState.DENY);
    expect(tree.evaluate("glimpse:tags:Private:write")).toEqual(PermissionState.DENY);
    expect(tree.evaluate("glimpse:tags:Private:write:read")).toEqual(PermissionState.DENY);
    expect(tree.evaluate("glimpse:tags:Private:*")).toEqual(PermissionState.DENY);
    expect(tree.evaluate("glimpse:tags:Protected:write")).toEqual(PermissionState.DENY);
    expect(tree.evaluate("glimpse:tags:Protected:read")).toEqual(PermissionState.ALLOW);
    expect(tree.evaluate("glimpse:productions:testing:read")).toEqual(PermissionState.DENY);
    expect(tree.evaluate("glimpse:productions:*:read")).toEqual(PermissionState.ALLOW);
    expect(tree.evaluate("glimpse:productions:testing:write")).toEqual(PermissionState.NONE);
    expect(tree.evaluate("glimpse:productions:testing:read")).toEqual(PermissionState.DENY);
});

it("grants full access with the FULL_ACCESS static property", () => {
    const tree = PermissionTree.FULL_ACCESS;

    expect(tree.evaluate("glimpse:test")).toEqual(PermissionState.ALLOW);
    expect(tree.evaluate("glimpse:test2:read")).toEqual(PermissionState.ALLOW);
    expect(tree.evaluate("glimpse:test2")).toEqual(PermissionState.ALLOW);
    expect(tree.evaluate("*")).toEqual(PermissionState.ALLOW);
});

it("evaluates strings and PermissionScope objects the same", () => {
    const tree = new PermissionTree(
        new Permission("glimpse:test", true),
        new Permission("glimpse:test2:read", false)
    );

    expect(tree.evaluate("glimpse:test")).toEqual(PermissionState.ALLOW);
    expect(tree.evaluate("glimpse:test2:read")).toEqual(PermissionState.DENY);
    expect(tree.evaluate("glimpse:test2")).toEqual(PermissionState.NONE);
    expect(tree.evaluate(new PermissionScope("glimpse:test"))).toEqual(PermissionState.ALLOW);
    expect(tree.evaluate(new PermissionScope("glimpse:test2:read"))).toEqual(PermissionState.DENY);
    expect(tree.evaluate(new PermissionScope("glimpse:test2"))).toEqual(PermissionState.NONE);
});

it("generates the correct JSON", () => {
    // This is not a great test as it relies on the implementation of JSON.stringify not changing
    const tree = new PermissionTree(
        new Permission("*", false),
        new Permission("glimpse:test", true),
        new Permission("glimpse:test2:read", false)
    );
    const expectedJson = {
        "*": new Permission("*", PermissionState.DENY),
        glimpse: {
            test: new Permission("glimpse:test", PermissionState.ALLOW),
            test2: {
                read: new Permission("glimpse:test2:read", PermissionState.DENY),
            },
        },
    };
    expect(JSON.stringify(tree)).toEqual(JSON.stringify(expectedJson));
});
