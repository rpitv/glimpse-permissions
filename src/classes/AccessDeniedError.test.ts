import { AccessDeniedError } from "./AccessDeniedError";
import { PermissionScope } from "./PermissionScope";

it("accepts strings as an argument", () => {
    let e = new AccessDeniedError("this:is:a_scope");
    expect(e.message).toEqual("Missing required permission for scope this:is:a_scope");
    e = new AccessDeniedError("testing 123");
    expect(e.message).toEqual("Missing required permission for scope testing 123");
});

it("accepts PermissionScopes as an argument", () => {
    let e = new AccessDeniedError(new PermissionScope("this:is:a_scope"));
    expect(e.message).toEqual("Missing required permission for scope this:is:a_scope");
    e = new AccessDeniedError(new PermissionScope("testing 123"));
    expect(e.message).toEqual("Missing required permission for scope testing 123");
});

it("accepts undefined/empty strings as an argument", () => {
    let e = new AccessDeniedError("");
    expect(e.message).toEqual("Missing required permissions");
    e = new AccessDeniedError();
    expect(e.message).toEqual("Missing required permissions");
    e = new AccessDeniedError(new PermissionScope(""));
    expect(e.message).toEqual("Missing required permission for scope ");
});

it("has the correct name", () => {
    expect(new AccessDeniedError().name).toEqual("AccessDeniedError");
});
