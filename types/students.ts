// Student Medical Record Types

export interface StudentInformationType {
  home?: string;
  age?: string;
  department?: string;
  dob?: string;
  email?: string;
  ethnicGroup?: string;
  faculty?: string;
  firstName?: string;
  sex?: string;
  lastName?: string;
  maritalStatus?: string;
  matricNo?: string;
  otherName?: string;
  nationality?: string;
  passport?: string;
  phoneNumber?: string;
  religion?: string;
}

export interface ParentInformationType {
  parentName: string;
  officeAddress: string;
  fatherPhone: string;
  motherPhone: string;
  parentHomeAddress: string;
  guardianName: string;
  guardianRelationship: string;
  guardianPhone: string;
  guardianHomeAddress: string;
}

export interface MedicalHistoryType {
  mentalDisease?: string;
  respiratoryIssues?: string;
  chestDisease?: string;
  heartTrouble?: string;
  kidneyBladderDisease?: string;
  stomachLiverDisease?: string;
  digestiveTrouble?: string;
  otherIllness?: string;
  relativeTuberculosis?: string;
  relativeNervousDisease?: string;
  // Female-specific fields
  femaleBreastSexualDisease?: string;
  abnormalPeriod?: string;
  // all students
  presentComplaints?: string;
}

export interface AllergiesType {
  drugAllergy?: string;
  foodAllergy?: string;
  environmentalAllergy?: string;
  insectAllergy?: string;
  latexAllergy?: string;
  otherAllergies?: string;
}

export interface CompleteStudentMedicalRecordType {
  studentInfo: StudentInformationType;
  parentInfo: ParentInformationType;
  medicalHistory: MedicalHistoryType;
  allergies: AllergiesType;
}
