export interface Guideline {
  id: number;
  title: string;
  description: string;
  icon: string;
}

export const getCommunityGuidelines = (t: any): Guideline[] => [
  {
    id: 1,
    title: t("guidelines.first.title"),
    description: t("guidelines.first.description"),
    icon: "heart-outline"
  },
  {
    id: 2,
    title: t("guidelines.second.title"),
    description: t("guidelines.second.description"),
    icon: "people-outline"
  },
  {
    id: 3,
    title: t("guidelines.third.title"),
    description: t("guidelines.third.description"),
    icon: "shield-checkmark-outline"
  },
  {
    id: 4,
    title: t("guidelines.fourth.title"),
    description: t("guidelines.fourth.description"),
    icon: "lock-closed-outline"
  },
  {
    id: 5,
    title: t("guidelines.fifth.title"),
    description: t("guidelines.fifth.description"),
    icon: "chatbubble-outline"
  },
  {
    id: 6,
    title: t("guidelines.sixth.title"),
    description: t("guidelines.sixth.description"),
    icon: "flag-outline"
  },
  {
    id: 7,
    title: t("guidelines.seventh.title"),
    description: t("guidelines.seventh.description"),
    icon: "person-outline"
  },
  {
    id: 8,
    title: t("guidelines.eighth.title"),
    description: t("guidelines.eighth.description"),
    icon: "globe-outline"
  },
  {
    id: 9,
    title: t("guidelines.ninth.title"),
    description: t("guidelines.ninth.description"),
    icon: "ban-outline"
  },
  {
    id: 10,
    title: t("guidelines.tenth.title"),
    description: t("guidelines.tenth.description"),
    icon: "chatbubbles-outline"
  },
  {
    id: 11,
    title: t("guidelines.eleventh.title"),
    description: t("guidelines.eleventh.description"),
    icon: "eye-off-outline"
  },
  {
    id: 12,
    title: t("guidelines.twelfth.title"),
    description: t("guidelines.twelfth.description"),
    icon: "business-outline"
  },
  {
    id: 13,
    title: t("guidelines.thirteenth.title"),
    description: t("guidelines.thirteenth.description"),
    icon: "settings-outline"
  },
  {
    id: 14,
    title: t("guidelines.fourteenth.title"),
    description: t("guidelines.fourteenth.description"),
    icon: "school-outline"
  },
  {
    id: 15,
    title: t("guidelines.fifteenth.title"),
    description: t("guidelines.fifteenth.description"),
    icon: "remove-circle-outline"
  },
  {
    id: 16,
    title: t("guidelines.sixteenth.title"),
    description: t("guidelines.sixteenth.description"),
    icon: "happy-outline"
  },
  {
    id: 17,
    title: t("guidelines.seventeenth.title"),
    description: t("guidelines.seventeenth.description"),
    icon: "mail-outline"
  },
  {
    id: 18,
    title: t("guidelines.eighteenth.title"),
    description: t("guidelines.eighteenth.description"),
    icon: "time-outline"
  },
  {
    id: 19,
    title: t("guidelines.nineteenth.title"),
    description: t("guidelines.nineteenth.description"),
    icon: "camera-outline"
  },
  {
    id: 20,
    title: t("guidelines.twentieth.title"),
    description: t("guidelines.twentieth.description"),
    icon: "document-text-outline"
  }
];
