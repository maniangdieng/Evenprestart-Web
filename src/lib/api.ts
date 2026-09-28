import type { TalentCardData } from "@/components/talents/talent-card";

// Côté serveur (SSR, dans le conteneur web), on doit joindre l'API via le
// réseau Docker interne (`API_INTERNAL_URL=http://api:3001`) — `localhost`
// depuis le conteneur web ne pointe pas vers le conteneur api. Côté
// navigateur, seul NEXT_PUBLIC_API_URL (exposé publiquement) est disponible.
const SERVER_API_URL =
  process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const CLIENT_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function resolveApiUrl() {
  return typeof window === "undefined" ? SERVER_API_URL : CLIENT_API_URL;
}

interface ApiOptions extends RequestInit {
  accessToken?: string;
}

export async function apiFetch<T>(
  path: string,
  { accessToken, headers, ...init }: ApiOptions = {},
): Promise<T> {
  const response = await fetch(`${resolveApiUrl()}/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(body?.message ?? `Erreur API (${response.status})`);
  }

  return body as T;
}

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
}

export interface MediaDto {
  id: string;
  kind: "IMAGE" | "VIDEO";
  url: string;
  position: number;
}

export interface ServicePackageDto {
  id: string;
  name: string;
  description: string | null;
  price: string;
  durationMinutes: number | null;
  isPopular: boolean;
}

export interface TalentProfileDto {
  id: string;
  userId: string;
  stageName: string;
  bio: string | null;
  location: string | null;
  basePriceFrom: string | null;
  coverImageUrl: string | null;
  isVerified: boolean;
  isPublished: boolean;
  ratingAverage: string;
  ratingCount: number;
  categories: { category: CategoryDto }[];
  media: MediaDto[];
  packages: ServicePackageDto[];
}

export interface ReviewDto {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  author: { firstName: string; lastName: string };
}

export interface SearchTalentsResult {
  items: TalentProfileDto[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SearchTalentsParams {
  categorySlug?: string;
  location?: string;
  budgetMin?: number;
  budgetMax?: number;
  availableOn?: string;
  page?: number;
  pageSize?: number;
}

export function getCategories(): Promise<CategoryDto[]> {
  return apiFetch<CategoryDto[]>("/categories", { cache: "no-store" });
}

export interface CategoryInput {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export function createCategory(
  accessToken: string,
  dto: CategoryInput,
): Promise<CategoryDto> {
  return apiFetch<CategoryDto>("/categories", {
    method: "POST",
    accessToken,
    body: JSON.stringify(dto),
  });
}

export function updateCategory(
  accessToken: string,
  id: string,
  dto: Partial<CategoryInput>,
): Promise<CategoryDto> {
  return apiFetch<CategoryDto>(`/categories/${id}`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify(dto),
  });
}

export function deleteCategory(accessToken: string, id: string): Promise<void> {
  return apiFetch<void>(`/categories/${id}`, {
    method: "DELETE",
    accessToken,
  });
}

export function searchTalents(
  params: SearchTalentsParams = {},
): Promise<SearchTalentsResult> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const qs = query.toString();
  return apiFetch<SearchTalentsResult>(`/talents${qs ? `?${qs}` : ""}`, {
    cache: "no-store",
  });
}

export async function getTalent(id: string): Promise<TalentProfileDto | null> {
  const response = await fetch(`${resolveApiUrl()}/api/talents/${id}`, {
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message ?? `Erreur API (${response.status})`);
  }
  return response.json();
}

export function getTalentReviews(talentProfileId: string): Promise<ReviewDto[]> {
  return apiFetch<ReviewDto[]>(`/reviews/talent/${talentProfileId}`, {
    cache: "no-store",
  });
}

export interface CreateTalentProfileInput {
  stageName: string;
  bio?: string;
  location?: string;
  basePriceFrom?: number;
  categoryIds: string[];
}

export function getMyTalentProfile(accessToken: string): Promise<TalentProfileDto | null> {
  return apiFetch<TalentProfileDto | null>("/talents/me", {
    accessToken,
    cache: "no-store",
  });
}

export function createTalentProfile(
  accessToken: string,
  dto: CreateTalentProfileInput,
): Promise<TalentProfileDto> {
  return apiFetch<TalentProfileDto>("/talents", {
    method: "POST",
    accessToken,
    body: JSON.stringify(dto),
  });
}

export function updateTalentProfile(
  accessToken: string,
  dto: Partial<CreateTalentProfileInput>,
): Promise<TalentProfileDto> {
  return apiFetch<TalentProfileDto>("/talents/me", {
    method: "PATCH",
    accessToken,
    body: JSON.stringify(dto),
  });
}

export async function uploadTalentMedia(
  accessToken: string,
  file: File,
): Promise<MediaDto> {
  const formData = new FormData();
  formData.set("file", file);
  const response = await fetch(`${resolveApiUrl()}/api/talents/me/media`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(body?.message ?? `Erreur API (${response.status})`);
  }
  return body as MediaDto;
}

export async function uploadUserAvatar(
  accessToken: string,
  file: File,
): Promise<{ avatarUrl: string | null }> {
  const formData = new FormData();
  formData.set("file", file);
  const response = await fetch(`${resolveApiUrl()}/api/users/me/avatar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(body?.message ?? `Erreur API (${response.status})`);
  }
  return body as { avatarUrl: string | null };
}

