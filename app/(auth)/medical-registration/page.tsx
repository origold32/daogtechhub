"use client";

import { useState, useRef, useEffect } from "react";
import { FaStethoscope } from "react-icons/fa";
import { TbPasswordUser } from "react-icons/tb";
import StudentGroupIcon from "../../../public/images/student-group-icon";
import PillIcon from "../../../public/images/pill-icon";
import AllergiesIcon from "../../../public/images/allergies-icon";
import StudentInformation from "./student-info";
import ParentInformation from "./parent-info";
import MedicalHistory from "./medical-history";
import Allergies from "./allergies";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import useSWRMutation from "swr/mutation";
import { createRemoteMutationFetcher } from "@/swr";
import {
  AllergiesType,
  MedicalHistoryType,
  ParentInformationType,
  StudentInformationType,
} from "@/types/students";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import PasswordInputV1 from "@/components/password-input-v1";

function Password() {
  const [password, setPassword] = useState("");
  return (
    <PasswordInputV1
      label="Password"
      name="password"
      placeholder="Enter your password"
      onChange={(e) => setPassword(e.target.value)}
      confirmPassword
      required
      className="p-2"
    />
  );
}

const steps = [
  {
    title: "Student Information",
    icon: <StudentGroupIcon />,
    content: StudentInformation,
    endpoint: "/students/1",
  },
  {
    title: "Parent or Guardian",
    icon: <PillIcon />,
    content: ParentInformation,
    endpoint: "/students/2",
  },
  {
    title: "Medical History",
    icon: <FaStethoscope />,
    content: MedicalHistory,
    endpoint: "/students/3",
  },
  {
    title: "Allergies",
    icon: <AllergiesIcon />,
    content: Allergies,
    endpoint: "/students/4",
  },
  {
    title: "Password",
    icon: <TbPasswordUser />,
    content: Password,
    endpoint: "/students/5",
  },
];

