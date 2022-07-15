export interface Activity {
  uid: string;
  isOngoingWeekly: boolean;
}

export interface Section {
  uid: string;
  activity?: Activity;
}

// eslint-disable-next-line
export interface Activity {
  section?: Section;
}

// eslint-disable-next-line
const a: Activity = {
  uid: "123",
  isOngoingWeekly: true,
  section: {
    uid: "345",
    activity: {
      uid: "123",
      isOngoingWeekly: false
    }
  }
};
