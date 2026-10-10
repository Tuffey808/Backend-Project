const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CUSTOMER' | 'VENDOR';
  phone?: string | null;
  customer?: {
    street?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
    country?: string | null;
  } | null;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type Category = {
  id: string;
  numericId: number;
  name: string;
  nameAr?: string | null;
  imageUrl?: string | null;
  _count?: { products: number };
};

export type Contract = {
  id: string;
  title: string;
  titleAr?: string | null;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
  terms?: string | null;
  customerId?: string | null;
  vendorId?: string | null;
  customer?: { id: string; name: string; email: string } | null;
  vendor?: { id: string; name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
};

export type ContractPayload = {
  title: string;
  titleAr?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  terms?: string;
  customerId?: string;
  vendorId?: string;
};

export type ProductPayload = {
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  price: number;
  status?: string;
  sku?: string;
  qtyAvailable?: number;
  imageUrl?: string;
  categoryId?: string;
  images?: Array<{ url: string; name?: string; sortOrder?: number }>;
  options?: Array<{
    kind: 'SIZE' | 'COLOR' | 'DIMENSION';
    name: string;
    nameAr?: string;
    color?: string;
    sortOrder?: number;
  }>;
};

function authHeaders(token?: string | null): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function parse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message || data.error || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
  });
  return parse<AuthResponse>(res);
}

export async function register(payload: {
  email: string;
  password: string;
  name: string;
  phone?: string;
}) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parse<AuthResponse>(res);
}

export async function getMe(token: string) {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: authHeaders(token),
  });
  return parse<AuthUser>(res);
}

export async function getProducts(token?: string | null) {
  const res = await fetch(`${API_URL}/api/products`, {
    headers: authHeaders(token),
  });
  return parse<Array<Record<string, unknown>>>(res);
}

export async function createProduct(token: string, body: ProductPayload) {
  const res = await fetch(`${API_URL}/api/products`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  return parse<Record<string, unknown>>(res);
}

export async function getProduct(token: string | null | undefined, id: string) {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    headers: authHeaders(token),
  });
  return parse<Record<string, unknown>>(res);
}

export async function updateProduct(
  token: string,
  id: string,
  body: ProductPayload,
) {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  return parse<Record<string, unknown>>(res);
}

export async function deleteProduct(token: string, id: string) {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  return parse<{ success: boolean }>(res);
}

export async function uploadImage(token: string, file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_URL}/api/uploads`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  return parse<{ url: string }>(res);
}

export async function uploadImages(token: string, files: File[]) {
  const form = new FormData();
  for (const file of files) {
    form.append('files', file);
  }
  const res = await fetch(`${API_URL}/api/uploads/batch`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  return parse<{ urls: string[] }>(res);
}

export async function getCategories() {
  const res = await fetch(`${API_URL}/api/categories`);
  return parse<Category[]>(res);
}

export async function createCategory(
  token: string,
  body: { name: string; nameAr?: string; imageUrl?: string },
) {
  const res = await fetch(`${API_URL}/api/categories`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  return parse<Category>(res);
}

export async function getContracts(token: string) {
  const res = await fetch(`${API_URL}/api/contracts`, {
    headers: authHeaders(token),
  });
  return parse<Contract[]>(res);
}

export async function getContract(token: string, id: string) {
  const res = await fetch(`${API_URL}/api/contracts/${id}`, {
    headers: authHeaders(token),
  });
  return parse<Contract>(res);
}

export async function createContract(token: string, body: ContractPayload) {
  const res = await fetch(`${API_URL}/api/contracts`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  return parse<Contract>(res);
}

export async function updateContract(
  token: string,
  id: string,
  body: Partial<ContractPayload>,
) {
  const res = await fetch(`${API_URL}/api/contracts/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  return parse<Contract>(res);
}