export default function Page() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps] = useState(steps.length);
  const [formData, setFormData] = useState({
    payload: {},
    parentsPayload: {},
    medicalHistoryPayload: {},
    allergiesPayload: {},
    password: "",
    student_id: "",
  });
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (viewport) {
      viewport.scrollTop = 0;
    }
  }, [currentStep]);

  const formRefs = useRef<(HTMLFormElement | null)[]>([]);
  const CurrentComponent = steps[currentStep].content;

  const { trigger: submitStudentInfo, isMutating: isSubmittingStudentInfo } =
    useSWRMutation("/students/1", createRemoteMutationFetcher("post"));

  const { trigger: submitParentInfo, isMutating: isSubmittingParentInfo } =
    useSWRMutation("/students/2", createRemoteMutationFetcher("post"));

  const {
    trigger: submitMedicalHistory,
    isMutating: isSubmittingMedicalHistory,
  } = useSWRMutation("/students/3", createRemoteMutationFetcher("post"));

  const { trigger: submitAllergies, isMutating: isSubmittingAllergies } =
    useSWRMutation("/students/4", createRemoteMutationFetcher("post"));

  const {
    trigger: completeRegistration,
    isMutating: isCompletingRegistration,
  } = useSWRMutation("/students/5", createRemoteMutationFetcher("post"));

  const isSubmitting =
    isSubmittingStudentInfo ||
    isSubmittingParentInfo ||
    isSubmittingMedicalHistory ||
    isSubmittingAllergies ||
    isCompletingRegistration;

  const collectFormData = (form: HTMLFormElement) => {
    const formDataObj = new FormData(form);
    const data: Record<string, FormDataEntryValue> = {};

    formDataObj.forEach((value, key) => {
      data[key] = value;
    });

    return data;
  };

  const mapStudentData = (data: StudentInformationType) => ({
    address: data.home || "",
    age: data.age || "",
    department: data.department || "",
    dob: data.dob || "",
    email: data.email || "",
    ethnic_group: data.ethnicGroup || "",
    faculty: data.faculty || "",
    firstname: data.firstName || "",
    gender: data.sex?.toLowerCase() || "male",
    lastname: data.lastName || "",
    marital_status: data.maritalStatus?.toLowerCase() || "single",
    matric_no: data.matricNo || "",
    middlename: data.otherName || "",
    nationality: data.nationality || "",
    passport: data.passport || "",
    phone: data.phoneNumber || "",
    religion: data.religion || "",
  });

  const mapParentData = (data: ParentInformationType) => ({
    name: data.parentName || "",
    fathers_tel_no: data.fatherPhone || "",
    guardian_address: data.guardianHomeAddress || "",
    guardian_name: data.guardianName || "",
    guardian_relationship: data.guardianRelationship?.toLowerCase() || "",
    guardian_tel_no: data.guardianPhone || "",
    home_address: data.parentHomeAddress || "",
    mothers_tel_no: data.motherPhone || "",
    office_address: data.officeAddress || "",
  });

  const mapMedicalData = (data: MedicalHistoryType) => ({
    abnormal_period: data.abnormalPeriod || "",
    chest_disease: data.chestDisease || "",
    digestive_trouble: data.digestiveTrouble || "",
    female_breast_sexual_disease: data.femaleBreastSexualDisease || "",
    heart_trouble: data.heartTrouble || "",
    kidney_bladder_disease: data.kidneyBladderDisease || "",
    mental_disease: data.mentalDisease || "",
    other_illness: data.otherIllness || "",
    present_complaints: data.presentComplaints || "",
    relative_nervous_disease: data.relativeNervousDisease || "",
    relative_tuberculosis: data.relativeTuberculosis || "",
    respiratory_issues: data.respiratoryIssues || "",
    stomach_liver_disease: data.stomachLiverDisease || "",
  });

  const mapAllergiesData = (data: AllergiesType) => ({
    drug_allergy: data.drugAllergy || "",
    environmental_allergy: data.environmentalAllergy || "",
    food_allergy: data.foodAllergy || "",
    insect_allergy: data.insectAllergy || "",
    latex_allergy: data.latexAllergy || "",
    other_allergies: data.otherAllergies || "",
  });

  const handleNext = async () => {
    const currentForm = formRefs.current[currentStep];
    if (currentForm?.checkValidity()) {
      const rawData = collectFormData(currentForm);
      const updatedFormData = { ...formData };

      try {
        switch (currentStep) {
          case 0: {
            const studentData = mapStudentData(
              rawData as StudentInformationType
            );
            updatedFormData.payload = studentData;

            const requestPayload = { payload: studentData };
            setFormData(updatedFormData);

            const response = await submitStudentInfo(requestPayload);

            const studentId = (response as { data?: { id?: string } })?.data
              ?.id;

            if (studentId) {
              updatedFormData.student_id = studentId;
              setFormData(updatedFormData);
            }

            toast.success("Student information saved successfully!");
            break;
          }

          case 1: {
            const parentData = mapParentData(
              rawData as unknown as ParentInformationType
            );
            updatedFormData.parentsPayload = parentData;

            const requestPayload = {
              ...updatedFormData,
              parentsPayload: parentData,
            };
            setFormData(updatedFormData);

            await submitParentInfo(requestPayload);
            toast.success("Parent information saved successfully!");
            break;
          }

          case 2: {
            const medicalData = mapMedicalData(rawData as MedicalHistoryType);
            updatedFormData.medicalHistoryPayload = medicalData;

            const requestPayload = {
              ...updatedFormData,
              medicalHistoryPayload: medicalData,
            };
            setFormData(updatedFormData);

            await submitMedicalHistory(requestPayload);
            toast.success("Medical history saved successfully!");
            break;
          }

          case 3: {
            const allergiesData = mapAllergiesData(rawData as AllergiesType);
            updatedFormData.allergiesPayload = allergiesData;

            const requestPayload = {
              ...updatedFormData,
              allergiesPayload: allergiesData,
            };
            setFormData(updatedFormData);

            await submitAllergies(requestPayload);
            toast.success("Allergies information saved successfully!");
            break;
          }

          case 4: {
            const passwordData = (rawData["password"] as string) || "";
            updatedFormData.password = passwordData;

            const requestPayload = {
              ...updatedFormData,
              password: passwordData,
            };
            setFormData(updatedFormData);

            await completeRegistration(requestPayload);
            toast.success("Registration completed successfully!");
            router.push("/login");
            return;
          }
        }

        if (currentStep < steps.length - 1) {
          setCurrentStep((prev) => prev + 1);
        }
      } catch {
        toast.error(
          `Failed to save ${steps[
            currentStep
          ].title.toLowerCase()}. Please try again.`
        );
      }
    } else {
      currentForm?.reportValidity();
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <>
      <div className="grid grid-cols-2 column-below-450 justify-between items-center">
        <h2 className="text-xl md:text-2xl font-semibold">
          Complete your Medical Record
        </h2>
        <div className="flex flex-col row-below-450 items-end space-y-2">
          <p className="text-sm font-medium">
            {currentStep + 1}/{totalSteps}
          </p>
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-5 md:w-10 h-2 rounded-full transition-all",
                  index <= currentStep ? "bg-[#2CB8FF]" : "bg-[#E7F7FF]"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <TooltipProvider>
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <button
                  disabled={index > currentStep}
                  className={cn(
                    "flex items-center px-2 py-2 gap-1 rounded transition-colors",
                    index === currentStep ? "text-[#1AB2FF]" : "text-[#040404]"
                  )}
                >
                  <span className="w-5">{step.icon}</span>
                  <span className="hide-below-950 text-sm font-medium text-left">
                    {step.title}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="md:hidden">
                <p>{step.title}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      <ScrollArea className="h-[58vh]" ref={scrollAreaRef}>
        <form
          ref={(el) => {
            formRefs.current[currentStep] = el;
          }}
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}
          className="space-y-4"
        >
          <CurrentComponent />
        </form>
      </ScrollArea>

      <div className="flex justify-between">
        {currentStep > 0 ? (
          <button
            onClick={handlePrevious}
            disabled={isSubmitting}
            className={cn(
              "px-4 py-2 text-sm bg-[#FBEAE9] text-[#D42620] rounded-full hover:opacity-90",
              isSubmitting && "opacity-50 cursor-not-allowed"
            )}
          >
            Previous
          </button>
        ) : (
          <div />
        )}

        <Button
          onClick={handleNext}
          disabled={isSubmitting}
          className={cn(
            currentStep === steps.length - 1
              ? "bg-[#324C80] hover:bg-[#29548F]"
              : "bg-[#E67E22] hover:bg-[#e67d22cd]",
            isSubmitting && "opacity-50 cursor-not-allowed"
          )}
        >
          {isSubmitting
            ? "Saving..."
            : currentStep === steps.length - 1
            ? "Complete Registration"
            : "Next"}
        </Button>
      </div>
    </>
  );
}

