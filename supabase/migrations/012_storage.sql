insert into storage.buckets (id, name, public)
values
  ('purchase-attachments', 'purchase-attachments', false),
  ('transfer-attachments', 'transfer-attachments', false),
  ('daily-closure-attachments', 'daily-closure-attachments', false),
  ('transformation-attachments', 'transformation-attachments', false)
on conflict (id) do nothing;


-- Política de lectura
create policy "storage_select_org"
on storage.objects
for select
using (
  bucket_id in (
    'purchase-attachments',
    'transfer-attachments',
    'daily-closure-attachments',
    'transformation-attachments'
  )
  and (
    is_platform_admin()
    or is_org_member(storage_org_id_from_path(name))
  )
);


--Política escritura
create policy "storage_insert_org"
on storage.objects
for insert
with check (
  bucket_id in (
    'purchase-attachments',
    'transfer-attachments',
    'daily-closure-attachments',
    'transformation-attachments'
  )
  and can_write_organization(
    storage_org_id_from_path(name)
  )
);

--Política borrado
create policy "storage_delete_owner"
on storage.objects
for delete
using (
  is_platform_admin()
  or is_org_owner(
      storage_org_id_from_path(name)
  )
);


