create policy "profiles_select_self_or_platform"
on profiles for select
using (id = auth.uid() or is_platform_admin());

create policy "profiles_update_self"
on profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "platform_admins_select_platform"
on platform_admins for select
using (is_platform_admin());

create policy "platform_admins_manage_root"
on platform_admins for all
using (is_root())
with check (is_root());

create policy "organizations_select_member_or_platform"
on organizations for select
using (is_platform_admin() or is_org_member(id));

create policy "organizations_insert_platform"
on organizations for insert
with check (is_platform_admin());

create policy "organizations_update_platform_or_owner"
on organizations for update
using (is_platform_admin() or is_org_owner(id))
with check (is_platform_admin() or is_org_owner(id));

create policy "org_members_select_member_or_platform"
on organization_members for select
using (is_platform_admin() or is_org_member(organization_id));

create policy "org_members_insert_inviter"
on organization_members for insert
with check (
  is_platform_admin()
  or can_invite_to_organization(organization_id)
);

create policy "org_members_update_owner_or_employee_update"
on organization_members for update
using (
  is_platform_admin()
  or is_org_owner(organization_id)
  or has_permission(organization_id, 'employee.update')
)
with check (
  is_platform_admin()
  or is_org_owner(organization_id)
  or has_permission(organization_id, 'employee.update')
);