// "use client";

// import { useState, useRef, useEffect } from "react";
// import { FaStethoscope } from "react-icons/fa";
// import { TbPasswordUser } from "react-icons/tb";
// import StudentGroupIcon from "../../../public/images/student-group-icon";
// import PillIcon from "../../../public/images/pill-icon";
// import AllergiesIcon from "../../../public/images/allergies-icon";
// import StudentInformation from "./student-info";
// import ParentInformation from "./parent-info";
// import MedicalHistory from "./medical-history";
// import Allergies from "./allergies";
// import Password from "./password";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { cn } from "@/lib/utils";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { toast } from "sonner";
// // import useSWRMutation from "swr/mutation";
// // import { createRemoteMutationFetcher } from "@/swr";
// import {
//   AllergiesType,
//   MedicalHistoryType,
//   ParentInformationType,
//   StudentInformationType,
// } from "@/types/students";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import PasswordInputV1 from "@/components/password-input-v1";

// function Password() {
//   const [password, setPassword] = useState("");
//   return (
//     <PasswordInputV1
//       label="Password"
//       name="password"
//       placeholder="Enter your password"
//       onChange={(e) => setPassword(e.target.value)}
//       confirmPassword
//       required
//       className="p-2"
//     />
//   );
// }

// const steps = [
//   {
//     title: "Student Information",
//     icon: <StudentGroupIcon />,
//     content: StudentInformation,
//     endpoint: "/students/1",
//   },
//   {
//     title: "Parent or Guardian",
//     icon: <PillIcon />,
//     content: ParentInformation,
//     endpoint: "/students/2",
//   },
//   {
//     title: "Medical History",
//     icon: <FaStethoscope />,
//     content: MedicalHistory,
//     endpoint: "/students/3",
//   },
//   {
//     title: "Allergies",
//     icon: <AllergiesIcon />,
//     content: Allergies,
//     endpoint: "/students/4",
//   },
//   {
//     title: "Password",
//     icon: <TbPasswordUser />,
//     content: Password,
//     endpoint: "/students/5",
//   },
// ];

// export default function Page() {
//   const router = useRouter();
//   const [currentStep, setCurrentStep] = useState(0);
//   const [totalSteps] = useState(steps.length);
//   const [formData, setFormData] = useState({
//     payload: {},
//     parentsPayload: {},
//     medicalHistoryPayload: {},
//     allergiesPayload: {},
//     password: "",
//     student_id: "",
//   });
//   const scrollAreaRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     const viewport = scrollAreaRef.current?.querySelector(
//       "[data-radix-scroll-area-viewport]"
//     );
//     if (viewport) {
//       viewport.scrollTop = 0;
//     }
//   }, [currentStep]);

//   const formRefs = useRef<(HTMLFormElement | null)[]>([]);
//   const CurrentComponent = steps[currentStep].content;

//   // ===============================
//   // 🔹 Original endpoint logic (commented for now)
//   // ===============================
//   /*
//   const { trigger: submitStudentInfo, isMutating: isSubmittingStudentInfo } =
//     useSWRMutation("/students/1", createRemoteMutationFetcher("post"));

