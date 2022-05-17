/**
 * PermissionStates are almost just a true/false value, however they also
 *   have a third state, NONE, which means to inherit its parent. This is
 *   ignored and defaults to DENY in PermissionTrees, however may be useful
 *   in PermissionTreeStacks.
 */
enum PermissionState {
    NONE = -1,
    ALLOW = 0,
    DENY = 1,
}

export { PermissionState };
