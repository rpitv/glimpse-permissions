import { PermissionScope } from "./PermissionScope";

it("correctly initializes the scope", () => {
    const scope = new PermissionScope("alpha:beta:charlie:delta");
    const scopeArr = scope.toArray();
    expect(scopeArr[0]).toEqual("alpha");
    expect(scopeArr[1]).toEqual("beta");
    expect(scopeArr[2]).toEqual("charlie");
    expect(scopeArr[3]).toEqual("delta");
});

it("allows for top-level scope usage", () => {
    const scope1 = new PermissionScope("glimpse");
    const scope2 = new PermissionScope("*");

    expect(scope1.toArray()).toHaveLength(1);
    expect(scope2.toArray()).toHaveLength(1);
    expect(scope1.toArray()[0]).toEqual("glimpse");
    expect(scope2.toArray()[0]).toEqual("*");
});

it("calculates the correct number of wildcards", () => {
    let scope = new PermissionScope("glimpse");
    expect(scope.getWildcardCount()).toEqual(0);
    scope = new PermissionScope("glimpse:*");
    expect(scope.getWildcardCount()).toEqual(1);
    scope = new PermissionScope("glimpse:*:*");
    expect(scope.getWildcardCount()).toEqual(2);
    scope = new PermissionScope("*:*:*");
    expect(scope.getWildcardCount()).toEqual(3);
    scope = new PermissionScope("*");
    expect(scope.getWildcardCount()).toEqual(1);
    scope = new PermissionScope("*:test");
    expect(scope.getWildcardCount()).toEqual(1);
    scope = new PermissionScope("abc:*:test");
    expect(scope.getWildcardCount()).toEqual(1);
});

it("allows for instantiation with no scope", () => {
    const scope1 = new PermissionScope();
    const scope2 = new PermissionScope("");

    expect(scope1.toArray()).toHaveLength(0);
    expect(scope2.toArray()).toHaveLength(0);
});

it("creates a true copy with copy()", () => {
    const originalScope = new PermissionScope("one:two:three");
    const scopeCopy = originalScope.copy();

    expect(scopeCopy).not.toBe(originalScope);
    expect(scopeCopy).toEqual(originalScope);
});

it("creates the correct string with toString()", () => {
    const scopeStr = "testing:123:456:hello";
    const scope = new PermissionScope(scopeStr);
    expect(scope.toString()).toEqual(scopeStr);
});

it("returns the correct items from at()", () => {
    const scope = new PermissionScope("berries:and:cream");
    expect(scope.at(-0)).toEqual(scope.toArray()[0]);
    expect(scope.at(0)).toEqual(scope.toArray()[0]);
    expect(scope.at(1)).toEqual(scope.toArray()[1]);
    expect(scope.at(2)).toEqual(scope.toArray()[2]);
    expect(scope.at(3)).toEqual(undefined);
    expect(scope.at(-5)).toEqual(undefined);
    expect(scope.at(1.9)).toEqual(scope.at(1));
});

it("returns the correct size from size()", () => {
    let scope = new PermissionScope("gopher:gopher:gopher:porcupine");
    expect(scope.size).toEqual(4);
    scope.popTier();
    expect(scope.size).toEqual(3);
    scope.pushTier("gopher");
    expect(scope.size).toEqual(4);
    scope.popTier();
    scope.popTier();
    scope.popTier();
    scope.popTier();
    scope.popTier();
    scope.popTier();
    expect(scope.size).toEqual(0);
    scope = new PermissionScope();
    expect(scope.size).toEqual(0);
});

it("supports Symbol.iterator()", () => {
    const scope = new PermissionScope("wow:iteration:alliteration");
    let i = 0;
    // @ts-ignore This is causing IDE errors for me, but the proper flag is in the tsconfig.
    for (const tier of scope) {
        expect(tier).toEqual(scope.at(i++));
    }
    // @ts-ignore This is causing IDE errors for me, but the proper flag is in the tsconfig.
    expect([...scope]).toEqual(["wow", "iteration", "alliteration"]);
});