export async function deleteContract(token: string, id: string) {
  const res = await fetch(`${API_URL}/api/contracts/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  return parse<Contract>(res);
}

export async function getCategory(id: string) {
  const res = await fetch(`${API_URL}/api/categories/${id}`);
  return parse<Category>(res);
}

export async function updateCategory(
  token: string,
  id: string,
  body: { name?: string; nameAr?: string; imageUrl?: string },
) {
  const res = await fetch(`${API_URL}/api/categories/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  return parse<Category>(res);
}

export async function getCustomers(token: string) {
  const res = await fetch(`${API_URL}/api/customers`, {
    headers: authHeaders(token),
  });
  return parse<Array<Record<string, unknown>>>(res);
}

export type AdminOrder = Record<string, unknown>;

export async function getAdminOrders(token: string) {
  const res = await fetch(`${API_URL}/api/admin/orders`, {
    headers: authHeaders(token),
  });
  return parse<AdminOrder[]>(res);
}

export async function addOrderTracking(
  token: string,
  orderId: number,
  body: { status: string; description?: string },
) {
  const res = await fetch(`${API_URL}/api/admin/orders/${orderId}/tracking`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  return parse<{ success: boolean; message: string }>(res);
}

export type AdminStats = {
  customers: number;
  vendors: number;
  products: number;
  pendingProducts: number;
  publishedProducts: number;
  orders: number;
  contracts: number;
  vendorApplications: number;
};

export type DiscountCode = {
  id: string;
  code: string;
  percentOff?: string | number | null;
  amountOff?: string | number | null;
  active: boolean;
  minOrderAmount?: string | number | null;
  maxUses?: number | null;
  usedCount?: number;
  expiresAt?: string | null;
  createdAt: string;
};

export type DiscountCodePayload = {
  code: string;
  percentOff?: number;
  amountOff?: number;
  active?: boolean;
  minOrderAmount?: number;
  maxUses?: number;
  expiresAt?: string | null;
};

export async function getDiscountCodes(token: string) {
  const res = await fetch(`${API_URL}/api/admin/discount-codes`, {
    headers: authHeaders(token),
  });
  return parse<DiscountCode[]>(res);
}

export async function createDiscountCode(token: string, body: DiscountCodePayload) {
  const res = await fetch(`${API_URL}/api/admin/discount-codes`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  return parse<DiscountCode>(res);
}

export async function updateDiscountCode(
  token: string,
  id: string,
  body: Partial<DiscountCodePayload>,
) {
  const res = await fetch(`${API_URL}/api/admin/discount-codes/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  return parse<DiscountCode>(res);
}

export async function deleteDiscountCode(token: string, id: string) {
  const res = await fetch(`${API_URL}/api/admin/discount-codes/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  return parse<DiscountCode>(res);
}

export async function getAdminStats(token: string) {
  const res = await fetch(`${API_URL}/api/admin/stats`, {
    headers: authHeaders(token),
  });
  return parse<AdminStats>(res);
}

export type VendorProfile = {
  id: string;
  storeName: string;
  storeNameAr?: string | null;
  slug: string;
  logoUrl?: string | null;
  city?: string | null;
  commissionPercent?: string | number | null;
  active: boolean;
  bankIban?: string | null;
  bankName?: string | null;
  shippingPolicy?: string | null;
  returnPolicy?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
};

export type VendorRow = {
  id: string;
  numericId: number;
  email: string;
  name: string;
  phone?: string | null;
  active: boolean;
  createdAt: string;
  vendorProfile?: VendorProfile | null;
  _count: { products: number; vendorOrders?: number };
};

export async function getAdminVendors(token: string) {
  const res = await fetch(`${API_URL}/api/admin/vendors`, {
    headers: authHeaders(token),
  });
  return parse<VendorRow[]>(res);
}

export type PendingProduct = Record<string, unknown> & {
  _id?: string;
  owner?: { id: string; name: string; email: string };
};

export async function getPendingProducts(token: string) {
  const res = await fetch(`${API_URL}/api/admin/products/pending`, {
    headers: authHeaders(token),
  });
  return parse<PendingProduct[]>(res);
}

export async function approveProduct(
  token: string,
  productId: string,
  approve: boolean,
) {
  const res = await fetch(`${API_URL}/api/admin/products/${productId}/approval`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ approve }),
  });
  return parse<{ success: boolean; message: string; status?: string }>(res);
}

export type AccountSummary = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  createdAt: string;
  customer?: {
    street?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
    country?: string | null;
  } | null;
  _count: { orders: number; addresses: number; favorites: number };
  contracts: Array<{
    id: string;
    title: string;
    status: string;
    startDate?: string | null;
    endDate?: string | null;
  }>;
};

