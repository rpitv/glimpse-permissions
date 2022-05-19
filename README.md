<img src="rpitv_glimpse_logo.png" alt="RPI TV Glimpse logo" width="400">

# RPI TV Glimpse Permissions &middot; [![Unit Tests](https://github.com/rpitv/glimpse-permissions/actions/workflows/unit-tests.yml/badge.svg)](https://github.com/rpitv/glimpse-permissions/actions/workflows/unit-tests.yml) [![codecov](https://codecov.io/gh/rpitv/glimpse-permissions/branch/dev/graph/badge.svg?token=8HY7DBAX16)](https://codecov.io/gh/rpitv/glimpse-permissions) [![GitHub license](https://img.shields.io/github/license/rpitv/glimpse-permissions)](https://github.com/rpitv/glimpse-permissions/blob/dev/LICENSE)

> Access control system for RPI TV Glimpse applications and services.

Applications which connect to the Glimpse backend and need to know whether a user has permission to do something should use this library.

## Installing / Getting started

Install the package via:

```shell
npm install --save @rpitv/glimpse-permissions
```

you can then import it, e.g.

```ts
import { PermissionTree } from "./PermissionTree";
import { Permission } from "./Permission";

const permission = new Permission("glimpse:users:email:*:read", true);
const tree = new PermissionTree(permission);

if (tree.evaluate("glimpse:users:email:robere2:read")) {
  console.log("Congrats, you have permission!");
}
```

## Developing

### Built With

`glimpse-permissions` does not currently have any runtime dependencies, and we will attempt to keep it that way. However, build tools like TypeScript are used in development.

### Prerequisites

You should have Node.js installed on your machine in order to utilize this package. Even-numbered Node.js verions after Node 12 are currently supported.

### Setting up Dev

Run the following commands to set up your project.

```shell
git clone git@github.com:rpitv/glimpse-permissions.git
cd glimpse-permissions/
npm install
npm run prepare
```

### Building

You can build the package via:

```shell
npm run build
```

GitHub Actions will auto-build and deploy the package upon merge to the production branch.

Running the build command will compile the TypeScript into JavaScript located within the `/dist` directory.

## Versioning

