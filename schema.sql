-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create categories table
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  color text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create transactions table
create table transactions (
  id uuid primary key default uuid_generate_v4(),
  amount decimal not null,
  description text not null,
  date date not null,
  category_id uuid references categories(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default categories
insert into categories (name, color) values
  ('Food', '#FF5733'),
  ('Transportation', '#33FF57'),
  ('Entertainment', '#3357FF'),
  ('Housing', '#FF33F6'),
  ('Utilities', '#33FFF6');

-- Create row level security policies
alter table categories enable row level security;
alter table transactions enable row level security;

-- Create policies for authenticated users
create policy "Enable all access for authenticated users" on categories
  for all using (auth.role() = 'authenticated');

create policy "Enable all access for authenticated users" on transactions
  for all using (auth.role() = 'authenticated');

-- Create indexes for better performance
create index idx_transactions_date on transactions(date);
create index idx_transactions_category on transactions(category_id);

-- Create view for monthly summaries
create view monthly_summaries as
select 
  date_trunc('month', date) as month,
  category_id,
  sum(amount) as total_amount,
  count(*) as transaction_count
from transactions
group by date_trunc('month', date), category_id;