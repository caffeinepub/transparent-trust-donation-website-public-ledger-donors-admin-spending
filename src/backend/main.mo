import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Blob "mo:core/Blob";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";


// Use migration from migration.mo

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  module Donation {
    public type Status = {
      #pending;
      #confirmed;
      #failed;
    };

    public type Record = {
      id : Text;
      donorId : Text;
      amount : Nat;
      timestamp : Time.Time;
      description : Text;
      status : Status;
      paymentScreenshot : ?Storage.ExternalBlob;
      donorGender : UserProfile.Gender;
      proverbId : ?Nat;
      proverbFeedback : ?Bool;
    };
  };

  module DonorPrivacy {
    public type PrivacyLevel = {
      #publicView;
      #anonymous;
      #strictlyConfidential;
    };

    public type AnonymizationState = {
      privacyLevel : PrivacyLevel;
      isPermanentlyAnonymous : Bool;
    };
  };

  module Donor {
    public type Gender = UserProfile.Gender;
    public type Profile = {
      id : Text;
      displayName : Text;
      email : ?Text;
      phone : Text;
      principal : ?Principal;
      joinedTimestamp : Time.Time;
      totalDonated : Nat;
      age : ?Nat;
      gender : Gender;
      privacyLevel : DonorPrivacy.PrivacyLevel;
    };

    public type PublicProfile = {
      id : Text;
      displayName : Text;
      email : ?Text;
      maskedPhone : Text;
      principal : ?Principal;
      joinedTimestamp : Time.Time;
      totalDonated : Nat;
      age : ?Nat;
      gender : Gender;
    };
  };

  module Spending {
    public type Categories = {
      #food;
      #medicine;
      #education;
      #disasterRelief;
      #welfare;
      #mosqueMaintenance;
      #otherCategory;
    };

    public type Record = {
      id : Text;
      amount : Nat;
      timestamp : Time.Time;
      description : Text;
    };

    public type DetailedRecord = {
      id : Text;
      amount : Nat;
      timestamp : Time.Time;
      description : Text;
      category : Categories;
    };
  };

  module UserProfile {
    public type Gender = {
      #male;
      #female;
      #other;
      #preferNotToSay;
    };

    public type VerificationStatus = {
      #unverified;
      #verified;
    };

    public type Status = {
      #guest;
      #awaitingProfileData;
      #profileComplete;
      #verified;
      #banned;
      #admin;
      #volunteer;
      #boardMember;
    };

    public type Profile = {
      id : Text;
      name : Text;
      principal : ?Principal;
      email : ?Text;
      phone : ?Text;
      gender : Gender;
      age : ?Nat;
      joinTimestamp : Time.Time;
      lastUpdated : Time.Time;
      status : Status;
      verificationStatus : VerificationStatus;
      bio : ?Text;
      location : ?Text;
      totalDonated : Nat;
      donationCount : Nat;
    };

    public type PublicProfile = {
      id : Text;
      name : Text;
      gender : Gender;
      joinTimestamp : Time.Time;
      totalDonated : Nat;
      donationCount : Nat;
    };
  };

  module ContactForm {
    public type InquiryType = {
      #general;
      #donationQuestion;
      #serviceOffer;
      #collaborationProposal;
      #feedbackSuggestion;
      #other;
    };

    public type Entry = {
      id : Text;
      name : Text;
      email : Text;
      phone : Text;
      message : Text;
      inquiryType : InquiryType;
      timestamp : Time.Time;
      submittedBy : ?Principal;
      replyStatus : {
        #notReplied;
        #replied;
        #pendingResponse;
        #closed;
      };
      adminNotes : ?Text;
    };
  };

  module Services {
    public type ActivityEntry = {
      id : Text;
      title : Text;
      description : Text;
      images : [Storage.ExternalBlob];
      timestamp : Time.Time;
      author : Text;
      notes : ?Text;
    };
  };

  public type UserProfile = {
    name : Text;
    email : ?Text;
    phone : ?Text;
    gender : Donor.Gender;
    age : ?Nat;
  };

  public type DonorProfile = Donor.Profile;
  public type DonationRecord = Donation.Record;
  public type DonorPublicProfile = Donor.PublicProfile;
  public type ContactFormEntry = ContactForm.Entry;
  public type Status = Donation.Status;
  public type Gender = UserProfile.Gender;

  public type Paise = Nat;

  var donations = List.empty<Donation.Record>();
  var spendingRecords = List.empty<Spending.Record>();
  let donorProfiles = Map.empty<Text, Donor.Profile>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let contactFormEntries = Map.empty<Text, ContactForm.Entry>();
  var nextDonationId : Nat = 0;
  var nextSpendingId : Nat = 0;
  var nextContactId : Nat = 0;
  var liveViewerSessions = Map.empty<Text, { sessionId : Text; lastHeartbeat : Time.Time }>();

  var totalSiteViews : Nat = 0;

  var proverbs = List.empty<{ id : Text; text : Text; author : Text }>();
  var nextProverbId : Nat = 0;

  type Notification = {
    id : Nat;
    message : Text;
    priority : NotificationPriority;
    timestamp : Time.Time;
    isNew : Bool;
  };

  let adminNotifications = Map.empty<Principal, List.List<Notification>>();

  var services = List.empty<Services.ActivityEntry>();
  var nextServiceId : Nat = 0;

  // Rate limiting for spam protection
  let contactSubmissionTimestamps = Map.empty<Principal, List.List<Time.Time>>();
  let donationSubmissionTimestamps = Map.empty<Principal, List.List<Time.Time>>();

  public type NotificationPriority = { #low; #normal; #high };
  public type SpendingRecord = Spending.Record;

  type Metrics = {
    totalSiteViews : Nat;
    currentLiveViewers : Nat;
  };

  func hasCompletedProfile(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        profile.name.size() > 0 and profile.phone.isSome();
      };
      case (null) { false };
    };
  };

  func checkRateLimit(timestamps : List.List<Time.Time>, maxCount : Nat, windowNs : Int) : Bool {
    let now = Time.now();
    let recentTimestamps = timestamps.filter(func(ts) { now - ts < windowNs });
    recentTimestamps.size() < maxCount;
  };

  func updateRateLimitTimestamps(
    timestampMap : Map.Map<Principal, List.List<Time.Time>>,
    caller : Principal,
    windowNs : Int,
  ) {
    let now = Time.now();
    let existing = switch (timestampMap.get(caller)) {
      case (?list) { list };
      case (null) { List.empty<Time.Time>() };
    };
    let filtered = existing.filter(func(ts) { now - ts < windowNs });
    filtered.add(now);
    timestampMap.add(caller, filtered);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    if (profile.name.size() == 0) {
      Runtime.trap("Name is required");
    };

    switch (profile.phone) {
      case (?phone) {
        if (not isValidIndianPhoneNumber(phone)) {
          Runtime.trap("Invalid phone number format");
        };
      };
      case (null) {
        Runtime.trap("Phone number is required");
      };
    };

    switch (profile.age) {
      case (?age) {
        if (age < 1 or age > 150) {
          Runtime.trap("Invalid age");
        };
      };
      case (null) {
        Runtime.trap("Age is required");
      };
    };

    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getContactFormEntries() : async [ContactFormEntry] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view contact form entries");
    };
    contactFormEntries.values().toArray();
  };

  public shared ({ caller }) func submitContactForm(
    name : Text,
    email : Text,
    phone : Text,
    message : Text,
    inquiryType : ContactForm.InquiryType,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit contact forms");
    };

    if (not hasCompletedProfile(caller)) {
      Runtime.trap("Please complete your profile before submitting contact forms");
    };

    let oneHourNs : Int = 3600 * 1_000_000_000;
    let timestamps = switch (contactSubmissionTimestamps.get(caller)) {
      case (?list) { list };
      case (null) { List.empty<Time.Time>() };
    };

    if (not checkRateLimit(timestamps, 5, oneHourNs)) {
      Runtime.trap("Rate limit exceeded: Maximum 5 contact form submissions per hour");
    };

    if (name.size() == 0 or name.size() > 100) {
      Runtime.trap("Name must be between 1 and 100 characters");
    };

    if (message.size() == 0 or message.size() > 2000) {
      Runtime.trap("Message must be between 1 and 2000 characters");
    };

    if (not isValidIndianPhoneNumber(phone)) {
      Runtime.trap("Invalid phone number format");
    };

    let entryId = nextContactId.toText();
    nextContactId += 1;

    let entry : ContactForm.Entry = {
      id = entryId;
      name = name;
      email = email;
      phone = phone;
      message = message;
      inquiryType = inquiryType;
      timestamp = Time.now();
      submittedBy = ?caller;
      replyStatus = #notReplied;
      adminNotes = null;
    };

    contactFormEntries.add(entryId, entry);
    updateRateLimitTimestamps(contactSubmissionTimestamps, caller, oneHourNs);

    entryId;
  };

  public shared ({ caller }) func submitDonation(
    donorId : Text,
    amount : Nat,
    description : Text,
    displayName : Text,
    email : ?Text,
    phone : Text,
    paymentScreenshot : ?Storage.ExternalBlob,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit donations");
    };

    if (not hasCompletedProfile(caller)) {
      Runtime.trap("Please complete your profile before making donations");
    };

    let oneHourNs : Int = 3600 * 1_000_000_000;
    let timestamps = switch (donationSubmissionTimestamps.get(caller)) {
      case (?list) { list };
      case (null) { List.empty<Time.Time>() };
    };

    if (not checkRateLimit(timestamps, 10, oneHourNs)) {
      Runtime.trap("Rate limit exceeded: Maximum 10 donation submissions per hour");
    };

    if (not isValidIndianPhoneNumber(phone)) {
      Runtime.trap("Invalid phone number format");
    };

    if (amount == 0) {
      Runtime.trap("Donation amount must be greater than zero");
    };

    let userProfile = switch (userProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) {
        Runtime.trap("User profile not found");
      };
    };

    let donationId = nextDonationId.toText();
    nextDonationId += 1;

    let donation : Donation.Record = {
      id = donationId;
      donorId;
      amount;
      timestamp = Time.now();
      description;
      status = #pending;
      paymentScreenshot;
      donorGender = userProfile.gender;
      proverbId = null;
      proverbFeedback = null;
    };

    donations.add(donation);
    updateRateLimitTimestamps(donationSubmissionTimestamps, caller, oneHourNs);

    switch (donorProfiles.get(donorId)) {
      case (?existingDonor) {
        let updatedDonor : Donor.Profile = {
          id = existingDonor.id;
          displayName;
          email;
          phone;
          principal = ?caller;
          joinedTimestamp = existingDonor.joinedTimestamp;
          totalDonated = existingDonor.totalDonated;
          age = userProfile.age;
          gender = userProfile.gender;
          privacyLevel = existingDonor.privacyLevel;
        };
        donorProfiles.add(donorId, updatedDonor);
      };
      case (null) {
        let newDonor : Donor.Profile = {
          id = donorId;
          displayName;
          email;
          phone;
          principal = ?caller;
          joinedTimestamp = Time.now();
          totalDonated = 0;
          age = userProfile.age;
          gender = userProfile.gender;
          privacyLevel = #publicView;
        };
        donorProfiles.add(donorId, newDonor);
      };
    };
    donationId;
  };

  func isValidIndianPhoneNumber(phone : Text) : Bool {
    if (phone.size() != 13) { return false };
    if (not phone.startsWith(#text("+91")) or phone.startsWith(#text("+910"))) { return false };
    let chars = phone.chars().toArray();
    var i = 3;
    while (i < chars.size() and i < 13) {
      let c = chars[i];
      switch (i) {
        case (3) {
          if (c < '6' or c > '9') { return false };
        };
        case (_) {
          if (c < '0' or c > '9') { return false };
        };
      };
      i += 1;
    };
    true;
  };

  func validateContactFormData(message : Text) : Bool {
    message.trim(#char ' ').size() > 0 and message.trim(#char ' ').size() <= 2000;
  };

  public shared ({ caller }) func confirmDonation(donationId : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can confirm donations");
    };

    donations := donations.map<Donation.Record, Donation.Record>(
      func(d) {
        if (d.id == donationId) {
          updateDonorTotal(d.donorId, d.amount);
          {
            id = d.id;
            donorId = d.donorId;
            amount = d.amount;
            timestamp = d.timestamp;
            description = d.description;
            paymentScreenshot = d.paymentScreenshot;
            status = #confirmed;
            donorGender = d.donorGender;
            proverbId = d.proverbId;
            proverbFeedback = d.proverbFeedback;
          };
        } else {
          d;
        };
      }
    );
  };

  public shared ({ caller }) func confirmAllPendingDonations() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can confirm donations");
    };

    var confirmedCount = 0;

    donations := donations.map<Donation.Record, Donation.Record>(
      func(donation) {
        if (donation.status == #pending) {
          confirmedCount += 1;
          updateDonorTotal(donation.donorId, donation.amount);

          {
            id = donation.id;
            donorId = donation.donorId;
            amount = donation.amount;
            timestamp = donation.timestamp;
            description = donation.description;
            paymentScreenshot = donation.paymentScreenshot;
            status = #confirmed;
            donorGender = donation.donorGender;
            proverbId = donation.proverbId;
            proverbFeedback = donation.proverbFeedback;
          };
        } else {
          donation;
        };
      }
    );

    if (confirmedCount == 0) {
      Runtime.trap("All donations already confirmed");
    };
  };

  public shared ({ caller }) func declineDonation(donationId : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can decline donations");
    };

    donations := donations.map<Donation.Record, Donation.Record>(
      func(d) {
        if (d.id == donationId) {
          {
            id = d.id;
            donorId = d.donorId;
            amount = d.amount;
            timestamp = d.timestamp;
            description = d.description;
            paymentScreenshot = d.paymentScreenshot;
            status = #failed;
            donorGender = d.donorGender;
            proverbId = d.proverbId;
            proverbFeedback = d.proverbFeedback;
          };
        } else {
          d;
        };
      }
    );
  };

  public shared ({ caller }) func addSpendingRecord(amount : Nat, description : Text) : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add spending records");
    };

    let spendingId = nextSpendingId.toText();
    nextSpendingId += 1;

    let spending : Spending.Record = {
      id = spendingId;
      amount = amount;
      timestamp = Time.now();
      description = description;
    };
    spendingRecords.add(spending);

    spendingId;
  };

  public shared ({ caller }) func updateSpendingRecord(id : Text, amount : Nat, description : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update spending records");
    };

    spendingRecords := spendingRecords.map<Spending.Record, Spending.Record>(
      func(s) {
        if (s.id == id) {
          {
            id = s.id;
            amount = amount;
            timestamp = s.timestamp;
            description = description;
          };
        } else {
          s;
        };
      }
    );
  };

  public shared ({ caller }) func deleteSpendingRecord(id : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete spending records");
    };

    spendingRecords := spendingRecords.filter(func(s) { s.id != id });
  };

  public shared ({ caller }) func updateDonorProfileAdmin(
    donorId : Text,
    displayName : Text,
    email : ?Text,
    phone : Text,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update donor profiles");
    };

    switch (donorProfiles.get(donorId)) {
      case (?donor) {
        let updatedDonor : Donor.Profile = {
          id = donor.id;
          displayName = displayName;
          email = email;
          phone = phone;
          principal = donor.principal;
          joinedTimestamp = donor.joinedTimestamp;
          totalDonated = donor.totalDonated;
          age = donor.age;
          gender = donor.gender;
          privacyLevel = donor.privacyLevel;
        };
        donorProfiles.add(donorId, updatedDonor);
      };
      case (null) {
        Runtime.trap("Donor not found");
      };
    };
  };

  public query func getTotalDonations() : async Nat {
    let donationsArray = donations.toArray();
    donationsArray.foldLeft<Donation.Record, Nat>(
      0,
      func(total, donation) {
        if (donation.status == #confirmed) {
          total + donation.amount;
        } else {
          total;
        };
      }
    );
  };

  public query func getTotalSpending() : async Nat {
    let spendingArray = spendingRecords.toArray();
    spendingArray.foldLeft<Spending.Record, Nat>(
      0,
      func(total, spending) { total + spending.amount }
    );
  };

  public query func getTrustBalance() : async Int {
    let totalDonations = donations.toArray().foldLeft(
      0,
      func(total, donation) {
        if (donation.status == #confirmed) {
          total + donation.amount;
        } else {
          total;
        };
      }
    );
    let totalSpending = spendingRecords.toArray().foldLeft(
      0,
      func(total, spending) { total + spending.amount }
    );
    totalDonations - totalSpending;
  };

  public query func getDonorPublicProfiles() : async [DonorPublicProfile] {
    let profiles = donorProfiles.values().toArray();
    profiles.map<Donor.Profile, DonorPublicProfile>(
      func(profile) {
        {
          id = profile.id;
          displayName = profile.displayName;
          email = profile.email;
          maskedPhone = maskPhoneNumber(profile.phone);
          principal = profile.principal;
          joinedTimestamp = profile.joinedTimestamp;
          totalDonated = profile.totalDonated;
          age = profile.age;
          gender = profile.gender;
        };
      }
    );
  };

  public query ({ caller }) func getDonorProfiles() : async [DonorProfile] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access full donor profiles");
    };

    let profiles = donorProfiles.values().toArray();
    profiles.sort<Donor.Profile>(
      func(a, b) {
        Int.compare(b.totalDonated, a.totalDonated);
      }
    );
  };

  public query func getDonorPublicProfile(donorId : Text) : async ?DonorPublicProfile {
    switch (donorProfiles.get(donorId)) {
      case (?profile) {
        ?{
          id = profile.id;
          displayName = profile.displayName;
          email = profile.email;
          maskedPhone = maskPhoneNumber(profile.phone);
          principal = profile.principal;
          joinedTimestamp = profile.joinedTimestamp;
          totalDonated = profile.totalDonated;
          age = profile.age;
          gender = profile.gender;
        };
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getDonorProfile(donorId : Text) : async ?DonorProfile {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access full donor profiles");
    };
    donorProfiles.get(donorId);
  };

  public query func getDonations(limit : Nat, offset : Nat) : async [Donation.Record] {
    let allDonations = donations.toArray();
    let size = allDonations.size();
    if (offset >= size) {
      return [];
    };
    let endIndex = Nat.min(offset + limit, size);
    Array.tabulate<Donation.Record>(
      endIndex - offset,
      func(i) { allDonations[offset + i] }
    );
  };

  public query ({ caller }) func getDonorDonations(donorId : Text) : async [Donation.Record] {
    // Check if caller is admin or the donor themselves
    let isAuthorized = if (AccessControl.isAdmin(accessControlState, caller)) {
      true;
    } else {
      switch (donorProfiles.get(donorId)) {
        case (?profile) {
          switch (profile.principal) {
            case (?donorPrincipal) { donorPrincipal == caller };
            case (null) { false };
          };
        };
        case (null) { false };
      };
    };

    if (not isAuthorized) {
      Runtime.trap("Unauthorized: Can only view your own donations");
    };

    let allDonations = donations.toArray();
    allDonations.filter(func(d) { d.donorId == donorId });
  };

  public query func getSpendingRecords(limit : Nat, offset : Nat) : async [Spending.Record] {
    // Spending records are public for transparency
    let allSpending = spendingRecords.toArray();
    let size = allSpending.size();
    if (offset >= size) {
      return [];
    };
    let endIndex = Nat.min(offset + limit, size);
    Array.tabulate<Spending.Record>(
      endIndex - offset,
      func(i) { allSpending[offset + i] }
    );
  };

  func updateDonorTotal(donorId : Text, amount : Nat) {
    switch (donorProfiles.get(donorId)) {
      case (?donor) {
        let updatedDonor : Donor.Profile = {
          id = donor.id;
          displayName = donor.displayName;
          email = donor.email;
          phone = donor.phone;
          principal = donor.principal;
          joinedTimestamp = donor.joinedTimestamp;
          totalDonated = donor.totalDonated + amount;
          age = donor.age;
          gender = donor.gender;
          privacyLevel = donor.privacyLevel;
        };
        donorProfiles.add(donorId, updatedDonor);
      };
      case (null) { };
    };
  };

  public shared ({ caller }) func incrementSiteViews() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can increment site views");
    };
    totalSiteViews += 1;
  };

  public shared ({ caller }) func registerLiveViewer(sessionId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register as live viewers");
    };
    let currentTime = Time.now();
    let newSession : { sessionId : Text; lastHeartbeat : Time.Time } = {
      sessionId;
      lastHeartbeat = currentTime;
    };
    liveViewerSessions.add(sessionId, newSession);
  };

  public shared ({ caller }) func heartbeatLiveViewer(sessionId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can send heartbeats");
    };
    let currentTime = Time.now();
    switch (liveViewerSessions.get(sessionId)) {
      case (?existingSession) {
        let updatedSession : { sessionId : Text; lastHeartbeat : Time.Time } = {
          sessionId = existingSession.sessionId;
          lastHeartbeat = currentTime;
        };
        liveViewerSessions.add(sessionId, updatedSession);
      };
      case (null) {
        let newSession : { sessionId : Text; lastHeartbeat : Time.Time } = {
          sessionId;
          lastHeartbeat = currentTime;
        };
        liveViewerSessions.add(sessionId, newSession);
      };
    };
  };

  public shared ({ caller }) func unregisterLiveViewer(sessionId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can unregister");
    };
    liveViewerSessions.remove(sessionId);
  };

  func cleanupStaleSessions() {
    let now = Time.now();
    let timeoutNs : Int = 60 * 1_000_000_000;
    liveViewerSessions := liveViewerSessions.filter(
      func(_sessionId, session) {
        now - session.lastHeartbeat < timeoutNs;
      }
    );
  };

  public shared ({ caller }) func getSiteMetrics() : async Metrics {
    cleanupStaleSessions();
    let liveViewers = liveViewerSessions.size();
    { totalSiteViews; currentLiveViewers = liveViewers };
  };

  let proverbsList = List.fromArray<{ id : Text; text : Text; author : Text }>([
    {
      id = "1";
      text = "A smile is the universal welcome.";
      author = "Max Eastman";
    },
    {
      id = "2";
      text = "Kindness is a language the deaf can hear and the blind can see.";
      author = "Mark Twain";
    },
    {
      id = "3";
      text = "A single act of kindness throws out roots in all directions.";
      author = "Amelia Earhart";
    },
    {
      id = "4";
      text = "No act of kindness, no matter how small, is ever wasted.";
      author = "Aesop";
    },
    {
      id = "5";
      text = "Happiness is not something ready-made. It comes from your own actions.";
      author = "Dalai Lama";
    },
    {
      id = "6";
      text = "A warm smile is the universal language of kindness.";
      author = "William Arthur Ward";
    },
    {
      id = "7";
      text = "The best way to find yourself is to lose yourself in the service of others.";
      author = "Mahatma Gandhi";
    },
    {
      id = "8";
      text = "The happiest people are not those getting more, but those giving more.";
      author = "H. Jackson Brown Jr.";
    },
    {
      id = "9";
      text = "A gentle word, a kind look, a good-natured smile can work wonders and accomplish miracles.";
      author = "William Hazlitt";
    },
    {
      id = "10";
      text = "The best way to multiply your happiness is to share it with others.";
      author = "Unknown";
    },
    {
      id = "11";
      text = "A kind heart is a fountain of gladness, making everything in its vicinity freshen into smiles.";
      author = "Washington Irving";
    },
    {
      id = "12";
      text = "The best way to find yourself is to lose yourself in the service of others.";
      author = "Mahatma Gandhi";
    },
  ]);

  public query ({ caller }) func getProverbsForDonation(donationId : Text) : async [{
    id : Text;
    text : Text;
    author : Text;
  }] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access proverbs");
    };

    switch (donations.toArray().find(func(d) { d.id == donationId })) {
      case (?donation) {
        if (donation.status != #confirmed) {
          Runtime.trap("Proverbs are only available for confirmed donations");
        };
        switch (donorProfiles.get(donation.donorId)) {
          case (?donorProfile) {
            switch (donorProfile.principal) {
              case (?donorPrincipal) {
                if (donorPrincipal != caller and not AccessControl.isAdmin(accessControlState, caller)) {
                  Runtime.trap("Unauthorized: Can only view proverbs for your own donations");
                };
              };
              case (null) {
                Runtime.trap("Donor principal not found");
              };
            };
          };
          case (null) {
            Runtime.trap("Donor profile not found");
          };
        };
        proverbsList.toArray();
      };
      case (null) {
        Runtime.trap("Donation not found");
      };
    };
  };

  public query ({ caller }) func getAllProverbs() : async [{
    id : Text;
    text : Text;
    author : Text;
  }] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access all proverbs");
    };
    proverbsList.toArray();
  };

  public shared ({ caller }) func selectProverbForDonation(
    donationId : Text,
    proverbId : Nat,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can select proverbs for donations");
    };

    let donationExists = donations.toArray().find(func(d) { 
      d.id == donationId and d.status == #confirmed 
    });

    switch (donationExists) {
      case (?_) {
        let proverbExists = proverbsList.toArray().find(func(p) { 
          p.id == proverbId.toText() 
        });

        switch (proverbExists) {
          case (?_) {
            donations := donations.map<Donation.Record, Donation.Record>(
              func(donation) {
                if (donation.id == donationId) {
                  {
                    id = donation.id;
                    donorId = donation.donorId;
                    amount = donation.amount;
                    timestamp = donation.timestamp;
                    description = donation.description;
                    status = donation.status;
                    paymentScreenshot = donation.paymentScreenshot;
                    donorGender = donation.donorGender;
                    proverbId = ?proverbId;
                    proverbFeedback = donation.proverbFeedback;
                  };
                } else {
                  donation;
                };
              }
            );
          };
          case (null) {
            Runtime.trap("Proverb not found");
          };
        };
      };
      case (null) {
        Runtime.trap("Donation not found or not confirmed");
      };
    };
  };

  public shared ({ caller }) func recordProverbFeedback(
    donationId : Text,
    isLiked : Bool,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can provide feedback");
    };

    switch (donations.toArray().find(func(donation) { donation.id == donationId })) {
      case (?donation) {
        if (donation.status != #confirmed) {
          Runtime.trap("Feedback can only be provided for confirmed donations");
        };
        switch (donation.proverbId) {
          case (?_) {
            switch (donation.donorGender) {
              case (#female) {
                switch (donorProfiles.get(donation.donorId)) {
                  case (?donorProfile) {
                    switch (donorProfile.principal) {
                      case (?donorPrincipal) {
                        if (donorPrincipal != caller) {
                          Runtime.trap("Unauthorized: Can only provide feedback for your own donations");
                        };

                        donations := donations.map<Donation.Record, Donation.Record>(
                          func(d) {
                            if (d.id == donationId) {
                              { d with proverbFeedback = ?isLiked };
                            } else { d };
                          }
                        );
                      };
                      case (null) {
                        Runtime.trap("Donor principal not found");
                      };
                    };
                  };
                  case (null) {
                    Runtime.trap("Donor profile not found");
                  };
                };
              };
              case (_) { Runtime.trap("Only female donors can give feedback") };
            };
          };
          case (null) {
            Runtime.trap("No proverb associated with this donation");
          };
        };
      };
      case (null) { Runtime.trap("Donation not found") };
    };
  };

  public shared ({ caller }) func addServiceActivity(
    title : Text,
    description : Text,
    images : [Storage.ExternalBlob],
    author : Text,
    notes : ?Text,
  ) : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create service activities");
    };

    let serviceId = nextServiceId.toText();
    nextServiceId += 1;

    let activity : Services.ActivityEntry = {
      id = serviceId;
      title;
      description;
      images;
      timestamp = Time.now();
      author;
      notes;
    };

    services.add(activity);
    serviceId;
  };

  public shared ({ caller }) func updateServiceActivity(
    id : Text,
    title : Text,
    description : Text,
    images : [Storage.ExternalBlob],
    author : Text,
    notes : ?Text,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update service activities");
    };

    let activity : Services.ActivityEntry = {
      id;
      title;
      description;
      images;
      timestamp = Time.now();
      author;
      notes;
    };

    services := services.filter(func(entry) { entry.id != id });
    services.add(activity);
  };

  public shared ({ caller }) func deleteServiceActivity(id : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete service activities");
    };

    let originalSize = services.size();
    services := services.filter(func(entry) { entry.id != id });

    if (services.size() == originalSize) {
      Runtime.trap("Service activity not found");
    };
  };

  public query func getServiceActivity(id : Text) : async ?Services.ActivityEntry {
    services.find(func(entry) { entry.id == id });
  };

  public query func getAllServiceActivities(limit : Nat, offset : Nat) : async [Services.ActivityEntry] {
    let entries = services.toArray();
    let size = entries.size();

    // If offset is beyond entries length, return an empty array.
    if (offset >= size) { return [] };

    let end = Nat.min(offset + limit, size);
    if (end == offset) { return [] };

    Array.tabulate(
      end - offset,
      func(i) { entries[offset + i] },
    );
  };

  public query func searchServiceActivitiesByTitle(keyword : Text) : async [Services.ActivityEntry] {
    let filteredEntries = services.toArray().filter(
      func(entry) {
        entry.title.toLower().contains(#text(keyword.toLower()));
      }
    );

    filteredEntries;
  };

  public query func getServiceActivitiesByRecentDays(days : Nat) : async [Services.ActivityEntry] {
    let now = Time.now();
    let nsInDay = 86400 * 1_000_000_000;
    let threshold = now - (days * nsInDay);

    let filteredEntries = services.toArray().filter(func(entry) { entry.timestamp > threshold });

    filteredEntries;
  };

  func maskPhoneNumber(phone : Text) : Text {
    let length = phone.size();
    if (length <= 5) { return phone };
    var result = "";
    for ((i, char) in (phone.chars()).enumerate()) {
      result #= (
        if (i < 5) {
          Text.fromChar(char);
        } else { "*" }
      );
    };
    result;
  };
};