export async function getAccountSummary(token: string) {
  const res = await fetch(`${API_URL}/api/account/summary`, {
    headers: authHeaders(token),
  });
  return parse<AccountSummary>(res);
}

export type VendorApplication = {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  category: string;
  city?: string | null;
  description?: string | null;
  commercialRegister?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
};

export async function submitVendorApplication(body: {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  category: string;
  city?: string;
  description?: string;
  commercialRegister?: string;
}) {
  const res = await fetch(`${API_URL}/api/vendor-applications`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return parse<VendorApplication>(res);
}

export async function getVendorApplications(token: string, status?: string) {
  const q = status ? `?status=${status}` : '';
  const res = await fetch(`${API_URL}/api/admin/vendor-applications${q}`, {
    headers: authHeaders(token),
  });
  return parse<VendorApplication[]>(res);
}

export async function reviewVendorApplication(
  token: string,
  id: string,
  approve: boolean,
  adminNotes?: string,
) {
  const res = await fetch(`${API_URL}/api/admin/vendor-applications/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ approve, adminNotes }),
  });
  return parse<{
    success?: boolean;
    message?: string;
    application?: VendorApplication;
    credentials?: { email: string; temporaryPassword: string };
  }>(res);
}

export async function getAdminOrder(token: string, orderId: string) {
  const res = await fetch(`${API_URL}/api/admin/orders/${orderId}`, {
    headers: authHeaders(token),
  });
  return parse<AdminOrder>(res);
}

export async function setVendorActive(
  token: string,
  userId: string,
  active: boolean,
) {
  const res = await fetch(`${API_URL}/api/admin/vendors/${userId}/active`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ active }),
  });
  return parse<Record<string, unknown>>(res);
}

export async function setVendorCommission(
  token: string,
  userId: string,
  commissionPercent: number,
) {
  const res = await fetch(`${API_URL}/api/admin/vendors/${userId}/commission`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ commissionPercent }),
  });
  return parse<VendorProfile>(res);
}

export async function getFinanceOverview(token: string) {
  const res = await fetch(`${API_URL}/api/admin/finance`, {
    headers: authHeaders(token),
  });
  return parse<{
    settings: { defaultCommissionPercent: string | number };
    gmv: number;
    orderCount: number;
    totalVendorEarnings: number;
    totalCommission: number;
    payoutsByStatus: Array<{
      status: string;
      _sum: { amount: string | number | null };
      _count: number;
    }>;
  }>(res);
}

export async function updateCommissionSettings(
  token: string,
  defaultCommissionPercent: number,
) {
  const res = await fetch(`${API_URL}/api/admin/commission-settings`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ defaultCommissionPercent }),
  });
  return parse<Record<string, unknown>>(res);
}

export async function getAdminPayouts(token: string) {
  const res = await fetch(`${API_URL}/api/admin/payouts`, {
    headers: authHeaders(token),
  });
  return parse<Array<Record<string, unknown>>>(res);
}

export async function createVendorPayout(
  token: string,
  vendorId: string,
  note?: string,
) {
  const res = await fetch(`${API_URL}/api/admin/payouts`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ vendorId, note }),
  });
  return parse<Record<string, unknown>>(res);
}

export async function updatePayoutStatus(
  token: string,
  id: string,
  status: string,
) {
  const res = await fetch(`${API_URL}/api/admin/payouts/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  });
  return parse<Record<string, unknown>>(res);
}

