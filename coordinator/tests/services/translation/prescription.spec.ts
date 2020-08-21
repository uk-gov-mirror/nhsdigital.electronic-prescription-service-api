import {clone} from "../../resources/test-helpers"
import * as TestResources from "../../resources/test-resources"
import {convertCourseOfTherapyType} from "../../../src/services/translation/prescription"
import {getMedicationRequests} from "../../../src/services/translation/common/getResourcesOfType"

const cases = [
  ["acute", "0001"],
  ["continuous", "0002"],
  ["continuous-repeat-dispensing", "0003"]
]

test.each(cases)("when first therapy type code is %p, convertCourseOfTherapyType returns prescription treatment type code %p",
  (code: string, expected: string) => {
    const bundle = clone(TestResources.examplePrescription1.fhirMessageUnsigned)
    const fhirMedicationRequests = getMedicationRequests(bundle)
    const firstFhirMedicationRequest = fhirMedicationRequests[0]
    firstFhirMedicationRequest.courseOfTherapyType.coding[0].code = code

    const treatmentTypeCode = convertCourseOfTherapyType(firstFhirMedicationRequest).value._attributes.code

    expect(treatmentTypeCode).toEqual(expected)
  })

