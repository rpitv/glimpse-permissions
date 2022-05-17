/**
 * A PermissionScope is how permissions in Glimpse are limited to a specific
 *   area of an application/service. They are paired with PermissionStates via
 *   the Permission class. PermissionScopes are a tiered namespacing system
 *   with each tier separated by colons (":").
 *
 *   Each tier is either a string literal or an asterisk ("*") to signify that
 *   any string is valid in that specific namespace tier. Asterisks cannot be
 *   combined with string literals, e.g. "*substring*". This will be interpreted
 *   literally.
 */
class PermissionScope {
    /**
     * This is used internally in this class to make swapping out the separating
     *   character easier, if ever desired. Use this in your systems if you
     *   want to future-proof against that.
     */
    public static readonly SEPARATOR = ":";
    /**
     * This is used internally in the class to make swapping out the wildcard
     *   character easier, if ever desired. Use this in your systems if you
     *   want to future-proof against that.
     */
    public static readonly WILDCARD = "*";
    /**
     * List of tiers of this Scope, with index 0 being the least specific and
     *   tier length - 1 being the most specific.
     * @private
     */
    private readonly scopeArr: string[];
    /**
     * Total number of wildcards in this Scope. This is just a cache and can
     *   be manually calculated by checking how many strings in scopeArr
     *   are equal to "*", however this shouldn't be necessary.
     * @private
     */
    private wildcardCount = 0;

    /**
     * Create a new PermissionScope
     * @param scope String version of this PermissionScope, where each tier is
     *   split by a colon (":"). Each tier may also be a sole asterisk ("*") to
     *   represent a wildcard. Wildcards cannot be combined with other strings
     *   in the same tier. Can be omitted to initialize an empty
     *   PermissionScope.
     */
    public constructor(scope?: string) {
        if (scope) {
            this.scopeArr = scope.split(PermissionScope.SEPARATOR);
        } else {
            this.scopeArr = [];
        }
        for (const scopeComponent of this.scopeArr) {
            if (scopeComponent === PermissionScope.WILDCARD) {
                this.wildcardCount++;
            }
        }
    }

    /**
     * Create a copy of this PermissionScope. Modifications to the copy will not
     *   modify this version of the PermissionScope, and vice versa.
     * @returns A PermissionScope with the same values as this one. The internal
     *   structure is deeply copied.
     */
    public copy(): PermissionScope {
        const newPermissionScope = new PermissionScope();
        newPermissionScope.pushTier(this);
        return newPermissionScope;
    }

    /**
     * Get a copy of this PermissionScope's internal array. This is the best
     *   way to get direct access to the individual tiers of this
     *   PermissionScope.
     *
     *   This is a copy of the internal array, so if possible, try alternative
     *   methods first.
     * @returns An array of strings, where each string is one tier. No string
     *   will contain the colon character (":"), as that is used as the
     *   separator between tiers.
     */
    public toArray(): string[] {
        return [...this.scopeArr];
    }

    /**
     * Get the tier at the specified depth, if it exists. Depth is zero-indexed.
     *   If this scope is not as deep/specific as the passed number, then
     *   undefined will be returned. E.g., in "alpha:beta:charlie", at(1) will
     *   return "beta".
     * @see #size
     * @param depth Depth to retrieve. Must be a number between -this.size and
     *   this.size. Any non-integers will be rounded down.
     * @returns If the passed number is greater than or equal to 0 but less than
     *   the size of this scope, the tier at the specified depth from the
     *   top/start is returned. If number is less than 0, the absolute value of
     *   the passed number is subtracted from the length of the scope. Anything
     *   out of bounds will return undefined.
     */
    public at(depth: number): string | undefined {
        depth = Math.floor(depth);
        let index;
        if (depth >= 0) {
            index = depth;
        } else {
            index = this.scopeArr.length + depth;
        }
        // Intentionally not relying on an out-of-bounds access returning
        //   undefined, as a precaution against future changes to runtime.
        if (index < 0 || index >= this.scopeArr.length) {
            return undefined;
        }
        return this.scopeArr[index];
    }

    /**
     * Getter for this scope's size in tiers. If you'd like to think about it
     *   another way, this is equivalent to the number of colons passed in the
     *   constructor minus one (ignoring pushScope() and popScope()).
     * @returns The size of this PermissionScope in terms of tiers.
     */
    public get size(): number {
        return this.scopeArr.length;
    }

    /**
     * Get iterator for this PermissionScope to iterate over the different
     *   levels of the scope, starting with the first item in the array,
     *   i.e. the highest level.
     * @returns An IterableIterator<string> which can be used to iterate over
     *   this PermissionScope's tiers.
     */
    public [Symbol.iterator](): IterableIterator<string> {
        return this.scopeArr.values();
    }

    /**
     * Get the total number of wildcards used in this PermissionScope.
     * @returns The total number of wildcards used in this PermissionScope.
     *   A wildcard is considered any tier which is only one character in length
     *   and contains the character "*".
     */
    public getWildcardCount(): number {
        return this.wildcardCount;
    }

    /**
     * Convert this PermissionScope back into a string, joining each tier
     *   back together with colons (":").
     * @returns A single string representing this PermissionScope. If you
     *   did not use {@link pushTier} or {@link popTier}, then this should
     *   be equal to what was passed to the constructor. You can pass this
     *   back to the constructor at any time to recreate the PermissionScope
     *   object.
     */
    public toString(): string {
        return this.scopeArr.join(PermissionScope.SEPARATOR);
    }

