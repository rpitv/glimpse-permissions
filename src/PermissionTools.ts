import { PermissionTreeStack } from "./classes/PermissionTreeStack";
import { PermissionState } from "./classes/PermissionState";
import { PermissionScope } from "./classes/PermissionScope";
import { AccessDeniedError } from "./classes/AccessDeniedError";

/**
 * A global PermissionTreeStack which can be used in applications
 */
const globalStack = new PermissionTreeStack();

/**
 * Format a string with variables in it. Designed for use with PermissionScope strings, however
 *   any string will work.
 * @param scope Scope to format. Variable locations are marked within this scope by a dollar
 *   sign ("$") followed by the variable number (one-indexed). As an example, $2 would be
 *   replaced by the second variable passed to this method (not including the scope itself). If
 *   the string contains more variable placeholders than passed, the excess will remain as-is.
 * @param vars Variables to be inserted into the string. Any variables are valid, but non-string
 *   variables will be stringified in the process (via toString()). Any instance of "$no" in the
 *   string, where "no" is an integer greater than 0, will be replaced by the corresponding
 *   variable passed here. If a variable is passed but no placeholder exists for it, nothing
 *   will happen to that placeholder. Similarly, if a placeholder exists for a variable but not
 *   enough variables were passed, nothing will happen to that placeholder. No more than 9 variables
 *   should be passed, or else behavior is undefined.
 * @returns The formatted string.
 */
function formatScope(scope: string, ...vars: any[]): string;
/**
 * Format a PermissionScope with variables in it.
 * @param scope Scope to format. This parameter is not modified in place. Instead, a new
 *   instance of PermissionScope is returned. Variable locations are marked within this scope
 *   by a dollar sign ("$") followed by the variable number (one-indexed). As an example, $2
 *   would be replaced by the second variable passed to this method (not including the scope
 *   itself). If the PermissionScope contains more variable placeholders than passed, the excess
 *   will remain as-is.
 * @param vars Variables to be inserted into the scope. Any variables are valid, but
 *   non-string variables will be stringified in the process (via toString()). Any instance of
 *   "$no" in the string, where "no" is an integer greater than 0, will be replaced by the
 *   corresponding variable passed here. If a variable is passed but no placeholder exists for
 *   it, nothing will happen to that placeholder. Similarly, if a placeholder exists for a
 *   variable but not enough variables were passed, nothing will happen to that placeholder. No more
 *    than 9 variables should be passed, or else behavior is undefined.
 * @returns A new, updated PermissionScope. The returned value is completely disconnected from
 *   the scope that was passed, so modifications to one will not change the other.
 */
function formatScope(scope: PermissionScope, ...vars: any[]): PermissionScope;
function formatScope(scope: string | PermissionScope, ...vars: any[]): string | PermissionScope {
    let scopeStr = scope;
    if (scopeStr instanceof PermissionScope) {
        scopeStr = scope.toString();
    }

    for (let i = 0; i < vars.length; i++) {
        const searchStr = new RegExp("\\$" + (i + 1), "g");
        scopeStr = scopeStr.replace(searchStr, vars[i]);
    }

    if (scope instanceof PermissionScope) {
        return new PermissionScope(scopeStr);
    } else {
        return scopeStr;
    }
}

/**
 * Assert that the global PermissionTreeStack evaluates a given PermissionScope to ALLOW. If not,
 *   an error is thrown.
 * @param scope String of the PermissionScope to assert permission for. This can also be an
 *   unformatted string, and you may pass variables in after this.
 * @param args Arguments to insert into the unformatted scope, or just don't pass any arguments if
 *   the scope string is already formatted.
 * @see formatScope
 */
function assertPermission(scope: string, ...args: any[]): void;
/**
 * Assert that the global PermissionTreeStack evaluates a given PermissionScope to ALLOW. If not,
 *   an error is thrown.
 * @param scope PermissionScope to assert permission for. This can also be an unformatted
 *   PermissionScope, and you may pass variables in after this.
 * @param args Arguments to insert into the unformatted scope, or just don't pass any arguments if
 *   the scope string is already formatted.
 * @see formatScope
 */
function assertPermission(scope: PermissionScope, ...args: any[]): void;
function assertPermission(scope: string | PermissionScope, ...args: any[]): void {
    scope = formatScope(<PermissionScope>scope, ...args);
    if (globalStack.evaluate(scope) !== PermissionState.ALLOW) {
        throw new AccessDeniedError(scope);
    }
}

export { globalStack, assertPermission, formatScope };