export async function uploadTalentCoverImage(
  accessToken: string,
  file: File,
): Promise<TalentProfileDto> {
  const formData = new FormData();
  formData.set("file", file);
  const response = await fetch(`${resolveApiUrl()}/api/talents/me/cover`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(body?.message ?? `Erreur API (${response.status})`);
  }
  return body as TalentProfileDto;
}

export async function deleteTalentMedia(
  accessToken: string,
  mediaId: string,
): Promise<void> {
  await apiFetch(`/talents/me/media/${mediaId}`, {
    method: "DELETE",
    accessToken,
  });
}

export interface BookingDto {
  id: string;
  clientId: string;
  talentProfileId: string;
  servicePackageId: string | null;
  eventDate: string;
  location: string;
  status:
    | "PENDING"
    | "ACCEPTED"
    | "COUNTER_OFFERED"
    | "CONFIRMED"
    | "PAID"
    | "COMPLETED"
    | "CANCELLED"
    | "DISPUTED"
    | "REFUNDED";
  subtotalAmount: string;
  /** Absents de la vue artiste : l'artiste ne voit que son cachet (subtotalAmount). */
  serviceFeeAmount?: string;
  totalAmount?: string;
  createdAt: string;
  talentProfile: { id: string; stageName: string };
  servicePackage?: { name: string } | null;
}

export function getMyBookings(
  accessToken: string,
  as: "client" | "artist",
): Promise<BookingDto[]> {
  return apiFetch<BookingDto[]>(`/bookings/mine?as=${as}`, {
    accessToken,
    cache: "no-store",
  });
}

export interface CreateBookingInput {
  talentProfileId: string;
  servicePackageId?: string;
  eventDate: string;
  location: string;
}

export function createBooking(
  accessToken: string,
  dto: CreateBookingInput,
): Promise<BookingDto> {
  return apiFetch<BookingDto>("/bookings", {
    method: "POST",
    accessToken,
    body: JSON.stringify(dto),
  });
}

export interface AdminDashboardDto {
  totalRevenue: string | number;
  totalCommission: string | number;
  bookingsCount: number;
  completedCount: number;
  conversionRate: number;
  topTalents: { id: string; stageName: string; ratingAverage: string; ratingCount: number }[];
}

export function getAdminDashboard(accessToken: string): Promise<AdminDashboardDto> {
  return apiFetch<AdminDashboardDto>("/admin/dashboard", {
    accessToken,
    cache: "no-store",
  });
}

export interface PendingTalentProfileDto {
  id: string;
  stageName: string;
  location: string | null;
  basePriceFrom: string | null;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
}

export function getPendingProfiles(accessToken: string): Promise<PendingTalentProfileDto[]> {
  return apiFetch<PendingTalentProfileDto[]>("/admin/profiles/pending", {
    accessToken,
    cache: "no-store",
  });
}

export function validateTalentProfile(accessToken: string, id: string): Promise<TalentProfileDto> {
  return apiFetch<TalentProfileDto>(`/admin/profiles/${id}/validate`, {
    method: "PATCH",
    accessToken,
  });
}

export type AdminUserRole = "CLIENT" | "ARTIST" | "ADMIN" | "SUPER_ADMIN";

export interface AdminUserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AdminUserRole;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  talentProfile: { id: string; stageName: string } | null;
}

export interface CreateAdminUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: AdminUserRole;
  phone?: string;
}

