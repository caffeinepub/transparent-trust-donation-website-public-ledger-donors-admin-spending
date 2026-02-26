import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface ContactFormEntry {
    id: string;
    inquiryType: InquiryType;
    name: string;
    submittedBy?: Principal;
    email: string;
    replyStatus: Variant_closed_notReplied_pendingResponse_replied;
    message: string;
    timestamp: Time;
    phone: string;
    adminNotes?: string;
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
export interface Record__1 {
    id: string;
    status: Status;
    paymentScreenshot?: ExternalBlob;
    donorId: string;
    description: string;
    proverbId?: bigint;
    donorGender: Gender;
    timestamp: Time;
    amount: bigint;
    proverbFeedback?: boolean;
}
export interface DonorProfile {
    id: string;
    age?: bigint;
    principal?: Principal;
    displayName: string;
    joinedTimestamp: Time;
    privacyLevel: PrivacyLevel;
    email?: string;
    gender: Gender;
    phone: string;
    totalDonated: bigint;
}
export interface ActivityEntry {
    id: string;
    title: string;
    description: string;
    author: string;
    notes?: string;
    timestamp: Time;
    images: Array<ExternalBlob>;
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
export enum InquiryType {
    donationQuestion = "donationQuestion",
    other = "other",
    collaborationProposal = "collaborationProposal",
    feedbackSuggestion = "feedbackSuggestion",
    general = "general",
    serviceOffer = "serviceOffer"
}
export enum PrivacyLevel {
    publicView = "publicView",
    strictlyConfidential = "strictlyConfidential",
    anonymous = "anonymous"
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
export enum Variant_closed_notReplied_pendingResponse_replied {
    closed = "closed",
    notReplied = "notReplied",
    pendingResponse = "pendingResponse",
    replied = "replied"
}
export interface backendInterface {
    addServiceActivity(title: string, description: string, images: Array<ExternalBlob>, author: string, notes: string | null): Promise<string>;
    addSpendingRecord(amount: bigint, description: string): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    confirmAllPendingDonations(): Promise<void>;
    confirmDonation(donationId: string): Promise<void>;
    declineDonation(donationId: string): Promise<void>;
    deleteServiceActivity(id: string): Promise<void>;
    deleteSpendingRecord(id: string): Promise<void>;
    getAllProverbs(): Promise<Array<{
        id: string;
        text: string;
        author: string;
    }>>;
    getAllServiceActivities(limit: bigint, offset: bigint): Promise<Array<ActivityEntry>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContactFormEntries(): Promise<Array<ContactFormEntry>>;
    getDonations(limit: bigint, offset: bigint): Promise<Array<Record__1>>;
    getDonorDonations(donorId: string): Promise<Array<Record__1>>;
    getDonorProfile(donorId: string): Promise<DonorProfile | null>;
    getDonorProfiles(): Promise<Array<DonorProfile>>;
    getDonorPublicProfile(donorId: string): Promise<DonorPublicProfile | null>;
    getDonorPublicProfiles(): Promise<Array<DonorPublicProfile>>;
    getProverbsForDonation(donationId: string): Promise<Array<{
        id: string;
        text: string;
        author: string;
    }>>;
    getServiceActivitiesByRecentDays(days: bigint): Promise<Array<ActivityEntry>>;
    getServiceActivity(id: string): Promise<ActivityEntry | null>;
    getSiteMetrics(): Promise<Metrics>;
    getSpendingRecords(limit: bigint, offset: bigint): Promise<Array<Record_>>;
    getTotalDonations(): Promise<bigint>;
    getTotalSpending(): Promise<bigint>;
    getTrustBalance(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    heartbeatLiveViewer(sessionId: string): Promise<void>;
    incrementSiteViews(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    recordProverbFeedback(donationId: string, isLiked: boolean): Promise<void>;
    registerLiveViewer(sessionId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchServiceActivitiesByTitle(keyword: string): Promise<Array<ActivityEntry>>;
    selectProverbForDonation(donationId: string, proverbId: bigint): Promise<void>;
    submitContactForm(name: string, email: string, phone: string, message: string, inquiryType: InquiryType): Promise<string>;
    submitDonation(donorId: string, amount: bigint, description: string, displayName: string, email: string | null, phone: string, paymentScreenshot: ExternalBlob | null): Promise<string>;
    unregisterLiveViewer(sessionId: string): Promise<void>;
    updateDonorProfileAdmin(donorId: string, displayName: string, email: string | null, phone: string): Promise<void>;
    updateServiceActivity(id: string, title: string, description: string, images: Array<ExternalBlob>, author: string, notes: string | null): Promise<void>;
    updateSpendingRecord(id: string, amount: bigint, description: string): Promise<void>;
}