export async function getVendorOrders(token: string) {
  const res = await fetch(`${API_URL}/api/vendor/orders`, {
    headers: authHeaders(token),
  });
  return parse<AdminOrder[]>(res);
}

export async function updateVendorFulfillment(
  token: string,
  orderId: number,
  status: string,
  description?: string,
) {
  const res = await fetch(`${API_URL}/api/vendor/orders/${orderId}/fulfillment`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ status, description }),
  });
  return parse<{ success: boolean; message: string }>(res);
}

export async function getVendorProfile(token: string) {
  const res = await fetch(`${API_URL}/api/vendor/profile`, {
    headers: authHeaders(token),
  });
  return parse<VendorProfile>(res);
}

export async function updateVendorProfile(
  token: string,
  body: Partial<VendorProfile>,
) {
  const res = await fetch(`${API_URL}/api/vendor/profile`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  return parse<VendorProfile>(res);
}

export async function getVendorEarnings(token: string) {
  const res = await fetch(`${API_URL}/api/vendor/earnings`, {
    headers: authHeaders(token),
  });
  return parse<{
    totalEarned: number;
    totalCommission: number;
    pendingPayout: number;
    entries: Array<Record<string, unknown>>;
  }>(res);
}

export async function getPublicVendors() {
  const res = await fetch(`${API_URL}/api/vendors`);
  return parse<Array<Record<string, unknown>>>(res);
}

export async function getPublicVendorStore(slug: string) {
  const res = await fetch(`${API_URL}/api/vendors/${slug}`);
  return parse<{
    store: Record<string, unknown>;
    products: Array<Record<string, unknown>>;
  }>(res);
}

export type ReturnRequest = {
  id: string;
  reason: string;
  status: string;
  adminNotes?: string | null;
  createdAt: string;
  order?: { orderNumber: string; numericId: number };
  user?: { id: string; name: string; email: string };
  vendor?: { id: string; name: string; email?: string } | null;
};

export type DisputeRow = {
  id: string;
  subject: string;
  description: string;
  status: string;
  resolution?: string | null;
  createdAt: string;
  order?: { orderNumber: string; numericId: number } | null;
  openedBy?: { id: string; name: string; email?: string };
  vendor?: { id: string; name: string; email?: string } | null;
};

export async function getReturns(token: string) {
  const res = await fetch(`${API_URL}/api/returns`, {
    headers: authHeaders(token),
  });
  return parse<ReturnRequest[]>(res);
}

export async function updateReturnStatus(
  token: string,
  id: string,
  status: string,
  adminNotes?: string,
) {
  const res = await fetch(`${API_URL}/api/returns/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ status, adminNotes }),
  });
  return parse<ReturnRequest>(res);
}

export async function createReturn(
  token: string,
  body: { orderId: string | number; reason: string; vendorId?: string },
) {
  const res = await fetch(`${API_URL}/api/returns`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  return parse<ReturnRequest>(res);
}

export async function getDisputes(token: string) {
  const res = await fetch(`${API_URL}/api/disputes`, {
    headers: authHeaders(token),
  });
  return parse<DisputeRow[]>(res);
}

export async function createDispute(
  token: string,
  body: {
    subject: string;
    description: string;
    orderId?: string | number;
    vendorId?: string;
  },
) {
  const res = await fetch(`${API_URL}/api/disputes`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  return parse<DisputeRow>(res);
}

export async function resolveDispute(
  token: string,
  id: string,
  status: string,
  resolution?: string,
) {
  const res = await fetch(`${API_URL}/api/disputes/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ status, resolution }),
  });
  return parse<DisputeRow>(res);
}
