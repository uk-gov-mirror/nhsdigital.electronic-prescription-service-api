import * as extension from "./extension"
import * as common from "./common"
import * as patient from "./patient"
import * as medicationRequest from "./medication-request"
import * as practitionerRole from "./practitioner-role"

export interface MedicationDispense extends common.Resource {
    identifier: Array<common.Identifier>
    extension?: Array<extension.CodingExtension>
    medicationCodeableConcept: common.CodeableConcept
    subject: common.IdentifierReference<patient.Patient>
    quantity: common.SimpleQuantity
    authorizingPrescription: Array<AuthorizingPrescription>
    whenPrepared: string
    dosageInstruction: Array<medicationRequest.Dosage>
    performer: Array<DispensePerformer>
    type: common.CodeableConcept
}

export interface AuthorizingPrescription extends common.IdentifierReference<medicationRequest.MedicationRequest> {
    extension: Array<AuthorizingPrescriptionExtension>
}

export type AuthorizingPrescriptionExtension = extension.IdentifierExtension

export interface DispensePerformer {
    actor: Actor
}

export interface Actor extends common.IdentifierReference<practitionerRole.PersonOrOrganization> {
    type: "Practitioner" |  "PractitionerRole" | "Organization"
}
