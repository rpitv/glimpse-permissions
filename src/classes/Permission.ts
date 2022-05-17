import { PermissionScope } from "./PermissionScope";
import { PermissionState } from "./PermissionState";

/**
 * Permissions in Glimpse are simply a pair of a PermissionScope and
 *   PermissionState. They can be added to PermissionTrees to combine
 *   multiple permissions into a single grouping that can be used for
 *   users or groups.
 */
class Permission {
    /**
     * Scope which this Permission applies to
     * @private
     */
    private readonly scope: PermissionScope;
    /**
     * The state of this permission, i.e. "ALLOW", "DENY", or "NONE".
     * @private
     */
    private readonly state: PermissionState;

    /**
     * Create a new Permission
     * @param scope Scope which this permission applies to
     * @param state Whether this permission is an allowing permission or denying
     *   permission.
     */
    public constructor(scope: string, state: boolean);
    /**
     * Create a new Permission
     * @param scope Scope which this permission applies to
     * @param state The state of your new Permission. "NONE" is the default
     *   behavior, but may be useful when using PermissionTreeStacks.
     */
    public constructor(scope: string, state: PermissionState);
    /**
     * Create a new Permission
     * @param scope Scope which this permission applies to
     * @param state Whether this permission is an allowing permission or denying
     *   permission.
     */
    public constructor(scope: PermissionScope, state: boolean);
    /**
     * Create a new Permission
     * @param scope Scope which this permission applies to
     * @param state The state of your new Permission. "NONE" is the default
     *   behavior, but may be useful when using PermissionTreeStacks.
     */
    public constructor(scope: PermissionScope, state: PermissionState);
    public constructor(scope: string | PermissionScope, state: boolean | PermissionState) {
        if (typeof scope === "string") {
            this.scope = new PermissionScope(scope);
        } else {
            this.scope = scope;
        }
        if (typeof state === "boolean") {
            this.state = state ? PermissionState.ALLOW : PermissionState.DENY;
        } else {
            this.state = state;
        }
    }

    /**
     * Stringify the Permission in the form of "scope = state"
     * @returns The stringified Permission, joining the scope with
     *   the state's numerical value, separated by " = ".
     */
    public toString(): string {
        return this.scope + " = " + this.state.toString();
    }

    /**
     * Get the PermissionState value associated with this Permission.
     * @returns the associated PermissionState value.
     */
    public getState(): PermissionState {
        return this.state;
    }

    /**
     * Get the scope which this Permission applies to.
     * @returns The scope which this Permission applies to.
     */
    public getScope(): PermissionScope {
        return this.scope.copy();
    }

    /**
     * Compare this Permission against another Permission to check which has
     *   a higher priority in the event of conflicts. Permission conflicts are
     *   handled in the following order:
     *   - More specific permission scopes are higher priority than less
     *     specific permission scopes. I.e., the more colons in your permission
     *     scope, the more specific it is.
     *   - Permission scopes with fewer wildcards are prioritized over
     *     permission scopes with more wildcards, regardless of the position
     *     of those wildcards.
     *   - DENY states are prioritized over ALLOW states, and ALLOW states are
     *     prioritized over NONE states.
     *   - If all else is the same, permissions maintain their original order
     *     (this method returns 0).
     *
     * @param that Permission which you want to compare against.
     * @returns number < 0 if this comes before the passed permission, 0 if
     *   they are equal, or number > 0 if the passed permission comes before
     *   this.
     */
    public compare(that: Permission): number {
        // Compare the scopes and return if one of them is more important than
        //   the other.
        const scopeCompare = this.getScope().compare(that.getScope());
        if (scopeCompare !== 0) {
            return scopeCompare;
        }
        // If this does not have the same state as that, then whichever one
        //   has the more important state should come first.
        if (this.getState() !== that.getState()) {
            return that.getState() - this.getState();
        }
        // If this and that have the same specificity scope & same state,
        //   then ordering is irrelevant.
        return 0;
    }
}

export { Permission };
