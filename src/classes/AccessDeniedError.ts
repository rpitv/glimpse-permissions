import { PermissionScope } from "./PermissionScope";

class AccessDeniedError extends Error {
    /**
     * Create a new AccessDeniedError. Error message is generalized for multiple permissions
     *   (i.e., "Missing required permissions").
     */
    constructor();
    /**
     * Create a new AccessDeniedError
     * @param scope Scope which was requested, but the user did not have permission for.
     */
    constructor(scope: string);
    /**
     * Create a new AccessDeniedError
     * @param scope Scope which was requested, but the user did not have permission for.
     */
    constructor(scope: PermissionScope);
    constructor(scope?: string | PermissionScope) {
        if (!scope) {
            super("Missing required permissions");
        } else {
            super(`Missing required permission for scope ${scope.toString()}`);
        }
        this.name = "AccessDeniedError";
    }
}

export { AccessDeniedError };
