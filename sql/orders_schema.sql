-- Create orders table for invoice management
create table orders (
  id uuid default uuid_generate_v4() primary key,
  invoice_number text unique not null,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  customer_address text,
  service_name text not null,
  service_price numeric not null,
  quantity integer default 1,
  discount numeric default 0,
  tax_percent numeric default 0,
  total_amount numeric not null,
  status text default 'pending',
  notes text,
  created_at timestamptz default now(),
  paid_at timestamptz,
  user_id uuid references profiles(id)
);

-- Enable RLS
alter table orders enable row level security;

-- Policies
create policy "Orders are viewable by authenticated users" on orders
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert orders" on orders
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update orders" on orders
  for update using (auth.role() = 'authenticated');

create policy "Authenticated users can delete orders" on orders
  for delete using (auth.role() = 'authenticated');

-- Create index for faster queries
create index orders_created_at_idx on orders(created_at desc);
create index orders_status_idx on orders(status);
