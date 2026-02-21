// types/consultations.ts

export type TestUpload =
  | {
      type: "lab";
      testName: string;
      result: string;
      unit?: string;
      normalRange?: string;
      interpretation: string;
    }
  | {
      type: "file";
      testName: string;
      fileName: string;
      url: string;
    };

export type ConversationEntry = {
  title: string;
  discussion: string;
  doctorFeedback?: string;
  testUploads?: TestUpload[];
};

export type Consultation = {
  id: number;
  image: string;
  name: string;
  specialty: string;
  status: "ongoing" | "closed";
  conversation: ConversationEntry[];
  date: string;
  time: string;
};
