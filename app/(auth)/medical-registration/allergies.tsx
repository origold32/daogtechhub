export default function Allergies() {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <p className="font-medium">Are you allergic to any of the following?</p>

        <div className="flex flex-col space-y-2">
          <label htmlFor="drugAllergy" className="text-sm">
            (a) Any drugs or medications (e.g., penicillin, aspirin)?
          </label>
          <input
            type="text"
            id="drugAllergy"
            name="drugAllergy"
            className="border border-[#ECECEC] rounded-md p-2 w-full"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="foodAllergy" className="text-sm">
            (b) Any foods (e.g., nuts, eggs, seafood)?
          </label>
          <input
            type="text"
            id="foodAllergy"
            name="foodAllergy"
            className="border border-[#ECECEC] rounded-md p-2 w-full"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="environmentalAllergy" className="text-sm">
            (c) Environmental triggers (e.g., pollen, dust, mold)?
          </label>
          <input
            type="text"
            id="environmentalAllergy"
            name="environmentalAllergy"
            className="border border-[#ECECEC] rounded-md p-2 w-full"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="insectAllergy" className="text-sm">
            (d) Insect stings or bites (e.g., bees, wasps)?
          </label>
          <input
            type="text"
            id="insectAllergy"
            name="insectAllergy"
            className="border border-[#ECECEC] rounded-md p-2 w-full"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="latexAllergy" className="text-sm">
            (e) Latex or rubber products?
          </label>
          <input
            type="text"
            id="latexAllergy"
            name="latexAllergy"
            className="border border-[#ECECEC] rounded-md p-2 w-full"
          />
        </div>

        <div className="flex flex-col space-y-2 mt-4">
          <label htmlFor="otherAllergies" className="text-sm font-medium">
            Any other known allergies or allergic reactions:
          </label>
          <textarea
            id="otherAllergies"
            name="otherAllergies"
            rows={3}
            className="border border-[#ECECEC] rounded-md p-2 w-full"
          />
        </div>
      </div>
    </div>
  );
}
