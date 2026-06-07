insert into notification_types (key, name, description)
values
  ('LOW_STOCK', 'Stock bajo', 'Inventario por debajo del mínimo configurado'),
  ('EXPIRING_LOT', 'Lote por caducar', 'Un lote se aproxima a su caducidad'),
  ('TRANSFER_SENT', 'Transferencia enviada', 'Una transferencia fue enviada'),
  ('TRANSFER_RECEIVED', 'Transferencia recibida', 'Una transferencia fue recibida'),
  ('TRANSFER_DIFFERENCE', 'Diferencia en transferencia', 'La recepción tiene diferencias'),
  ('CASH_NOT_CLOSED', 'Caja sin cerrar', 'Una caja permanece abierta'),
  ('HIGH_LOSS', 'Merma alta', 'Se detectó una merma elevada'),
  ('LOW_SALES', 'Ventas bajas', 'Las ventas están por debajo del umbral'),
  ('ORGANIZATION_SUSPENDED', 'Organización suspendida', 'La organización fue suspendida')
on conflict (key) do update
set name = excluded.name,
    description = excluded.description;