export function createAdminUser(
  accessToken: string,
  dto: CreateAdminUserInput,
): Promise<AdminUserDto> {
  return apiFetch<AdminUserDto>("/admin/users", {
    method: "POST",
    accessToken,
    body: JSON.stringify(dto),
  });
}

export function getAdminUsers(
  accessToken: string,
  filters: { role?: AdminUserRole; search?: string } = {},
): Promise<AdminUserDto[]> {
  const query = new URLSearchParams();
  if (filters.role) query.set("role", filters.role);
  if (filters.search) query.set("search", filters.search);
  const qs = query.toString();
  return apiFetch<AdminUserDto[]>(`/admin/users${qs ? `?${qs}` : ""}`, {
    accessToken,
    cache: "no-store",
  });
}

export function updateUserRole(
  accessToken: string,
  id: string,
  role: AdminUserRole,
): Promise<AdminUserDto> {
  return apiFetch<AdminUserDto>(`/admin/users/${id}/role`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify({ role }),
  });
}

export function updateUserActive(
  accessToken: string,
  id: string,
  isActive: boolean,
): Promise<AdminUserDto> {
  return apiFetch<AdminUserDto>(`/admin/users/${id}/active`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify({ isActive }),
  });
}

export interface AdminBookingDto {
  id: string;
  eventDate: string;
  location: string;
  status: BookingDto["status"];
  subtotalAmount: string;
  totalAmount: string;
  cancellationReason: string | null;
  createdAt: string;
  servicePackage: { name: string } | null;
  talentProfile: {
    id: string;
    stageName: string;
    user: { id: string; email: string; phone: string | null; firstName: string };
  };
  client: { id: string; firstName: string; lastName: string; email: string; phone: string | null };
}

export type BookingDecisionAction = "CONFIRM" | "REFUSE";

/** Décision de l'équipe après négociation avec l'artiste. */
export function decideAdminBooking(
  accessToken: string,
  id: string,
  dto: { action: BookingDecisionAction; artistFee?: number; note?: string },
): Promise<BookingDto> {
  return apiFetch<BookingDto>(`/admin/bookings/${id}/decision`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify(dto),
  });
}

export function cancelAdminBooking(
  accessToken: string,
  id: string,
  reason?: string,
): Promise<BookingDto> {
  return apiFetch<BookingDto>(`/admin/bookings/${id}/cancel`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify({ reason }),
  });
}

export interface CreateAdminBookingInput {
  clientId: string;
  talentProfileId: string;
  servicePackageId?: string;
  eventDate: string;
  location: string;
}

export function createAdminBooking(
  accessToken: string,
  dto: CreateAdminBookingInput,
): Promise<BookingDto> {
  return apiFetch<BookingDto>("/admin/bookings", {
    method: "POST",
    accessToken,
    body: JSON.stringify(dto),
  });
}

export function getAdminBookings(
  accessToken: string,
  status?: AdminBookingDto["status"],
): Promise<AdminBookingDto[]> {
  return apiFetch<AdminBookingDto[]>(`/admin/bookings${status ? `?status=${status}` : ""}`, {
    accessToken,
    cache: "no-store",
  });
}

export interface AdminProfileDetailDto extends TalentProfileDto {
  user: { firstName: string; lastName: string; email: string; phone: string | null; createdAt: string };
}

export function getAdminProfileDetail(
  accessToken: string,
  id: string,
): Promise<AdminProfileDetailDto> {
  return apiFetch<AdminProfileDetailDto>(`/admin/profiles/${id}`, {
    accessToken,
    cache: "no-store",
  });
}

// ============ NOTIFICATIONS ============

export type NotificationType =
  | "BOOKING_REQUEST"
  | "BOOKING_ACCEPTED"
  | "BOOKING_REFUSED"
  | "BOOKING_CANCELLED"
  | "COUNTER_OFFER"
  | "PAYMENT_RECEIVED"
  | "NEW_MESSAGE"
  | "REVIEW_RECEIVED"
  | "PROFILE_VALIDATED"
  | "DISPUTE_UPDATE"
  | "EVENT_REMINDER"
  | "SYSTEM";

export interface NotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export function getNotifications(accessToken: string): Promise<NotificationDto[]> {
  return apiFetch<NotificationDto[]>("/notifications/mine", {
    accessToken,
    cache: "no-store",
  });
}

