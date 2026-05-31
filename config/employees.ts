export interface Employee {
  id: string;
  name: string;
  image: string;
  email: string;
}

/** עובדים קשיחים — לא נשמרים ב-DB */
export const employees: Employee[] = [
  {
    id: "2",
    name: "שלומי",
    image: "https://media.licdn.com/dms/image/v2/C4D03AQEeXCeVBEqzPg/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1516534493721?e=1781136000&v=beta&t=Cn_Cfkn9CbXK87u0WzeeNbgHg9HQw3VCPbFYqvUlLjA",
    email: "shlomi@upnext.co.il",
  },
  {
    id: "1",
    name: "חיים",
    image: "https://media.licdn.com/dms/image/v2/C4D03AQFSpNb62lZesA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1660472911563?e=1781136000&v=beta&t=8dpanCoCeIHCXDXVUFRdQUDeN9RFuD1zzEP9X9ictMo",
    email: "haim@upnext.co.il",
  },
  {
    id: "3",
    name: "תומר",
    image: "https://media.licdn.com/dms/image/v2/D4D03AQFvmlLxuq6HnQ/profile-displayphoto-shrink_800_800/B4DZTW.5c8G8Ac-/0/1738773600654?e=1781136000&v=beta&t=lOpnZRqpRK4GYBTGwI1zYYX-lkUZPUAvz6eocYN_tlY",
    email: "tomer@upnext.co.il",
  },
  {
    id: "4",
    name: "אילן",
    image: "https://i.pravatar.cc/150?u=michal",
    email: "ilan@upnext.co.il",
  },
];

export const UNASSIGNED_TAB_ID = "unassigned";

export const UNASSIGNED_TAB_NAME = "לא משויך";
