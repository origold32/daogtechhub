export default function MedicalHistory() {
  return (
    <div className="space-y-4">
      <h6 className="text-sm font-semibold">(Personal & Family)</h6>

      <div className="space-y-3">
        <p className="font-medium">Have you suffered (if so, when) from:</p>

        <div className="flex flex-col space-y-2">
          <label htmlFor="mentalDisease" className="text-sm">
            (a) Any mental disease?
          </label>
          <input
            type="text"
            id="mentalDisease"
            name="mentalDisease"
            className="border border-[#ECECEC] rounded-md p-2 w-full"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="respiratoryIssues" className="text-sm">
            (b) Asthma, blood-spitting, pleurisy of lungs?
          </label>
          <input
            type="text"
            id="respiratoryIssues"
            name="respiratoryIssues"
            className="border border-[#ECECEC] rounded-md p-2 w-full"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="chestDisease" className="text-sm">
            (c) Any disease of chest or lungs?
          </label>
          <input
            type="text"
            id="chestDisease"
            name="chestDisease"
            className="border border-[#ECECEC] rounded-md p-2 w-full"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="heartTrouble" className="text-sm">
            (d) Heart trouble of any kind?
          </label>
          <input
            type="text"
            id="heartTrouble"
            name="heartTrouble"
            className="border border-[#ECECEC] rounded-md p-2 w-full"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="kidneyBladderDisease" className="text-sm">
            (e) Any disease of the kidney or bladder?
          </label>
          <input
            type="text"
            id="kidneyBladderDisease"
            name="kidneyBladderDisease"
            className="border border-[#ECECEC] rounded-md p-2 w-full"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="stomachLiverDisease" className="text-sm">
            (f) Any disease of the stomach or liver?
          </label>
          <input
            type="text"
            id="stomachLiverDisease"
            name="stomachLiverDisease"
            className="border border-[#ECECEC] rounded-md p-2 w-full"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="digestiveTrouble" className="text-sm">
            (g) Any digestive trouble?
          </label>
          <input
            type="text"
            id="digestiveTrouble"
            name="digestiveTrouble"
            className="border border-[#ECECEC] rounded-md p-2 w-full"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="otherIllness" className="text-sm">
            (h) Any other illness, injury or operation?
          </label>
          <input
            type="text"
            id="otherIllness"
            name="otherIllness"
            className="border border-[#ECECEC] rounded-md p-2 w-full"
          />
        </div>

        <p className="font-medium mt-4">
          Has any of your near relative suffered from:
        </p>

        <div className="flex flex-col space-y-2">
          <label htmlFor="relativeTuberculosis" className="text-sm">
            (a) Tuberculosis?
          </label>
          <input
            type="text"
            id="relativeTuberculosis"
            name="relativeTuberculosis"
            className="border border-[#ECECEC] rounded-md p-2 w-full"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="relativeNervousDisease" className="text-sm">
            (b) Nervous disease?
          </label>
          <input
            type="text"
            id="relativeNervousDisease"
            name="relativeNervousDisease"
            className="border border-[#ECECEC] rounded-md p-2 w-full"
          />
        </div>

        {/* {sex === "Female" && (
        )} */}

        <>
          <p className="font-medium mt-4">For Female Students:</p>

          <div className="flex flex-col space-y-2">
            <label htmlFor="femaleBreastSexualDisease" className="text-sm">
              (a) Have you suffered from disease of the breast or sexual organ?
            </label>
            <input
              type="text"
              id="femaleBreastSexualDisease"
              name="femaleBreastSexualDisease"
              className="border border-[#ECECEC] rounded-md p-2 w-full"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="abnormalPeriod" className="text-sm">
              (b) Do you have abnormal menstrual period at any time?
            </label>
            <input
              type="text"
              id="abnormalPeriod"
              name="abnormalPeriod"
              className="border border-[#ECECEC] rounded-md p-2 w-full"
            />
          </div>
        </>
        <div className="flex flex-col space-y-2 mt-4">
          <label htmlFor="presentComplaints" className="text-sm font-medium">
            Present Complaints:
          </label>
          <textarea
            id="presentComplaints"
            name="presentComplaints"
            rows={3}
            className="border border-[#ECECEC] rounded-md p-2 w-full"
          />
        </div>
      </div>
    </div>
  );
}
