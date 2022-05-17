import { PermissionTree } from "./PermissionTree";
import { PermissionScope } from "./PermissionScope";
import { PermissionState } from "./PermissionState";

/**
 * A PermissionTreeStack is a utility to stack multiple trees on
 *   top of each other. This allows for the combining of multiple
 *   trees without physically combining them into a single tree (as
 *   this could result in conflicts). Trees maintain the order they were
 *   originally added in. Starting at index 0, whenever a PermissionScope
 *   matches a tree in the stack, it returns that tree's value. If it does
 *   not match, then the next index is tried.
 */
class PermissionTreeStack {
    /**
     * Internal array of PermissionTrees. The order in which they were inserted
     *   should be maintained.
     * @private
     */
    private trees: PermissionTree[] = [];

    /**
     * Create a new PermissionTreeStack
     * @param permissionTrees List of PermissionTrees to initially add to this
     *   PermissionTreeStack. Can be empty in order to initialize an empty
     *   stack. The order in which they are provided is maintained, and the last
     *   Tree passed is placed at the top of the stack.
     */
    public constructor(...permissionTrees: PermissionTree[]) {
        this.push(...permissionTrees);
    }

    /**
     * Push one or more PermissionTrees onto the stack. These PermissionTrees
     *   are tacked onto the start of the PermissionTreeStack, and the last tree
     *   passed will be placed at the top of the stack. It can be removed via
     *   {@link #pop()}.
     * @param permissionTrees Zero or more PermissionTrees to add to the top of
     *   the stack. Pushing zero PermissionTrees will do nothing. The last
     *   PermissionTree is added to the top of the stack.
     */
    public push(...permissionTrees: PermissionTree[]): void {
        this.trees.push(...permissionTrees);
    }

    /**
     * Pop a PermissionTree off of the PermissionTreeStack. The Tree at the top
     *   of the stack is popped off. I.e., the last PermissionTree that was
     *   added will be popped off.
     * @returns The PermissionTree that was popped off, or undefined if the
     *   stack is empty.
     */
    public pop(): PermissionTree | undefined {
        return this.trees.pop();
    }

    /**
     * Peek at the end of the PermissionTreeStack without popping the value off.
     *   This returns the same value as {@link #pop()} but without modifying
     *   the tree.
     * @returns The PermissionTree that was peeked, or undefined if the
     *   stack is empty.
     */
    public peek(): PermissionTree | undefined {
        if (this.trees.length === 0) {
            return undefined;
        }
        return this.trees[this.trees.length - 1];
    }

    /**
     * Evaluate the state of the PermissionTree at the top of the stack to see
     *   whether a passed PermissionScope is handled by the tree, and how to
     *   handle it if so. If the tree at the top of the stack has no state for
     *   the given scope (i.e., evaluate() on the tree returns NONE), then the
     *   next tree in the stack is tried. If none of the trees in the stack have
     *   a state for the given scope, then this returns NONE.
     * @param scope The scope to search for in a stringified form.
     * @returns The returned PermissionState value returned from evaluate() on
     *   the tree on the top of the stack. If the tree on the top of the stack
     *   returns NONE, then the next tree in the stack is tried. If none of the
     *   trees in the stack have a state for the given scope, then this returns
     *   NONE.
     */
    public evaluate(scope: string): PermissionState;
    /**
     * Evaluate the state of the PermissionTree at the top of the stack to see
     *   whether a passed PermissionScope is handled by the tree, and how to
     *   handle it if so. If the tree at the top of the stack has no state for
     *   the given scope (i.e., evaluate() on the tree returns NONE), then the
     *   next tree in the stack is tried. If none of the trees in the stack have
     *   a state for the given scope, then this returns NONE.
     * @param scope The scope to search for.
     * @returns The PermissionState value returned from evaluate() on the tree
     *   on the top of the stack. If the tree on the top of the stack returns
     *   NONE, then the next tree in the stack is tried. If none of the trees
     *   in the stack have a state for the given scope, then this returns NONE.
     */
    public evaluate(scope: PermissionScope): PermissionState;
    public evaluate(scope: PermissionScope | string): PermissionState {
        if (typeof scope === "string") {
            scope = new PermissionScope(scope);
        }
        for (const tree of this.trees) {
            const treeState = tree.evaluate(scope);
            if (treeState !== PermissionState.NONE) {
                return treeState;
            }
        }
        return PermissionState.NONE;
    }
}

export { PermissionTreeStack };