export function getUnreadNotificationCount(accessToken: string): Promise<number> {
  return apiFetch<number>("/notifications/unread-count", {
    accessToken,
    cache: "no-store",
  });
}

export function markNotificationRead(accessToken: string, id: string): Promise<void> {
  return apiFetch<void>(`/notifications/${id}/read`, {
    method: "PATCH",
    accessToken,
  });
}

export function markAllNotificationsRead(accessToken: string): Promise<void> {
  return apiFetch<void>("/notifications/read-all", {
    method: "PATCH",
    accessToken,
  });
}

// ============ MESSAGERIE DE SUPPORT (client/artiste <-> admin) ============

export interface ConversationParticipantDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  role: AdminUserRole;
}

export interface ConversationMessageDto {
  id: string;
  conversationId: string;
  authorId: string;
  isAdminReply: boolean;
  content: string;
  readAt: string | null;
  createdAt: string;
}

export interface ConversationDto {
  id: string;
  participantId: string;
  subject: string | null;
  status: "OPEN" | "CLOSED";
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  messages: ConversationMessageDto[];
}

export interface AdminConversationListItemDto {
  id: string;
  participantId: string;
  subject: string | null;
  status: "OPEN" | "CLOSED";
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  participant: ConversationParticipantDto;
  lastMessage: ConversationMessageDto | null;
  unreadCount: number;
}

export interface AdminConversationDetailDto extends ConversationDto {
  participant: ConversationParticipantDto;
}

export function getMySupportConversation(
  accessToken: string,
): Promise<ConversationDto | null> {
  return apiFetch<ConversationDto | null>("/messages/support/mine", {
    accessToken,
    cache: "no-store",
  });
}

export function sendSupportMessage(
  accessToken: string,
  content: string,
): Promise<ConversationMessageDto> {
  return apiFetch<ConversationMessageDto>("/messages/support", {
    method: "POST",
    accessToken,
    body: JSON.stringify({ content }),
  });
}

export function getMyUnreadSupportCount(accessToken: string): Promise<number> {
  return apiFetch<number>("/messages/support/mine/unread-count", {
    accessToken,
    cache: "no-store",
  });
}

export function getAdminSupportConversations(
  accessToken: string,
): Promise<AdminConversationListItemDto[]> {
  return apiFetch<AdminConversationListItemDto[]>("/messages/support", {
    accessToken,
    cache: "no-store",
  });
}

export function getAdminSupportConversation(
  accessToken: string,
  id: string,
): Promise<AdminConversationDetailDto> {
  return apiFetch<AdminConversationDetailDto>(`/messages/support/${id}`, {
    accessToken,
    cache: "no-store",
  });
}

export function replyToSupportConversation(
  accessToken: string,
  id: string,
  content: string,
): Promise<ConversationMessageDto> {
  return apiFetch<ConversationMessageDto>(`/messages/support/${id}/reply`, {
    method: "POST",
    accessToken,
    body: JSON.stringify({ content }),
  });
}

export function closeSupportConversation(
  accessToken: string,
  id: string,
): Promise<ConversationDto> {
  return apiFetch<ConversationDto>(`/messages/support/${id}/close`, {
    method: "PATCH",
    accessToken,
  });
}

/** Ouvre (ou retrouve) le fil de discussion de l'équipe avec un client ou un artiste. */
export function openSupportConversationWith(
  accessToken: string,
  userId: string,
): Promise<ConversationDto> {
  return apiFetch<ConversationDto>(`/messages/support/open/${userId}`, {
    method: "POST",
    accessToken,
  });
}

export function getAdminUnreadSupportCount(accessToken: string): Promise<number> {
  return apiFetch<number>("/messages/support/unread-count", {
    accessToken,
    cache: "no-store",
  });
}

export function toTalentCardData(talent: TalentProfileDto): TalentCardData {
  return {
    id: talent.id,
    stageName: talent.stageName,
    categoryLabel: talent.categories[0]?.category.name ?? "Talent",
    location: talent.location ?? undefined,
    priceFrom: talent.basePriceFrom ? Number(talent.basePriceFrom) : 0,
    ratingAverage: Number(talent.ratingAverage),
    ratingCount: talent.ratingCount,
    isVerified: talent.isVerified,
    imageUrl: talent.coverImageUrl ?? talent.media.find((m) => m.kind === "IMAGE")?.url,
  };
}