This project uses [SemVer](http://semver.org/) for versioning.

## Tests

A full unit test suite is available via Jest. Test files should be per-file, and located in the same directory as the file they are testing. Their file name should be the same, but with `.test` before `.ts`.

The test suite can be ran with `npm run test`. The test suite is also ran during CI testing before the package is deployed.

## Style guide

This project follows the guidelines found here: https://github.com/elsewhencode/project-guidelines

The main branch is the development branch. When it's time for a release, a release on GitHub is made and auto-published to NPM.

Code style is enforced using ESLint. Continuous Integration runs the linter before unit tests, however you may also run the linter yourself using:

```shell
npm run lint
```

Automatically fix style issues with:

```shell
npm run fix
```

This command will automatically run in a pre-commit Git hook.

## Api Reference

### Permission

Permissions in Glimpse are simply a pair of a PermissionScope and PermissionState. They can be added to PermissionTrees to combine multiple permissions into a single grouping that can be used for users or groups.

```ts
public constructor(scope: string, state: boolean);
public constructor(scope: string, state: PermissionState);
public constructor(scope: PermissionScope, state: boolean);
public constructor(scope: PermissionScope, state: PermissionState);
```

Create a new Permission

Parameters:

- `scope: string|PermissionScope` Scope which this permission applies to
- `state: boolean|PermissionState` The state of your new Permission. "NONE" is the default behavior, but may be useful when using PermissionTreeStacks.

```ts
public toString(): string;
```

Stringify the Permission in the form of "scope = state"

Returns the stringified Permission, joining the scope with the state's numerical value, separated by " = ".

```ts
public getState(): PermissionState;
```

Get the PermissionState value associated with this Permission.

```ts
public getScope(): PermissionScope;
```

Get the scope which this Permission applies to.

```ts
public compare(that: Permission): number;
```

Compare this Permission against another Permission to check which has a higher priority in the event of conflicts. Permission conflicts are handled in the following order:

- More specific permission scopes are higher priority than less specific permission scopes. I.e., the more colons in your permission scope, the more specific it is.
- Permission scopes with fewer wildcards are prioritized over permission scopes with more wildcards, regardless of the position of those wildcards.
- DENY states are prioritized over ALLOW states, and ALLOW states are prioritized over NONE states.
- If all else is the same, permissions maintain their original order (this method returns 0).

Parameters:

- `that: Permission` Permission which you want to compare against.

Returns number < 0 if this comes before the passed permission, 0 if
they are equal, or number > 0 if the passed permission comes before
this.

### PermissionScope

A PermissionScope is how permissions in Glimpse are limited to a specific area of an application/service. They are paired with PermissionStates via the Permission class. PermissionScopes are a tiered namespacing system with each tier separated by colons (":").

Each tier is either a string literal or an asterisk ("*") to signify that any string is valid in that specific namespace tier. Asterisks cannot be combined with string literals, e.g. "*substring\*". This will be interpreted literally.

```ts
public static readonly SEPARATOR: string;
```

This is used internally in this class to make swapping out the separating character easier, if ever desired. Use this in your systems if you want to future-proof against that.

```ts
public static readonly WILDCARD: string;
```

This is used internally in the class to make swapping out the wildcard character easier, if ever desired. Use this in your systems if you want to future-proof against that.

```ts
public constructor(scope?: string);
```

Create a new PermissionScope

Parameters:

- `scope?: string` String version of this PermissionScope, where each tier is split by a colon (":"). Each tier may also be a sole asterisk ("\*") to represent a wildcard. Wildcards cannot be combined with other strings in the same tier. Can be omitted to initialize an empty PermissionScope.

```ts
public copy(): PermissionScope;
```

Create a copy of this PermissionScope. Modifications to the copy will not modify this version of the PermissionScope, and vice versa.

Returns a PermissionScope with the same values as this one. The internal
structure is deeply copied.

```ts
public toArray(): string[];
```

Get a copy of this PermissionScope's internal array. This is the best way to get direct access to the individual tiers of this PermissionScope.

This is a copy of the internal array, so if possible, try alternative methods first.

Returns an array of strings, where each string is one tier. No string will contain the colon character (":"), as that is used as the separator between tiers.

```ts
public at(depth: number): string | undefined;
```

Get the tier at the specified depth, if it exists. Depth is zero-indexed. If this scope is not as deep/specific as the passed number, then undefined will be returned. E.g., in "alpha:beta:charlie", at(1) will return "beta".

Parameters:

- Depth to retrieve. Must be a number between -this.size and this.size. Any non-integers will be rounded down.

If the passed number is greater than or equal to 0 but less than
the size of this scope, the tier at the specified depth from the
top/start is returned. If number is less than 0, the absolute value of
the passed number is subtracted from the length of the scope. Anything
out of bounds will return undefined.

```ts
public get size(): number;
```

Getter for this scope's size in tiers. If you'd like to think about it another way, this is equivalent to the number of colons passed in the constructor minus one (ignoring pushScope() and popScope()).

Returns the size of this PermissionScope in terms of tiers.

```ts
public [Symbol.iterator](): IterableIterator<string>;
```

Get iterator for this PermissionScope to iterate over the different levels of the scope, starting with the first item in the array, i.e. the highest level.

Returns an `IterableIterator<string>` which can be used to iterate over
this PermissionScope's tiers.

```ts
public getWildcardCount(): number;
```

Get the total number of wildcards used in this PermissionScope.

Returns the total number of wildcards used in this PermissionScope. A wildcard is considered any tier which is only one character in length and contains the character "\*".

```ts
public toString(): string;
```

Convert this PermissionScope back into a string, joining each tier back together with colons (":").

Returns a single string representing this PermissionScope. If you did not use `pushTier` or `{@link `popTier`, then this should be equal to what was passed to the constructor. You can pass this back to the constructor at any time to recreate the PermissionScope object.

```ts
public pushTier(tier: string): void;
public pushTier(tier: PermissionScope): void;
```

Push a tier, or multiple tiers, onto the end of this PermissionScope. As
an example, if the PermissionScope is currently "abc:xyz" and you push
"123", then the PermissionScope will be updated to "abc:xyz:123".
Similarly, if "123:789" is pushed, then the result is
"abc:xyz:123:789".

Parameters:

- `tier: string|PermissionScope` PermissionScope or string containing the tier or tiers to push onto the PermissionScope. If it is a string, the string is split at colons (":") in order to separate into tiers. If the string doesn't contain any colons, then a single tier is pushed onto the end of the PermissionScope. Wildcards are also allowed.

```ts
public popTier(): string | undefined;
```

Pop a tier off the end of this PermissionScope, if it has one. If the PermissionScope is empty, then undefined is returned. The PermissionScope is considered empty if the size is equal to zero. As an example, calling this method on "abc:xyz:123" will result in a PermissionScope with the value of "abc:xyz".

Returns the tier that was popped off the end of the PermissionScope, or undefined if the PermissionScope is already empty.

```ts
public includes(scope: PermissionScope): boolean;
```

Check whether this PermissionScope's scope includes the scope of the passed PermissionScope. Scope A is considered to be contained within scope B if scope A and scope B's tiers are all equal, or if any of scope B's tiers are wildcards ("_"). In the event that scope B's last tier is a wildcard, all lower tiers are also included (e.g., the scope `sample:_`also contains`sample:_:_`, `sample:_:_:\*`, etc.).

Parameters:

- `scope: PermissionScope|string` The scope to search for in this scope.

Returns true if this scope also covers the passed scope, or false
otherwise.

```ts
public compare(that: PermissionScope): number;
```

Compare this PermissionScope against another PermissionScope to check which has a higher priority in the event of conflicts. PermissionScope conflicts are handled in the following order:

- More specific PermissionScopes are higher priority than less specific PermissionScope. I.e., the more colons in your PermissionScope, the more specific it is.
- PermissionScopes with fewer wildcards are prioritized over PermissionScopes with more wildcards, regardless of the position of those wildcards.
- If all else is the same, PermissionScopes maintain their original order (this method returns 0).

Parameters:

- `that: PermissionScope` PermissionScope which you want to compare against.

Returns number < 0 if this comes before the passed PermissionScope, 0 if
they are equal, or number > 0 if the passed PermissionScope comes
before this.

### PermissionTree

A PermissionTree groups Permissions together and can evaluate a large set of permissions to determine whether one permission in particular is allowed by the given tree.

```ts
public static readonly FULL_ACCESS: PermissionTree;
```

PermissionTree that grants full access to everything by allowing "\*".

```ts
public constructor(...permissions: Permission[])
```

Create a new PermissionTree

Parameters:

- `...permissions: Permission[]` List of initial permissions to put into the array.

```ts
public add(...permissions: Permission[]): void;
```

Add one or more Permissions to this PermissionTree. If this PermissionTree already contains the passed Permission(s), this will overwrite them.

Parameters:

- `...permissions: Permission[]` Permissions to add to this PermissionTree.

```ts
public evaluate(scope: PermissionScope): PermissionState;
public evaluate(scope: string): PermissionState;
```

Evaluate the state of this PermissionTree to see whether a passed PermissionScope is handled by the tree, and how to handle it if so.

Parameters:

- `scope: string | PermissionScope` The scope to search for in a stringified form.

Returns a PermissionState matching the state of whatever the highest priority matching Permission had. If there are no matching permissions, PermissionState.NONE is returned.

```ts
public toJSON(): PermissionTreeDef
```

Getter for object which should be serialized by JSON.stringify(). It is not recommended you use this function outside JSON.stringify().

Returns the inner tree structure used by this PermissionTree.

### PermissionTreeStack

A PermissionTreeStack is a utility to stack multiple trees on top of each other. This allows for the combining of multiple trees without physically combining them into a single tree (as this could result in conflicts). Trees maintain the order they were originally added in. Starting at index 0, whenever a PermissionScope matches a tree in the stack, it returns that tree's value. If it does not match, then the next index is tried.

```ts
public constructor(...permissionTrees: PermissionTree[]);
```

Create a new PermissionTreeStack

Parameters:

- `...permissionTrees: PermissionTree[]` List of PermissionTrees to initially add to this PermissionTreeStack. Can be empty in order to initialize an empty stack. The order in which they are provided is maintained, and the last Tree passed is placed at the top of the stack.

```ts
public push(...permissionTrees: PermissionTree[]): void;
```

Push one or more PermissionTrees onto the stack. These PermissionTrees are tacked onto the start of the PermissionTreeStack, and the last tree passed will be placed at the top of the stack. It can be removed via `pop()`.

Parameters:

- Zero or more PermissionTrees to add to the top of the stack. Pushing zero PermissionTrees will do nothing. The last PermissionTree is added to the top of the stack.

```ts
public pop(): PermissionTree | undefined;
```

Pop a PermissionTree off of the PermissionTreeStack. The Tree at the top of the stack is popped off. I.e., the last PermissionTree that was added will be popped off.

Returns the PermissionTree that was popped off, or undefined if the stack is empty.

```ts
public peek(): PermissionTree | undefined;
```

Peek at the end of the PermissionTreeStack without popping the value off. This returns the same value as `pop()` but without modifying the tree.

Returns the PermissionTree that was peeked, or undefined if the stack is empty.

```ts
public evaluate(scope: string): PermissionState;
public evaluate(scope: PermissionScope): PermissionState;
```

Evaluate the state of the PermissionTree at the top of the stack to see whether a passed PermissionScope is handled by the tree, and how to handle it if so. If the tree at the top of the stack has no state for the given scope (i.e., evaluate() on the tree returns NONE), then the next tree in the stack is tried. If none of the trees in the stack have a state for the given scope, then this returns NONE.

Parameters:

- `scope: string|PermissionScope` The scope to search for. String-based scopes are automatically converted into PermissionScope objects.

Returns the PermissionState value returned from evaluate() on the tree on the top of the stack. If the tree on the top of the stack returns NONE, then the next tree in the stack is tried. If none of the trees in the stack have a state for the given scope, then this returns NONE.

### AccessDeniedError

An extension of Error specifically for when someone tries to use a permission scope they don't have permission for.

```ts
constructor();
constructor(scope: string);
constructor(scope: PermissionScope)
```
Parameters:

- `scope?: string|PermissionScope` Scope which was requested, but the user did not have permission for. If undefined or an empty string are passed, the error message is generalized for multiple permissions (i.e., "Missing required permissions")

### PermissionTools

This file contains a number of methods or variables which may be helpful when dealing with this library.

```ts
globalStack: PermissionTreeStack;
```

A global PermissionTreeStack which can be used in applications

```ts
function formatScope(scope: string, ...vars: any[]): string;
function formatScope(scope: PermissionScope, ...vars: any[]): PermissionScope;
```

Format a PermissionScope with variables in it. Technically can format any string, however it was designed and intended specifically for PermissionScopes.

Parameters:

- `scope: string | PermissionScope` Scope to format. This parameter is not modified in place if a PermissionScpoe is passed. Instead, a new instance of PermissionScope is returned. Variable locations are marked within this scope by a dollar sign ("$") followed by the variable number (one-indexed). As an example, $2 would be replaced by the second variable passed to this method (not including the scope itself). If the PermissionScope contains more variable placeholders than passed, the excess will remain as-is.
- `vars: any[]` Variables to be inserted into the scope. Any variables are valid, but non-string variables will be stringified in the process (via toString()). Any instance of "$no" in the string, where "no" is an integer greater than 0, will be replaced by the corresponding variable passed here. If a variable is passed but no placeholder exists for it, nothing will happen to that placeholder. Similarly, if a placeholder exists for a variable but not enough variables were passed, nothing will happen to that placeholder. No more than 9 variables should be passed, or else behavior is undefined.

Returns a new, updated PermissionScope if a PermissionScope was originally passed in. If a string was passed in, then a new string is returned. The returned value is completely disconnected from the scope that was passed, so modifications to one will not change the other (particularly regarding PermissionScopes).

## Licensing

[This project is licensed under the GPL 3.0 license.](./LICENSE)
