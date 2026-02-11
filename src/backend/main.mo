import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Order "mo:core/Order";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

import Char "mo:core/Char";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

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
      utr : Text;
    };
  };

  module Donor {
    public type Profile = {
      id : Text;
      displayName : Text;
      email : ?Text;
      phone : Text;
      principal : ?Principal;
      joinedTimestamp : Time.Time;
      totalDonated : Nat;
    };

    public type PublicProfile = {
      id : Text;
      displayName : Text;
      email : ?Text;
      maskedPhone : Text;
      principal : ?Principal;
      joinedTimestamp : Time.Time;
      totalDonated : Nat;
    };
  };

  module Spending {
    public type Record = {
      id : Text;
      amount : Nat;
      timestamp : Time.Time;
      description : Text;
    };
  };

  public type UserProfile = {
    name : Text;
    email : ?Text;
    phone : ?Text;
  };

  public type Status = Donation.Status;
  public type SpendingRecord = Spending.Record;
  public type DonorProfile = Donor.Profile;
  public type DonationRecord = Donation.Record;
  public type DonorPublicProfile = Donor.PublicProfile;

  type LiveViewerSession = {
    sessionId : Text;
    lastHeartbeat : Time.Time;
  };

  var donations = List.empty<Donation.Record>();
  var spendingRecords = List.empty<Spending.Record>();
  let donorProfiles = Map.empty<Text, Donor.Profile>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextDonationId : Nat = 0;
  var nextSpendingId : Nat = 0;
  var liveViewerSessions = Map.empty<Text, LiveViewerSession>();
  var totalSiteViews : Nat = 0;

  type Metrics = {
    totalSiteViews : Nat;
    currentLiveViewers : Nat;
  };

  type DonationInput = {
    donorId : Text;
    amount : Nat;
    description : Text;
    displayName : Text;
    email : ?Text;
    phone : Text;
    utr : Text;
  };

  // User Profile Management (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
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
    userProfiles.add(caller, profile);
  };

  func isValidIndianPhoneNumber(phone : Text) : Bool {
    if (phone.size() != 13) { return false };
    if (not phone.startsWith(#text("+91")) or phone.startsWith(#text("+910"))) { return false };
    let chars = phone.chars().toArray();
    for (i in Nat.range(3, 13)) {
      if (i >= chars.size()) { return false };
      let c = chars[i];
      switch (i) {
        case (3) {
          if (c < '6' or c > '9') { return false };
        };
        case (_) {
          if (c < '0' or c > '9') { return false };
        };
      };
    };
    true;
  };

  // Public donation function
  public shared ({ caller }) func addDonation(donationInput : DonationInput) : async Text {
    if (not isValidIndianPhoneNumber(donationInput.phone)) {
      Runtime.trap("Invalid mobile number! Must be a valid 10-digit Indian mobile number with +91 country code and not 0-prefixed after +91");
    };

    if (donationInput.utr.trim(#char ' ').size() != 12) {
      Runtime.trap("UTR must be 12 characters");
    };

    if (donationInput.amount < 10) {
      Runtime.trap("Amount must be at least 10");
    };

    let donationId = nextDonationId.toText();
    let newDonation = {
      id = donationId;
      donorId = donationInput.donorId;
      amount = donationInput.amount;
      description = donationInput.description;
      timestamp = Time.now();
      utr = donationInput.utr;
      status = #pending;
    };

    donations.add(newDonation);
    nextDonationId += 1;

    switch (donorProfiles.get(donationInput.donorId)) {
      case (?donor) {
        let newDonor = {
          id = donor.id;
          displayName = if (donationInput.displayName != "") { donationInput.displayName } else { donor.displayName };
          email = switch (donationInput.email) { case (?e) { ?e }; case (null) { donor.email } };
          phone = donationInput.phone;
          principal = donor.principal;
          joinedTimestamp = donor.joinedTimestamp;
          totalDonated = donor.totalDonated;
        };

        donorProfiles.add(donationInput.donorId, newDonor);
      };
      case (null) {
        let newDonor = {
          id = donationInput.donorId;
          displayName = donationInput.displayName;
          email = donationInput.email;
          phone = donationInput.phone;
          principal = if (caller.isAnonymous()) { null } else { ?caller };
          joinedTimestamp = Time.now();
          totalDonated = 0;
        };
        donorProfiles.add(donationInput.donorId, newDonor);
      };
    };

    donationId;
  };

  // Admin-only: Confirm a donation
  public shared ({ caller }) func confirmDonation(donationId : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can confirm donations");
    };

    donations := donations.map<Donation.Record, Donation.Record>(
      func(d) {
        if (d.id == donationId) {
          // Update donor total when confirming
          updateDonorTotal(d.donorId, d.amount);
          {
            id = d.id;
            donorId = d.donorId;
            amount = d.amount;
            timestamp = d.timestamp;
            description = d.description;
            utr = d.utr;
            status = #confirmed;
          };
        } else {
          d;
        };
      }
    );
  };

  public shared ({ caller }) func confirmAllPendingDonations() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("You need to be an admin to confirm all pending donations");
    };

    var confirmedCount = 0;

    donations := donations.map<Donation.Record, Donation.Record>(
      func(donation) {
        if (donation.status == #pending) {
          confirmedCount += 1;
          // Update donor total when confirming
          updateDonorTotal(donation.donorId, donation.amount);

          {
            id = donation.id;
            donorId = donation.donorId;
            amount = donation.amount;
            timestamp = donation.timestamp;
            description = donation.description;
            utr = donation.utr;
            status = #confirmed;
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

  // Admin-only: Decline a donation
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
            utr = d.utr;
            status = #failed;
          };
        } else {
          d;
        };
      }
    );
  };

  // Admin-only: Add spending record
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

  // Admin-only: Update spending record
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

  // Admin-only: Delete spending record
  public shared ({ caller }) func deleteSpendingRecord(id : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete spending records");
    };

    spendingRecords := spendingRecords.filter(func(s) { s.id != id });
  };

  // Admin-only: Update donor profile
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

  public query ({ caller }) func getDonorPublicProfiles() : async [DonorPublicProfile] {
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

  public query ({ caller }) func getDonorPublicProfile(donorId : Text) : async ?DonorPublicProfile {
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

  public query func getDonorDonations(donorId : Text) : async [Donation.Record] {
    let allDonations = donations.toArray();
    allDonations.filter(func(d) { d.donorId == donorId });
  };

  public query func getSpendingRecords(limit : Nat, offset : Nat) : async [Spending.Record] {
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
        };
        donorProfiles.add(donorId, updatedDonor);
      };
      case (null) {
        // Should not happen if updateDonorProfile was called first
      };
    };
  };

  public shared ({ caller }) func incrementSiteViews() : async () {
    totalSiteViews += 1;
  };

  public shared ({ caller }) func registerLiveViewer(sessionId : Text) : async () {
    let currentTime = Time.now();
    let newSession : LiveViewerSession = {
      sessionId;
      lastHeartbeat = currentTime;
    };
    liveViewerSessions.add(sessionId, newSession);
  };

  public shared ({ caller }) func heartbeatLiveViewer(sessionId : Text) : async () {
    let currentTime = Time.now();
    switch (liveViewerSessions.get(sessionId)) {
      case (?existingSession) {
        let updatedSession : LiveViewerSession = {
          sessionId = existingSession.sessionId;
          lastHeartbeat = currentTime;
        };
        liveViewerSessions.add(sessionId, updatedSession);
      };
      case (null) {
        let newSession : LiveViewerSession = {
          sessionId;
          lastHeartbeat = currentTime;
        };
        liveViewerSessions.add(sessionId, newSession);
      };
    };
  };

  public shared ({ caller }) func unregisterLiveViewer(sessionId : Text) : async () {
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

  public query func getSiteMetrics() : async Metrics {
    cleanupStaleSessions();
    let liveViewers = liveViewerSessions.size();
    { totalSiteViews; currentLiveViewers = liveViewers };
  };
};
