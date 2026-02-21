import { HiOutlineLocationMarker } from "react-icons/hi";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const relationship = [
  "Father",
  "Mother",
  "Uncle",
  "Aunt",
  "Brother",
  "Sister",
  "Other",
];

export default function ParentInformation() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h6 className="text-sm font-semibold">PARENT</h6>

        <div className="flex flex-col space-y-2">
          <label htmlFor="parentName">Name</label>
          <input
            type="text"
            id="parentName"
            name="parentName"
            placeholder="Parent name"
            className="border border-[#ECECEC] rounded-md p-2 w-full"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="officeAddress">Office Address</label>
          <div className="relative">
            <HiOutlineLocationMarker className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#292D32]" />
            <input
              type="text"
              id="officeAddress"
              name="officeAddress"
              placeholder="Enter your office address"
              className="border border-[#ECECEC] rounded-md p-2 pl-10 w-full"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="fatherPhone">Father’s Telephone No.</label>
            <input
              type="tel"
              id="fatherPhone"
              name="fatherPhone"
              placeholder="08123456789"
              className="border border-[#ECECEC] rounded-md p-2 w-full"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="motherPhone">Mother’s Telephone No.</label>
            <input
              type="tel"
              id="motherPhone"
              name="motherPhone"
              placeholder="08123456789"
              className="border border-[#ECECEC] rounded-md p-2 w-full"
            />
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="parentHomeAddress">Home Address</label>
          <div className="relative">
            <HiOutlineLocationMarker className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#292D32]" />
            <input
              type="text"
              id="parentHomeAddress"
              name="parentHomeAddress"
              placeholder="5, Itelorun Street, Ijesha, Lagos"
              className="border border-[#ECECEC] rounded-md p-2 pl-10 w-full"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h6 className="text-sm font-semibold">LOCAL GUARDIAN</h6>

        <div className="flex flex-col space-y-2">
          <label htmlFor="guardianName">Name</label>
          <input
            type="text"
            id="guardianName"
            name="guardianName"
            placeholder="Guardian name"
            className="border border-[#ECECEC] rounded-md p-2 w-full"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="guardianRelationship">Relationship</label>
            <Select name="guardianRelationship" defaultValue="">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your relationship" />
              </SelectTrigger>
              <SelectContent>
                {relationship.map((relation, index) => (
                  <SelectItem key={index} value={relation}>
                    {relation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="guardianPhone">Telephone No.</label>
            <input
              type="tel"
              id="guardianPhone"
              name="guardianPhone"
              placeholder="08123456789"
              className="border border-[#ECECEC] rounded-md p-2 w-full"
            />
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="guardianHomeAddress">Home Address</label>
          <div className="relative">
            <HiOutlineLocationMarker className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#292D32]" />
            <input
              type="text"
              id="guardianHomeAddress"
              name="guardianHomeAddress"
              placeholder="5, Itelorun Street, Ijesha, Lagos"
              className="border border-[#ECECEC] rounded-md p-2 pl-10 w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