it("pushes stringified scope elements onto the scope", () => {
    const scope = new PermissionScope("testing:123");
    scope.pushTier("koala:zoo");
    expect(scope.toArray()).toHaveLength(4);
    scope.pushTier("penguin");
    expect(scope.toArray()).toHaveLength(5);
    expect(scope.toArray()[0]).toEqual("testing");
    expect(scope.toArray()[1]).toEqual("123");
    expect(scope.toArray()[2]).toEqual("koala");
    expect(scope.toArray()[3]).toEqual("zoo");
    expect(scope.toArray()[4]).toEqual("penguin");
});

it("pushes PermissionScope elements onto the scope", () => {
    const scope = new PermissionScope("testing:123");
    scope.pushTier(new PermissionScope("koala:zoo"));
    expect(scope.toArray()).toHaveLength(4);
    scope.pushTier(new PermissionScope("penguin"));
    expect(scope.toArray()).toHaveLength(5);
    expect(scope.toArray()[0]).toEqual("testing");
    expect(scope.toArray()[1]).toEqual("123");
    expect(scope.toArray()[2]).toEqual("koala");
    expect(scope.toArray()[3]).toEqual("zoo");
    expect(scope.toArray()[4]).toEqual("penguin");
});

it("pops scope elements off the scope", () => {
    const scope = new PermissionScope("testing:123");
    scope.pushTier(new PermissionScope("koala:zoo"));
    scope.popTier();
    expect(scope.toArray()).toHaveLength(3);
    expect(scope.toArray()[0]).toEqual("testing");
    expect(scope.toArray()[1]).toEqual("123");
    expect(scope.toArray()[2]).toEqual("koala");
    scope.popTier();
    scope.popTier();
    expect(scope.toArray()).toHaveLength(1);
    expect(scope.toArray()[0]).toEqual("testing");
});

it("correctly evaluates if a given simple scope is covered by its own scope", () => {
    const scope = new PermissionScope("rpitv:this_is:a_scope");
    expect(scope.includes("testing:123")).toEqual(false);
    expect(scope.includes("rpitv:testing:123")).toEqual(false);
    expect(scope.includes("rpitv:this_is:123")).toEqual(false);
    expect(scope.includes("rpitv:this_is:a_scope!")).toEqual(false);
    expect(scope.includes("rpitv:this_is:a_scope:123")).toEqual(false);
    expect(scope.includes("rpitv:this_is:a_scope")).toEqual(true);
});

it("correctly evaluates if a given scope with wildcards is covered by its own scope", () => {
    let scope = new PermissionScope("rpitv:*:a_scope");
    expect(scope.includes("testing:123")).toEqual(false);
    expect(scope.includes("rpitv:testing:123")).toEqual(false);
    expect(scope.includes("rpitv:this_is:123")).toEqual(false);
    expect(scope.includes("rpitv:this_is:a_scope!")).toEqual(false);
    expect(scope.includes("rpitv:this_is:a_scope:123")).toEqual(false);
    expect(scope.includes("rpitv:this_is:a_scope")).toEqual(true);
    expect(scope.includes("rpitv:this_isnt:a_scope")).toEqual(true);
    expect(scope.includes("rpitv:*:a_scope")).toEqual(true);
    expect(scope.includes("rpitv::a_scope")).toEqual(true);

    scope = new PermissionScope("*");

    expect(scope.includes("test")).toEqual(true);
    expect(scope.includes("testing:123")).toEqual(true);
    expect(scope.includes("not:testing")).toEqual(true);
    expect(scope.includes("*:wow")).toEqual(true);
    expect(scope.includes("wow:*")).toEqual(true);
    expect(scope.includes("*")).toEqual(true);
    expect(scope.includes("*:*:*:*:*")).toEqual(true);
    expect(scope.includes("*********************************:")).toEqual(true);
    expect(scope.includes("")).toEqual(false);
});

