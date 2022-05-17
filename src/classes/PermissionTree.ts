import { Permission } from "./Permission";
import { PermissionScope } from "./PermissionScope";
import { PermissionState } from "./PermissionState";

type PermissionTreeDef = {
    [key: string]: PermissionTreeDef | Permission;
};

/**
 * A PermissionTree groups Permissions together and can evaluate a large set of
 *   permissions to determine whether one permission in particular is allowed
 *   by the given tree.
 */
class PermissionTree {
    /**
     * Permission tree that grants full access to everything by allowing "*".
     */
    public static readonly FULL_ACCESS = new PermissionTree(new Permission("*", true));

    /**
     * Tree structure containing the permissions.
     * @private
     */
    private readonly tree: PermissionTreeDef = {};

    /**
     * Create a new PermissionTree
     * @param permissions List of initial permissions to put into the array.
     */
    public constructor(...permissions: Permission[]) {
        this.add(...permissions);
    }

    /**
     * Add one or more Permissions to this PermissionTree. If this
     *   PermissionTree already contains the passed Permission(s), this will
     *   overwrite them.
     * @param permissions Permissions to add to this PermissionTree.
     */
    public add(...permissions: Permission[]): void {
        // For each permission...
        for (const permission of permissions) {
            const scopeArray = permission.getScope().toArray();
            let currentScope: PermissionTreeDef | Permission = this.tree;
            // Loop over the individual components of the scope...
            for (let i = 0; i < scopeArray.length; i++) {
                // This should never occur.
                if (currentScope instanceof Permission) {
                    throw new Error(
                        `Illegal state: Reached the end of permission scope ${permission
                            .getScope()
                            .toString()} earlier than expected.`
                    );
                }
                // If we're at the "bottom" of the scope, set the scope
                //   property in the tree to the permission state.
                if (i === scopeArray.length - 1) {
                    currentScope[scopeArray[i]] = permission;
                } else {
                    // Otherwise, set the property to the next level down.
                    if (
                        currentScope[scopeArray[i]] === undefined ||
                        currentScope[scopeArray[i]] instanceof Permission
                    ) {
                        currentScope[scopeArray[i]] = {};
                    }
                    currentScope = currentScope[scopeArray[i]];
                }
            }
        }
    }

    /**
     * Evaluate the state of this PermissionTree to see whether a passed
     *   PermissionScope is handled by the tree, and how to handle it if so.
     * @param scope The scope to search for in a stringified form.
     * @returns A PermissionState matching the state of whatever the highest
     *   priority matching Permission had. If there are no matching permissions,
     *   PermissionState.NONE is returned.
     */
    public evaluate(scope: PermissionScope): PermissionState;
    /**
     * Evaluate the state of this PermissionTree to see whether a passed
     *   PermissionScope is handled by the tree, and how to handle it if so.
     * @param scope The scope to search for in a stringified form.
     * @returns A PermissionState matching the state of whatever the highest
     *   priority matching Permission had. If there are no matching permissions,
     *   PermissionState.NONE is returned.
     */
    public evaluate(scope: string): PermissionState;
    public evaluate(scope: PermissionScope | string): PermissionState {
        if (typeof scope === "string") {
            scope = new PermissionScope(scope);
        }
        let matchingScopes: (PermissionTreeDef | Permission)[] = [this.tree];
        const scopeArr = scope.toArray();
        // Loop through every level of the scope we're searching for
        for (const scopeComponent of scopeArr) {
            const nextMatchingScopes: (PermissionTreeDef | Permission)[] = [];
            // Loop through each of the elements in the tree which match the
            //   scope of the permission scope we're looking for.
            for (const matchingScope of matchingScopes) {
                // If we reach a dead end of a branch on the permission tree,
                //   we can just discard it.
                if (matchingScope === undefined) {
                    continue;
                }
                // If we have reached the end of the branch, but it has a
                //    Permission associated with it, save that Permission.
                if (matchingScope instanceof Permission) {
                    if (matchingScope.getScope().popTier() === "*") {
                        nextMatchingScopes.push(matchingScope);
                    }
                } else {
                    // Otherwise, this is not the end of the branch, and we
                    //   should save the specific branch we're looking for as
                    //   well as the wildcard branch.
                    nextMatchingScopes.push(matchingScope[scopeComponent]);
                    nextMatchingScopes.push(matchingScope["*"]);
                }
            }
            matchingScopes = nextMatchingScopes;
        }
        // Filter out the trees which we didn't need to finish browsing
        const matchingPermissions: Permission[] = <Permission[]>(
            matchingScopes.filter((elem) => elem instanceof Permission)
        );
        // Sort the list of permissions so the highest priority one comes first
        matchingPermissions.sort((a, b) => a.compare(b));
        // Loop through the list of permissions until we get to one that has
        //   an explicit allow/deny value.
        for (const permission of matchingPermissions) {
            if (permission.getState() !== PermissionState.NONE) {
                return permission.getState();
            }
        }
        // If the tree did not contain a specific allow or deny for the
        // permission we are looking for, return none.
        return PermissionState.NONE;
    }

    /**
     * Getter for object which should be serialized by JSON.stringify().
     *   It is not recommended you use this function outside JSON.stringify().
     * @returns The inner tree structure used by this PermissionTree.
     */
    public toJSON(): PermissionTreeDef {
        return this.tree;
    }
}

export { PermissionTree };
