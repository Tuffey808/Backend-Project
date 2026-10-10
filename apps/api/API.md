# Portal API

Base URL (local): `http://localhost:3001`

## Portal auth

`Authorization: Bearer <accessToken>` after email login/register.

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/api/auth/register` | public | Creates CUSTOMER + profile |
| POST | `/api/auth/login` | public | Email → `{ accessToken, user }`; mobile → `{ session_id, ... }` |
| GET/PATCH | `/api/auth/me` | JWT | Current user + profile |

## Mobile-compatible routes

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/api/register` | public | `{ full_name, mobile_number, password, confirm_password }` |
| POST | `/api/auth/renew-token` | JWT | |
| POST | `/api/deleteuser` | JWT | `{ id }` numericId |
| GET | `/api/getCustomer` | JWT | Paginated profile |
| POST | `/api/getProducts` | public | Catalog |
| GET | `/api/products/search/` | public | `?product=&category=` |
| POST | `/api/getCategories` | public | Categories |
| GET/POST/DELETE | `/api/cart` | JWT* | GET allows anonymous empty cart |
| GET/POST/DELETE | `/api/address` | JWT | |
| GET/POST | `/api/order` | JWT | Create from cart |
| POST | `/api/discount` | JWT | `{ sale_order_id, code }` |
| POST | `/api/cancelorder` | JWT | |
| POST | `/api/finalorder` | JWT | |
| POST | `/api/payment_url` | JWT | Tap prepaid / COD / token confirm |
| GET/POST/DELETE | `/api/favorites` | JWT | |
| GET/POST/DELETE | `/api/card` | JWT | Masked saved cards |
| POST | `/api/payment/tap/webhook` | public | Tap webhook |
| GET | `/api/payment/tap/return/order/:id` | public | Mobile return |

## Admin / portal resources

| Method | Path | Auth |
|--------|------|------|
| GET/POST | `/api/categories` | public / admin |
| GET/POST/PATCH/DELETE | `/api/products` | optional / admin |
| GET/POST/PATCH/DELETE | `/api/contracts` | JWT / admin |
| GET | `/api/customers` | admin |