it("accepts PermissionScope objects in its include() function", () => {
    let scope = new PermissionScope("rpitv:*:a_scope");
    expect(scope.includes(new PermissionScope("testing:123"))).toEqual(false);
    expect(scope.includes(new PermissionScope("rpitv:testing:123"))).toEqual(false);
    expect(scope.includes(new PermissionScope("rpitv:this_is:123"))).toEqual(false);
    expect(scope.includes(new PermissionScope("rpitv:this_is:a_scope!"))).toEqual(false);
    expect(scope.includes(new PermissionScope("rpitv:this_is:a_scope:123"))).toEqual(false);
    expect(scope.includes(new PermissionScope("rpitv:this_is:a_scope"))).toEqual(true);
    expect(scope.includes(new PermissionScope("rpitv:this_isnt:a_scope"))).toEqual(true);
    expect(scope.includes(new PermissionScope("rpitv:*:a_scope"))).toEqual(true);
    expect(scope.includes(new PermissionScope("rpitv::a_scope"))).toEqual(true);

    scope = new PermissionScope("*");

    expect(scope.includes(new PermissionScope("test"))).toEqual(true);
    expect(scope.includes(new PermissionScope("testing:123"))).toEqual(true);
    expect(scope.includes(new PermissionScope("not:testing"))).toEqual(true);
    expect(scope.includes(new PermissionScope("*:wow"))).toEqual(true);
    expect(scope.includes(new PermissionScope("wow:*"))).toEqual(true);
    expect(scope.includes(new PermissionScope("*"))).toEqual(true);
    expect(scope.includes(new PermissionScope("*:*:*:*:*"))).toEqual(true);
    expect(scope.includes(new PermissionScope("*********************************:"))).toEqual(true);
    expect(scope.includes(new PermissionScope(""))).toEqual(false);
});

it("correctly compares two basic PermissionScopes to see which is higher priority", () => {
    // scope B is more specific than scope A, therefore scope B should be ordered first.
    let scopeA = new PermissionScope("rpitv:glimpse");
    let scopeB = new PermissionScope("rpitv:glimpse:users");
    expect(scopeA.compare(scopeB)).toBeGreaterThan(0);
    // scope B is less specific than scope A, therefore scope A should be ordered first.
    scopeA = new PermissionScope("glimpse:one");
    scopeB = new PermissionScope("abcd");
    expect(scopeA.compare(scopeB)).toBeLessThan(0);
    // scope A and B are both the same specificity and state. Order does not
    //   matter, and therefore the original order should be maintained.
    scopeA = new PermissionScope("glimpse:one");
    scopeB = new PermissionScope("xyz:one");
    expect(scopeA.compare(scopeB)).toEqual(0);
});

it("correctly compares two wildcard Permissions to see which is higher priority", () => {
    // scope B is more specific than scope A, therefore scope B should be ordered first.
    let scopeA = new PermissionScope("rpitv:glimpse:*");
    let scopeB = new PermissionScope("rpitv:glimpse:users");
    expect(scopeA.compare(scopeB)).toBeGreaterThan(0);
    // scope B is less specific than scope A, therefore scope A should be ordered first.
    scopeA = new PermissionScope("glimpse:one");
    scopeB = new PermissionScope("*:one");
    expect(scopeA.compare(scopeB)).toBeLessThan(0);
    // scope B is less specific than scope A, therefore scope A should be ordered first.
    scopeA = new PermissionScope("glimpse:users:read:*");
    scopeB = new PermissionScope("glimpse:users:read");
    expect(scopeA.compare(scopeB)).toBeLessThan(0);
    // scope A and B are both the same specificity and state. Order does not
    //   matter, and therefore the original order should be maintained.
    scopeA = new PermissionScope("*:two");
    scopeB = new PermissionScope("*:one");
    expect(scopeA.compare(scopeB)).toEqual(0);
    // scope B is more specific than scope A, therefore scope B should be ordered first.
    scopeA = new PermissionScope("*:*");
    scopeB = new PermissionScope("*:one");
    expect(scopeA.compare(scopeB)).toBeGreaterThan(0);
    // scope B is less specific than scope A, therefore scope A should be ordered first.
    scopeA = new PermissionScope("*:*:*");
    scopeB = new PermissionScope("*:*");
    expect(scopeA.compare(scopeB)).toBeLessThan(0);
    // scope A and B have an identical scope and state. Order should not matter.
    scopeA = new PermissionScope("*:*");
    scopeB = new PermissionScope("*:*");
    expect(scopeA.compare(scopeB)).toEqual(0);
});