//   const { trigger: submitParentInfo, isMutating: isSubmittingParentInfo } =
//     useSWRMutation("/students/2", createRemoteMutationFetcher("post"));

//   const {
//     trigger: submitMedicalHistory,
//     isMutating: isSubmittingMedicalHistory,
//   } = useSWRMutation("/students/3", createRemoteMutationFetcher("post"));

//   const { trigger: submitAllergies, isMutating: isSubmittingAllergies } =
//     useSWRMutation("/students/4", createRemoteMutationFetcher("post"));

//   const {
//     trigger: completeRegistration,
//     isMutating: isCompletingRegistration,
//   } = useSWRMutation("/students/5", createRemoteMutationFetcher("post"));

//   const isSubmitting =
//     isSubmittingStudentInfo ||
//     isSubmittingParentInfo ||
//     isSubmittingMedicalHistory ||
//     isSubmittingAllergies ||
//     isCompletingRegistration;
//   */

//   // ===============================
//   // 🔹 Mock-only version (for screenshots)
//   // ===============================
//   const isSubmitting = false;

//   const collectFormData = (form: HTMLFormElement) => {
//     const formDataObj = new FormData(form);
//     const data: Record<string, FormDataEntryValue> = {};

//     formDataObj.forEach((value, key) => {
//       data[key] = value;
//     });

//     return data;
//   };

//   const mapStudentData = (data: StudentInformationType) => ({
//     address: data.home || "",
//     age: data.age || "",
//     department: data.department || "",
//     dob: data.dob || "",
//     email: data.email || "",
//     ethnic_group: data.ethnicGroup || "",
//     faculty: data.faculty || "",
//     firstname: data.firstName || "",
//     gender: data.sex?.toLowerCase() || "male",
//     lastname: data.lastName || "",
//     marital_status: data.maritalStatus?.toLowerCase() || "single",
//     matric_no: data.matricNo || "",
//     middlename: data.otherName || "",
//     nationality: data.nationality || "",
//     passport: data.passport || "",
//     phone: data.phoneNumber || "",
//     religion: data.religion || "",
//   });

//   const mapParentData = (data: ParentInformationType) => ({
//     name: data.parentName || "",
//     fathers_tel_no: data.fatherPhone || "",
//     guardian_address: data.guardianHomeAddress || "",
//     guardian_name: data.guardianName || "",
//     guardian_relationship: data.guardianRelationship?.toLowerCase() || "",
//     guardian_tel_no: data.guardianPhone || "",
//     home_address: data.parentHomeAddress || "",
//     mothers_tel_no: data.motherPhone || "",
//     office_address: data.officeAddress || "",
//   });

//   const mapMedicalData = (data: MedicalHistoryType) => ({
//     abnormal_period: data.abnormalPeriod || "",
//     chest_disease: data.chestDisease || "",
//     digestive_trouble: data.digestiveTrouble || "",
//     female_breast_sexual_disease: data.femaleBreastSexualDisease || "",
//     heart_trouble: data.heartTrouble || "",
//     kidney_bladder_disease: data.kidneyBladderDisease || "",
//     mental_disease: data.mentalDisease || "",
//     other_illness: data.otherIllness || "",
//     present_complaints: data.presentComplaints || "",
//     relative_nervous_disease: data.relativeNervousDisease || "",
//     relative_tuberculosis: data.relativeTuberculosis || "",
//     respiratory_issues: data.respiratoryIssues || "",
//     stomach_liver_disease: data.stomachLiverDisease || "",
//   });

//   const mapAllergiesData = (data: AllergiesType) => ({
//     drug_allergy: data.drugAllergy || "",
//     environmental_allergy: data.environmentalAllergy || "",
//     food_allergy: data.foodAllergy || "",
//     insect_allergy: data.insectAllergy || "",
//     latex_allergy: data.latexAllergy || "",
//     other_allergies: data.otherAllergies || "",
//   });

//   const handleNext = async () => {
//     const currentForm = formRefs.current[currentStep];
//     if (currentForm?.checkValidity()) {
//       const rawData = collectFormData(currentForm);
//       const updatedFormData = { ...formData };

//       // ===============================
//       // 🔹 Mock flow (fake success only)
//       // ===============================
//       try {
//         switch (currentStep) {
//           case 0: {
//             const studentData = mapStudentData(
//               rawData as StudentInformationType
//             );
//             updatedFormData.payload = studentData;
//             setFormData(updatedFormData);

//             toast.success("Student information saved successfully!");
//             break;
//           }

