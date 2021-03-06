import { Permission } from "./classes/Permission";
import { PermissionScope } from "./classes/PermissionScope";
import { PermissionTree } from "./classes/PermissionTree";
import { PermissionTreeStack } from "./classes/PermissionTreeStack";
import { PermissionState } from "./classes/PermissionState";
import { globalStack, formatScope, assertPermission } from "./PermissionTools";

/* No code belongs in this file other than imports/exports. */

export {
    Permission,
    PermissionScope,
    PermissionState,
    PermissionTree,
    PermissionTreeStack,
    globalStack,
    formatScope,
    assertPermission,
};
