import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  type OldSpendingRecord = {
    id : Text;
    amount : Nat;
    timestamp : Time.Time;
    description : Text;
  };

  type OldDonorProfile = {
    id : Text;
    displayName : Text;
    email : ?Text;
    phone : Text;
    principal : ?Principal;
    joinedTimestamp : Time.Time;
    totalDonated : Nat;
  };

  type OldDonorPublicProfile = {
    id : Text;
    displayName : Text;
    email : ?Text;
    maskedPhone : Text;
    principal : ?Principal;
    joinedTimestamp : Time.Time;
    totalDonated : Nat;
  };

  type OldUserProfile = {
    name : Text;
    email : ?Text;
    phone : ?Text;
  };

  type OldActor = {
    spendingRecords : List.List<OldSpendingRecord>;
    donorProfiles : Map.Map<Text, OldDonorProfile>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  type Gender = {
    #male;
    #female;
    #other;
    #preferNotToSay;
  };

  type NewDonationRecord = {
    id : Text;
    donorId : Text;
    amount : Nat;
    timestamp : Time.Time;
    description : Text;
    status : { #pending; #confirmed; #failed };
    utr : Text;
  };

  type NewDonorProfile = {
    id : Text;
    displayName : Text;
    email : ?Text;
    phone : Text;
    principal : ?Principal;
    joinedTimestamp : Time.Time;
    totalDonated : Nat;
    age : ?Nat;
    gender : Gender;
  };

  type NewUserProfile = {
    name : Text;
    email : ?Text;
    phone : ?Text;
    gender : Gender;
    age : ?Nat;
  };

  type NewActor = {
    spendingRecords : List.List<OldSpendingRecord>;
    donorProfiles : Map.Map<Text, NewDonorProfile>;
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    let newDonorProfiles = old.donorProfiles.map<Text, OldDonorProfile, NewDonorProfile>(
      func(_id, oldDonor) {
        {
          id = oldDonor.id;
          displayName = oldDonor.displayName;
          email = oldDonor.email;
          phone = oldDonor.phone;
          principal = oldDonor.principal;
          joinedTimestamp = oldDonor.joinedTimestamp;
          totalDonated = oldDonor.totalDonated;
          age = null; // Default new field
          gender = #preferNotToSay; // Default new field
        };
      }
    );

    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_principal, oldUser) {
        {
          name = oldUser.name;
          email = oldUser.email;
          phone = oldUser.phone;
          gender = #preferNotToSay;
          age = null;
        };
      }
    );

    {
      old with
      donorProfiles = newDonorProfiles;
      userProfiles = newUserProfiles;
    };
  };
};
