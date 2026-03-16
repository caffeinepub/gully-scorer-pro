import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";

actor {
  let matchSummaries = Map.empty<Text, Text>();

  public shared ({ caller }) func saveMatchSummary(key : Text, data : Text) : async () {
    matchSummaries.add(key, data);
  };

  public query ({ caller }) func getMatchSummary(key : Text) : async Text {
    switch (matchSummaries.get(key)) {
      case (?data) { data };
      case (null) { "" };
    };
  };

  public query ({ caller }) func listMatchKeys() : async [Text] {
    matchSummaries.keys().toArray();
  };
};
