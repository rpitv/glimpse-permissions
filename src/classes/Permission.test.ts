import { Permission } from "./Permission";
import { PermissionState } from "./PermissionState";
import { PermissionScope } from "./PermissionScope";

it("allows construction from primitives", () => {
    let permission = new Permission("alpha:beta:charlie:delta", true);
    expect(permission.getScope().toString()).toEqual("alpha:beta:charlie:delta");
    expect(permission.getState()).toEqual(PermissionState.ALLOW);
    permission = new Permission("alpha:beta:charlie:delta", false);
    expect(permission.getScope().toString()).toEqual("alpha:beta:charlie:delta");
    expect(permission.getState()).toEqual(PermissionState.DENY);
});

it("allows construction from declared types", () => {
    let permission = new Permission(
        new PermissionScope("alpha:beta:charlie:delta"),
        PermissionState.ALLOW
    );
    expect(permission.getScope().toString()).toEqual("alpha:beta:charlie:delta");
    expect(permission.getState()).toEqual(PermissionState.ALLOW);
    permission = new Permission(new PermissionScope("scope"), PermissionState.DENY);
    expect(permission.getScope().toString()).toEqual("scope");
    expect(permission.getState()).toEqual(PermissionState.DENY);
    permission = new Permission(new PermissionScope("1:2:3"), PermissionState.NONE);
    expect(permission.getScope().toString()).toEqual("1:2:3");
    expect(permission.getState()).toEqual(PermissionState.NONE);
});

it("allows construction from a mix of types", () => {
    let permission = new Permission(new PermissionScope("alpha:beta:charlie:delta"), true);
    expect(permission.getScope().toString()).toEqual("alpha:beta:charlie:delta");
    expect(permission.getState()).toEqual(PermissionState.ALLOW);
    permission = new Permission("alpha:beta:charlie:delta", PermissionState.ALLOW);
    expect(permission.getScope().toString()).toEqual("alpha:beta:charlie:delta");
    expect(permission.getState()).toEqual(PermissionState.ALLOW);
});

it("returns the correct string from toString()", () => {
    let permission = new Permission(new PermissionScope("alpha:beta:charlie:delta"), true);
    expect(permission.toString()).toEqual("alpha:beta:charlie:delta = 0");
    permission = new Permission(
        new PermissionScope("alpha:beta:charlie:delta"),
        PermissionState.NONE
    );
    expect(permission.toString()).toEqual("alpha:beta:charlie:delta = -1");
    permission = new Permission(new PermissionScope("alpha:beta:charlie:delta"), false);
    expect(permission.toString()).toEqual("alpha:beta:charlie:delta = 1");
});

it("correctly compares two basic Permissions to see which is higher priority", () => {
    // Perm B is more specific than perm A, therefore perm B should be ordered first.
    let permA = new Permission("rpitv:glimpse", true);
    let permB = new Permission("rpitv:glimpse:users", false);
    expect(permA.compare(permB)).toBeGreaterThan(0);
    // Perm B is less specific than perm A, therefore perm A should be ordered first.
    permA = new Permission("glimpse:one", true);
    permB = new Permission("abcd", false);
    expect(permA.compare(permB)).toBeLessThan(0);
    // Perm A and B are both the same specificity but unrelated. Perm B should come first
    //   since it is a denying permission.
    permA = new Permission("glimpse:one", true);
    permB = new Permission("xyz:one", false);
    expect(permA.compare(permB)).toBeGreaterThan(0);
    // Perm A and B are both the same specificity and state. Order does not
    //   matter, and therefore the original order should be maintained.
    permA = new Permission("glimpse:one", true);
    permB = new Permission("xyz:one", true);
    expect(permA.compare(permB)).toEqual(0);
});

it("correctly compares two wildcard Permissions to see which is higher priority", () => {
    // Perm B is more specific than perm A, therefore perm B should be ordered first.
    let permA = new Permission("rpitv:glimpse:*", true);
    let permB = new Permission("rpitv:glimpse:users", false);
    expect(permA.compare(permB)).toBeGreaterThan(0);
    // Perm B is less specific than perm A, therefore perm A should be ordered first.
    permA = new Permission("glimpse:one", true);
    permB = new Permission("*:one", false);
    expect(permA.compare(permB)).toBeLessThan(0);
    // Perm B is less specific than perm A, therefore perm A should be ordered first.
    permA = new Permission("glimpse:users:read:*", true);
    permB = new Permission("glimpse:users:read", false);
    expect(permA.compare(permB)).toBeLessThan(0);
    // Perm A and B are both the same specificity and state. Order does not
    //   matter, and therefore the original order should be maintained.
    permA = new Permission("*:two", true);
    permB = new Permission("*:one", true);
    expect(permA.compare(permB)).toEqual(0);
    // Perm B is more specific than perm A, therefore perm B should be ordered first.
    permA = new Permission("*:*", true);
    permB = new Permission("*:one", true);
    expect(permA.compare(permB)).toBeGreaterThan(0);
    // Perm B is less specific than perm A, therefore perm A should be ordered first.
    permA = new Permission("*:*:*", true);
    permB = new Permission("*:*", true);
    expect(permA.compare(permB)).toBeLessThan(0);
    // Perm A and B have an identical scope but perm A is denying. Therefore,
    //   perm A should appear first.
    permA = new Permission("*:*", false);
    permB = new Permission("*:*", true);
    expect(permA.compare(permB)).toBeLessThan(0);
    // Perm A and B have an identical scope and state. Order should not matter.
    permA = new Permission("*:*", true);
    permB = new Permission("*:*", true);
    expect(permA.compare(permB)).toEqual(0);
});

it("correctly compares two Permissions to see which is higher priority when one of them has state = NONE", () => {
    // Perm B is NONE state, therefore perm A should appear first.
    let permA = new Permission("rpitv:productions", true);
    let permB = new Permission("rpitv:users", PermissionState.NONE);
    expect(permA.compare(permB)).toBeLessThan(0);
    // Perm A is NONE state, therefore perm B should appear first.
    permA = new Permission("rpitv:productions", PermissionState.NONE);
    permB = new Permission("rpitv:users", false);
    expect(permA.compare(permB)).toBeGreaterThan(0);
    // Perm A is NONE state, therefore perm B should appear first.
    permA = new Permission("*:*", PermissionState.NONE);
    permB = new Permission("*:*", false);
    expect(permA.compare(permB)).toBeGreaterThan(0);
    // Perm A and B are both the same specificity and state. Order does not
    //   matter, and therefore the original order should be maintained.
    permA = new Permission("abc", PermissionState.NONE);
    permB = new Permission("xyz", PermissionState.NONE);
    expect(permA.compare(permB)).toEqual(0);
    // Perm A and B are same state and scope, therefore order doesn't matter
    permA = new Permission("abc", PermissionState.NONE);
    permB = new Permission("abc", PermissionState.NONE);
    expect(permA.compare(permB)).toEqual(0);
});