    /**
     * Push a tier, or multiple tiers, onto the end of this PermissionScope. As
     *   an example, if the PermissionScope is currently "abc:xyz" and you push
     *   "123", then the PermissionScope will be updated to "abc:xyz:123".
     *   Similarly, if "123:789" is pushed, then the result is
     *   "abc:xyz:123:789".
     * @param tier String containing the tier or tiers to push onto the
     *   PermissionScope. The string is split at colons (":") in order to
     *   separate into tiers. If the string doesn't contain any colons, then
     *   a single tier is pushed onto the end of the PermissionScope. Wildcards
     *   are also allowed.
     */
    public pushTier(tier: string): void;
    /**
     * Push a tier, or multiple tiers, onto the end of this PermissionScope. As
     *   an example, if the PermissionScope is currently "abc:xyz" and you push
     *   "123", then the PermissionScope will be updated to "abc:xyz:123".
     *   Similarly, if "123:789" is pushed, then the result is
     *   "abc:xyz:123:789".
     * @param tier PermissionScope to push onto the end of this PermissionScope.
     *   All PermissionScopes are valid.
     */
    public pushTier(tier: PermissionScope): void;
    public pushTier(tier: string | PermissionScope): void {
        let tierArr: string[];
        if (tier instanceof PermissionScope) {
            tierArr = tier.toArray();
        } else {
            tierArr = tier.split(PermissionScope.SEPARATOR);
        }
        for (const scopeComponent of tierArr) {
            if (scopeComponent === PermissionScope.WILDCARD) {
                this.wildcardCount++;
            }
        }
        this.scopeArr.push(...tierArr);
    }

    /**
     * Pop a tier off the end of this PermissionScope, if it has one. If the
     *   PermissionScope is empty, then undefined is returned. The
     *   PermissionScope is considered empty if the size is equal to zero. As
     *   an example, calling this method on "abc:xyz:123" will result in a
     *   PermissionScope with the value of "abc:xyz".
     * @returns The tier that was popped off the end of the PermissionScope, or
     *   undefined if the PermissionScope is already empty.
     */
    public popTier(): string | undefined {
        const poppedValue = this.scopeArr.pop();
        if (poppedValue === PermissionScope.WILDCARD) {
            this.wildcardCount--;
        }
        return poppedValue;
    }

    /**
     * Check whether this PermissionScope's scope includes the scope of the
     *   passed PermissionScope. Scope A is considered to be contained within
     *   scope B if scope A and scope B's tiers are all equal, or if any of
     *   scope B's tiers are wildcards ("*"). In the event that scope B's last
     *   tier is a wildcard, all lower tiers are also included (e.g.,
     *   the scope "sample:*" also contains "sample:*:*", "sample:*:*:*", etc.).
     * @param scope The scope to search for in this scope.
     * @returns True if this scope also covers the passed scope, or false
     *   otherwise.
     */
    public includes(scope: PermissionScope): boolean;
    /**
     * Check whether this PermissionScope's scope includes the scope of the
     *   passed string's scope. The passed string is converted into a
     *   PermissionScope. Scope A is considered to be contained within
     *   scope B if scope A and scope B's tiers are all equal, or if any of
     *   scope B's tiers are wildcards ("*"). In the event that scope B's last
     *   tier is a wildcard, all lower tiers are also included (e.g.,
     *   the scope "sample:*" also contains "sample:*:*", "sample:*:*:*", etc.).
     * @param scope The scope to search for in this scope.
     * @returns True if this scope also covers the passed scope, or false
     *   otherwise.
     */
    public includes(scope: string): boolean;
    public includes(that: PermissionScope | string): boolean {
        if (typeof that === "string") {
            that = new PermissionScope(that);
        }
        // If this scope is more specific than the one passed,
        //   then this scope does not include the passed scope by default.
        if (this.scopeArr.length > that.scopeArr.length) {
            return false;
        }
        for (let i = 0; i < that.scopeArr.length; i++) {
            const thisScopeLevel = this.scopeArr[i];
            const thatScopeLevel = that.scopeArr[i];

            // If this scope has a wildcard at the current level then it's
            //   always going to include everything at this level and deeper.
            if (thisScopeLevel === PermissionScope.WILDCARD) {
                if (i == this.scopeArr.length - 1) {
                    return true;
                }
                continue;
            }
            // If this scope does not have a wildcard here and doesn't equal the
            //   passed scope at the current level, then this scope will never
            //   cover the passed scope.
            if (thisScopeLevel !== thatScopeLevel) {
                return false;
            }
        }
        // If all scope levels matched then this scope includes the passed scope
        return true;
    }

    /**
     * Compare this PermissionScope against another PermissionScope to check
     *   which has a higher priority in the event of conflicts. PermissionScope
     *   conflicts are handled in the following order:
     *   - More specific PermissionScopes are higher priority than less specific
     *     PermissionScope. I.e., the more colons in your PermissionScope, the
     *     more specific it is.
     *   - PermissionScopes with fewer wildcards are prioritized over
     *     PermissionScopes with more wildcards, regardless of the position
     *     of those wildcards.
     *   - If all else is the same, PermissionScopes maintain their original
     *     order (this method returns 0).
     *
     * @param that PermissionScope which you want to compare against.
     * @returns number < 0 if this comes before the passed PermissionScope, 0 if
     *   they are equal, or number > 0 if the passed PermissionScope comes
     *   before this.
     */
    public compare(that: PermissionScope): number {
        // If this is not the same specificity as that, then whichever one
        //   is more specific should come first.
        if (this.scopeArr.length !== that.scopeArr.length) {
            return that.scopeArr.length - this.scopeArr.length;
        }
        // If this does not have the same number of wildcards as that, then
        //   whichever one has fewer wildcards should come first.
        if (this.getWildcardCount() !== that.getWildcardCount()) {
            return this.getWildcardCount() - that.getWildcardCount();
        }
        // Scopes are identical or otherwise equal in priority. Their
        //   original order should be maintained.
        return 0;
    }
}

export { PermissionScope };
