import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DonationInput {
    utr: string;
    displayName: string;
    donorId: string;
    description: string;
    email?: string;
    phone: string;
    amount: bigint;
}
export type Time = bigint;
export interface DonorPublicProfile {
    id: string;
    age?: bigint;
    principal?: Principal;
    maskedPhone: string;
    displayName: string;
    joinedTimestamp: Time;
    email?: string;
    gender: Gender;
    totalDonated: bigint;
}
export interface Record_ {
    id: string;
    description: string;
    timestamp: Time;
    amount: bigint;
}
export interface Notification {
    id: bigint;
    message: string;
    timestamp: Time;
    priority: NotificationPriority;
    isNew: boolean;
}
export interface Record__1 {
    id: string;
    utr: string;
    status: Status;
    donorId: string;
    description: string;
    timestamp: Time;
    amount: bigint;
}
export interface DonorProfile {
    id: string;
    age?: bigint;
    principal?: Principal;
    displayName: string;
    joinedTimestamp: Time;
    email?: string;
    gender: Gender;
    phone: string;
    totalDonated: bigint;
}
export interface UserProfile {
    age?: bigint;
    name: string;
    email?: string;
    gender: Gender;
    phone?: string;
}
export interface Metrics {
    totalSiteViews: bigint;
    currentLiveViewers: bigint;
}
export enum Gender {
    other = "other",
    female = "female",
    male = "male",
    preferNotToSay = "preferNotToSay"
}
export enum NotificationPriority {
    low = "low",
    normal = "normal",
    high = "high"
}
export enum Status {
    pending = "pending",
    confirmed = "confirmed",
    failed = "failed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acknowledgeNotification(notificationId: bigint): Promise<void>;
    addDonation(donationInput: DonationInput): Promise<string>;
    addSpendingRecord(amount: bigint, description: string): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    confirmAllPendingDonations(): Promise<void>;
    confirmDonation(donationId: string): Promise<void>;
    declineDonation(donationId: string): Promise<void>;
    deleteSpendingRecord(id: string): Promise<void>;
    getAdminNotifications(limit: bigint | null): Promise<Array<Notification>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDonations(limit: bigint, offset: bigint): Promise<Array<Record__1>>;
    getDonorDonations(donorId: string): Promise<Array<Record__1>>;
    getDonorProfile(donorId: string): Promise<DonorProfile | null>;
    getDonorProfiles(): Promise<Array<DonorProfile>>;
    getDonorPublicProfile(donorId: string): Promise<DonorPublicProfile | null>;
    getDonorPublicProfiles(): Promise<Array<DonorPublicProfile>>;
    getSiteMetrics(): Promise<Metrics>;
    getSpendingRecords(limit: bigint, offset: bigint): Promise<Array<Record_>>;
    getTotalDonations(): Promise<bigint>;
    getTotalSpending(): Promise<bigint>;
    getTrustBalance(): Promise<bigint>;
    getUnreadNotificationCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    heartbeatLiveViewer(sessionId: string): Promise<void>;
    incrementSiteViews(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    markNotificationAsRead(notificationId: bigint): Promise<void>;
    registerLiveViewer(sessionId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    unregisterLiveViewer(sessionId: string): Promise<void>;
    updateDonorProfileAdmin(donorId: string, displayName: string, email: string | null, phone: string): Promise<void>;
    updateSpendingRecord(id: string, amount: bigint, description: string): Promise<void>;
}
