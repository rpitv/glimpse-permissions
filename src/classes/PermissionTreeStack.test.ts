import { PermissionTreeStack } from "./PermissionTreeStack";
import { PermissionTree } from "./PermissionTree";
import { Permission } from "./Permission";
import { PermissionScope } from "./PermissionScope";
import { PermissionState } from "./PermissionState";

it("correctly handles basic pushes and pops", () => {
    const permissionTreeStack = new PermissionTreeStack();

    const treeA = new PermissionTree();
    const treeB = new PermissionTree();

    expect(permissionTreeStack.peek()).toEqual(undefined);
    permissionTreeStack.push(treeA);
    expect(permissionTreeStack.peek()).toEqual(treeA);
    permissionTreeStack.push(treeA);
    expect(permissionTreeStack.peek()).toEqual(treeA);
    permissionTreeStack.push(treeB);
    expect(permissionTreeStack.peek()).toEqual(treeB);
    expect(permissionTreeStack.pop()).toEqual(treeB);
    expect(permissionTreeStack.peek()).toEqual(treeA);
    expect(permissionTreeStack.pop()).toEqual(treeA);
    expect(permissionTreeStack.peek()).toEqual(treeA);
    expect(permissionTreeStack.pop()).toEqual(treeA);
    expect(permissionTreeStack.peek()).toEqual(undefined);
});

it("allows pushing multiple trees", () => {
    const permissionTreeStack = new PermissionTreeStack();

    const tree = new PermissionTree();

    permissionTreeStack.push(tree, tree);
    expect(permissionTreeStack.pop()).toEqual(tree);
    expect(permissionTreeStack.pop()).toEqual(tree);
    expect(permissionTreeStack.pop()).toEqual(undefined);
});

it("allows pushing trees via the constructor", () => {
    const tree = new PermissionTree();
    const permissionTreeStack = new PermissionTreeStack(tree, tree);
    expect(permissionTreeStack.pop()).toEqual(tree);
    expect(permissionTreeStack.pop()).toEqual(tree);
    expect(permissionTreeStack.pop()).toEqual(undefined);
});

it("searches multiple trees in the tree stack", () => {
    const treeStack = new PermissionTreeStack();

    const guestTree = new PermissionTree();
    guestTree.add(new Permission("glimpse:productions:*:read", true));
    treeStack.push(guestTree);

    expect(treeStack.evaluate(new PermissionScope("glimpse:productions:*:read"))).toEqual(
        PermissionState.ALLOW
    );
    expect(treeStack.evaluate(new PermissionScope("glimpse:productions:*:write"))).toEqual(
        PermissionState.NONE
    );
    expect(treeStack.evaluate(new PermissionScope("glimpse:*:bananas"))).toEqual(
        PermissionState.NONE
    );

    const userTree = new PermissionTree();
    userTree.add(new Permission("glimpse:productions:*:write", true));
    treeStack.push(userTree);

    expect(treeStack.evaluate(new PermissionScope("glimpse:productions:*:read"))).toEqual(
        PermissionState.ALLOW
    );
    expect(treeStack.evaluate(new PermissionScope("glimpse:productions:*:write"))).toEqual(
        PermissionState.ALLOW
    );
    expect(treeStack.evaluate(new PermissionScope("glimpse:*:bananas"))).toEqual(
        PermissionState.NONE
    );

    treeStack.push(PermissionTree.FULL_ACCESS);

    expect(treeStack.evaluate(new PermissionScope("glimpse:productions:*:read"))).toEqual(
        PermissionState.ALLOW
    );
    expect(treeStack.evaluate(new PermissionScope("glimpse:productions:*:write"))).toEqual(
        PermissionState.ALLOW
    );
    expect(treeStack.evaluate(new PermissionScope("glimpse:*:bananas"))).toEqual(
        PermissionState.ALLOW
    );

    treeStack.pop();

    expect(treeStack.evaluate(new PermissionScope("glimpse:productions:*:read"))).toEqual(
        PermissionState.ALLOW
    );
    expect(treeStack.evaluate(new PermissionScope("glimpse:productions:*:write"))).toEqual(
        PermissionState.ALLOW
    );
    expect(treeStack.evaluate(new PermissionScope("glimpse:*:bananas"))).toEqual(
        PermissionState.NONE
    );

    treeStack.pop();

    expect(treeStack.evaluate(new PermissionScope("glimpse:productions:*:read"))).toEqual(
        PermissionState.ALLOW
    );
    expect(treeStack.evaluate(new PermissionScope("glimpse:productions:*:write"))).toEqual(
        PermissionState.NONE
    );
    expect(treeStack.evaluate(new PermissionScope("glimpse:*:bananas"))).toEqual(
        PermissionState.NONE
    );
});

it("accepts strings in evaluate()", () => {
    const treeStack = new PermissionTreeStack();

    const guestTree = new PermissionTree();
    guestTree.add(new Permission("glimpse:productions:*:read", true));
    treeStack.push(guestTree);
    const userTree = new PermissionTree();
    userTree.add(new Permission("glimpse:productions:*:write", false));
    treeStack.push(userTree);

    expect(treeStack.evaluate("glimpse:productions:20220130_hockey_slu:write")).toEqual(
        PermissionState.DENY
    );
    expect(treeStack.evaluate("glimpse:productions:20220130_hockey_slu:read")).toEqual(
        PermissionState.ALLOW
    );
    expect(treeStack.evaluate("glimpse:productions:20220130_hockey_slu:delete")).toEqual(
        PermissionState.NONE
    );
});

it("handles scope overlap in the correct order", () => {
    const treeStack = new PermissionTreeStack();
    const treeOne = new PermissionTree(
        new Permission("glimpse:users:read", true),
        new Permission("glimpse:productions:write", true)
    );
    const treeTwo = new PermissionTree(new Permission("glimpse:users:*", false));
    treeStack.push(treeTwo);
    treeStack.push(treeOne);
    expect(treeStack.evaluate("glimpse:users:read")).toEqual(PermissionState.DENY);
    expect(treeStack.evaluate("glimpse:users:write")).toEqual(PermissionState.DENY);
    expect(treeStack.evaluate("glimpse:productions:read")).toEqual(PermissionState.NONE);
    expect(treeStack.evaluate("glimpse:productions:write")).toEqual(PermissionState.ALLOW);
});
