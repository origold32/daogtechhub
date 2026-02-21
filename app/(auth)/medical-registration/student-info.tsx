import { IoMailOutline } from "react-icons/io5";
import departments from "@/store/department.json";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { PiPlus } from "react-icons/pi";
import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const faculties = [
  "Allied Health Sciences",
  "Arts",
  "Basic Medical Sciences",
  "Clinical Sciences",
  "Dentistry",
  "Education",
  "Engineering",
  "Law",
  "Management Sciences",
  "Science",
  "Social Sciences",
  "Transport",
];

const maritalStatus = ["Single", "Married", "Divorced", "Widowed", "Separated"];
export default function StudentInformation() {
  const [passportPreview, setPassportPreview] = useState<string | null>(null);
  const [dob, setDob] = useState("");
  const [age, setAge] = useState("");

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setDob(selectedDate);

    if (selectedDate) {
      const birthDate = new Date(selectedDate);
      const today = new Date();

      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();

      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        calculatedAge--;
      }

      setAge(String(calculatedAge));
    } else {
      setAge("");
    }
  };
  const handlePassportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPassportPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col space-y-2">
        <label htmlFor="passport">Upload Passport</label>
        <div
          className="relative border-2 border-[#1AB2FF] border-dashed rounded-md p-2 w-20 aspect-square cursor-pointer hover:bg-[#1AB2FFCC]"
          onClick={() => document.getElementById("passport")?.click()}
        >
          <input
            type="file"
            id="passport"
            accept="image/*"
            className="hidden"
            onChange={handlePassportChange}
          />
          {passportPreview ? (
            <>
              <Image
                src={passportPreview}
                alt="Passport Preview"
                fill
                className="rounded-md object-cover"
              />
              <input type="hidden" name="passport" value={passportPreview} />
              <button
                title="Remove Passport"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPassportPreview(null);
                  const input = document.getElementById(
                    "passport"
                  ) as HTMLInputElement;
                  if (input) input.value = "";
                }}
                className="absolute top-0 right-0 bg-[#D42620] text-white text-xs rounded-full p-1 hover:bg-red-600 cursor-pointer"
              >
                <X size={12} />
              </button>
            </>
          ) : (
            <PiPlus className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#1AB2FF] text-3xl" />
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            placeholder="Gold"
            className="border border-[#ECECEC] rounded-md p-2 w-full"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            placeholder="Ori"
            className="border border-[#ECECEC] rounded-md p-2 w-full"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="otherName">Other Name</label>
          <input
            type="text"
            id="otherName"
            name="otherName"
            placeholder="Oriola"
            className="border border-[#ECECEC] rounded-md p-2 w-full"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="matricNo">Matric No</label>
          <input
            type="text"
            id="matricNo"
            name="matricNo"
            placeholder="210591001"
            maxLength={9}
            className="border border-[#ECECEC] rounded-md p-2 w-full"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="dob">Date of Birth</label>
          <input
            type="date"
            id="dob"
            name="dob"
            value={dob}
            onChange={handleDobChange}
            className="border border-[#ECECEC] rounded-md p-2 w-full"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="age">Age</label>
          <input
            type="text"
            id="age"
            name="age"
            value={age}
            readOnly
            className="border border-[#ECECEC] rounded-md p-2 w-full"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2 px-2">
          <label htmlFor="sex">Sex</label>
          <Select name="sex" defaultValue="">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your sex" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="nationality">Nationality</label>
          <input
            type="text"
            id="nationality"
            name="nationality"
            placeholder="Nigerian"
            className="border border-[#ECECEC] rounded-md p-2 w-full"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="ethnicGroup">Ethnic Group</label>
          <input
            type="text"
            id="ethnicGroup"
            name="ethnicGroup"
            placeholder="Yoruba"
            className="border border-[#ECECEC] rounded-md p-2 w-full"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="religion">Religion</label>
          <input
            type="text"
            id="religion"
            name="religion"
            placeholder="Islam"
            className="border border-[#ECECEC] rounded-md p-2 w-full"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="faculty">Faculty</label>
          <Select name="faculty" defaultValue="">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your faculty" />
            </SelectTrigger>
            <SelectContent>
              {faculties.map((faculty, index) => (
                <SelectItem key={index} value={faculty}>
                  {faculty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="department">Department</label>
          <Select name="department" defaultValue="">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((department, index) => (
                <SelectItem key={index} value={department}>
                  {department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="email">Email Address</label>
          <div className="relative w-full">
            <IoMailOutline className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#292D32]" />
            <input
              type="email"
              id="email"
              name="email"
              placeholder="origold1@gmail.com"
              className="border border-[#ECECEC] rounded-md p-2 pl-10 w-full"
            />
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            placeholder="08123456789"
            className="border border-[#ECECEC] rounded-md p-2 w-full"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="home">Home Address</label>
          <div className="relative w-full">
            <HiOutlineLocationMarker className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#292D32]" />
            <input
              type="text"
              id="home"
              name="home"
              placeholder="5, Itelorun Street, Ijesha, Lagos"
              className="border border-[#ECECEC] rounded-md p-2 pl-10 w-full"
            />
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="maritalStatus">Marital Status</label>
          <Select name="maritalStatus" defaultValue="">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your marital status" />
            </SelectTrigger>
            <SelectContent>
              {maritalStatus.map((status, index) => (
                <SelectItem key={index} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
