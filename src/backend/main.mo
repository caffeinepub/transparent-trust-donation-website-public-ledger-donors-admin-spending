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
    };
  };

  module Donor {
    public type Profile = {
      id : Text;
      displayName : Text;
      email : ?Text;
      phone : ?Text;
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

  var donations = List.empty<Donation.Record>();
  var spendingRecords = List.empty<Spending.Record>();
  let donorProfiles = Map.empty<Text, Donor.Profile>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextDonationId : Nat = 0;
  var nextSpendingId : Nat = 0;

  type DonationInput = {
    donorId : Text;
    amount : Nat;
    description : Text;
    displayName : Text;
    email : ?Text;
    phone : ?Text;
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

  // Public donation function - accessible to everyone including guests
  public shared ({ caller }) func addDonation(donationInput : DonationInput) : async Text {
    let donationId = nextDonationId.toText();
    nextDonationId += 1;

    let donation : Donation.Record = {
      id = donationId;
      donorId = donationInput.donorId;
      amount = donationInput.amount;
      timestamp = Time.now();
      description = donationInput.description;
      status = #pending;
    };
    donations.add(donation);

    // Create or update donor profile
    updateDonorProfile(
      donationInput.donorId,
      donationInput.displayName,
      donationInput.email,
      donationInput.phone,
      if (caller.isAnonymous()) { null } else { ?caller },
    );

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
            status = #confirmed;
          };
        } else {
          d;
        };
      }
    );
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
    phone : ?Text,
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

  // Public query: Get total confirmed donations
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

  // Public query: Get total spending
  public query func getTotalSpending() : async Nat {
    let spendingArray = spendingRecords.toArray();
    spendingArray.foldLeft<Spending.Record, Nat>(
      0,
      func(total, spending) { total + spending.amount }
    );
  };

  // Public query: Get trust balance (donations - spending)
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

  // Public query: Get donor profiles sorted by total donated
  public query func getDonorProfiles() : async [Donor.Profile] {
    let profiles = donorProfiles.values().toArray();
    profiles.sort<Donor.Profile>(
      func(a, b) {
        Int.compare(b.totalDonated, a.totalDonated);
      }
    );
  };

  // Public query: Get specific donor profile
  public query func getDonorProfile(donorId : Text) : async ?Donor.Profile {
    donorProfiles.get(donorId);
  };

  // Public query: Get donations with pagination
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

  // Public query: Get donations for a specific donor
  public query func getDonorDonations(donorId : Text) : async [Donation.Record] {
    let allDonations = donations.toArray();
    allDonations.filter(func(d) { d.donorId == donorId });
  };

  // Public query: Get spending records with pagination
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

  // Helper function to update donor profile
  func updateDonorProfile(
    donorId : Text,
    displayName : Text,
    email : ?Text,
    phone : ?Text,
    principal : ?Principal,
  ) {
    switch (donorProfiles.get(donorId)) {
      case (?donor) {
        let updatedDonor : Donor.Profile = {
          id = donor.id;
          displayName = if (displayName != "") { displayName } else { donor.displayName };
          email = switch (email) { case (?e) { ?e }; case (null) { donor.email } };
          phone = switch (phone) { case (?p) { ?p }; case (null) { donor.phone } };
          principal = switch (principal) { case (?p) { ?p }; case (null) { donor.principal } };
          joinedTimestamp = donor.joinedTimestamp;
          totalDonated = donor.totalDonated;
        };
        donorProfiles.add(donorId, updatedDonor);
      };
      case (null) {
        let newDonor : Donor.Profile = {
          id = donorId;
          displayName = displayName;
          email = email;
          phone = phone;
          principal = principal;
          joinedTimestamp = Time.now();
          totalDonated = 0;
        };
        donorProfiles.add(donorId, newDonor);
      };
    };
  };

  // Helper function to update donor total (only for confirmed donations)
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
};