//           case 1: {
//             const parentData = mapParentData(
//               rawData as unknown as ParentInformationType
//             );
//             updatedFormData.parentsPayload = parentData;
//             setFormData(updatedFormData);

//             toast.success("Parent information saved successfully!");
//             break;
//           }

//           case 2: {
//             const medicalData = mapMedicalData(rawData as MedicalHistoryType);
//             updatedFormData.medicalHistoryPayload = medicalData;
//             setFormData(updatedFormData);

//             toast.success("Medical history saved successfully!");
//             break;
//           }

//           case 3: {
//             const allergiesData = mapAllergiesData(rawData as AllergiesType);
//             updatedFormData.allergiesPayload = allergiesData;
//             setFormData(updatedFormData);

//             toast.success("Allergies information saved successfully!");
//             break;
//           }

//           case 4: {
//             const passwordData = (rawData["password"] as string) || "";
//             updatedFormData.password = passwordData;
//             setFormData(updatedFormData);

//             toast.success("Registration completed successfully!");
//             router.push("/login");
//             return;
//           }
//         }

//         if (currentStep < steps.length - 1) {
//           setCurrentStep((prev) => prev + 1);
//         }
//       } catch {
//         toast.error(
//           `Failed to save ${steps[
//             currentStep
//           ].title.toLowerCase()}. Please try again.`
//         );
//       }
//     } else {
//       currentForm?.reportValidity();
//     }
//   };

//   const handlePrevious = () => {
//     setCurrentStep((prev) => Math.max(prev - 1, 0));
//   };

//   return (
//     <>
//       <div className="grid grid-cols-2 column-below-450 justify-between items-center">
//         <h2 className="text-xl md:text-2xl font-semibold">
//           Complete your Medical Record
//         </h2>
//         <div className="flex flex-col row-below-450 items-end space-y-2">
//           <p className="text-sm font-medium">
//             {currentStep + 1}/{totalSteps}
//           </p>
//           <div className="flex gap-2">
//             {steps.map((_, index) => (
//               <div
//                 key={index}
//                 className={cn(
//                   "w-5 md:w-10 h-2 rounded-full transition-all",
//                   index <= currentStep ? "bg-[#2CB8FF]" : "bg-[#E7F7FF]"
//                 )}
//               />
//             ))}
//           </div>
//         </div>
//       </div>

//       <TooltipProvider>
//         <div className="flex justify-between items-center">
//           {steps.map((step, index) => (
//             <Tooltip key={index}>
//               <TooltipTrigger asChild>
//                 <button
//                   disabled={index > currentStep}
//                   className={cn(
//                     "flex items-center px-2 py-2 gap-1 rounded transition-colors",
//                     index === currentStep ? "text-[#1AB2FF]" : "text-[#040404]"
//                   )}
//                 >
//                   <span className="w-5">{step.icon}</span>
//                   <span className="hide-below-950 text-sm font-medium text-left">
//                     {step.title}
//                   </span>
//                 </button>
//               </TooltipTrigger>
//               <TooltipContent side="bottom" className="md:hidden">
//                 <p>{step.title}</p>
//               </TooltipContent>
//             </Tooltip>
//           ))}
//         </div>
//       </TooltipProvider>

//       <ScrollArea className="h-[58vh]" ref={scrollAreaRef}>
//         <form
//           ref={(el) => {
//             formRefs.current[currentStep] = el;
//           }}
//           onSubmit={(e) => {
//             e.preventDefault();
//             handleNext();
//           }}
//           className="space-y-4"
//         >
//           <CurrentComponent />
//         </form>
//       </ScrollArea>

//       <div className="flex justify-between">
//         {currentStep > 0 ? (
//           <button
//             onClick={handlePrevious}
//             disabled={isSubmitting}
//             className={cn(
//               "px-4 py-2 text-sm bg-[#FBEAE9] text-[#D42620] rounded-full hover:opacity-90",
//               isSubmitting && "opacity-50 cursor-not-allowed"
//             )}
//           >
//             Previous
//           </button>
//         ) : (
//           <div />
//         )}

//         <Button
//           onClick={handleNext}
//           disabled={isSubmitting}
//           className={cn(
//             currentStep === steps.length - 1
//               ? "bg-[#324C80] hover:bg-[#29548F]"
//               : "bg-[#E67E22] hover:bg-[#e67d22cd]",
//             isSubmitting && "opacity-50 cursor-not-allowed"
//           )}
//         >
//           {isSubmitting
//             ? "Saving..."
//             : currentStep === steps.length - 1
//             ? "Complete Registration"
//             : "Next"}
//         </Button>
//       </div>
//     </>
//   );
// }
