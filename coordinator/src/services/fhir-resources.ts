export interface Resource {
    id?: string
    resourceType: string
}

export interface Bundle extends Resource {
    entry: Array<BundleEntry>
}

export interface BundleEntry {
    fullUrl?: string
    resource?: Resource
}

export interface Identifier {
    system?: string
    value?: string
}

interface MedicationRequestGroupIdentifier extends Identifier {
    extension?: Array<IdentifierExtension>
}

export interface MedicationRequest extends Resource {
    identifier?: Array<Identifier>
    category?: Array<CodeableConcept>
    medicationCodeableConcept: CodeableConcept
    subject: Reference<Patient>
    authoredOn?: string
    requester?: Reference<PractitionerRole>
    groupIdentifier?: MedicationRequestGroupIdentifier
    courseOfTherapyType?: CodeableConcept
    dosageInstruction?: Array<Dosage>
    dispenseRequest?: MedicationRequestDispenseRequest
    extension?: Array<Extension>
}

export interface CodeableConcept {
    coding: Array<Coding>
}

export interface Coding {
    system?: string
    code?: string
    display?: string
    version?: number
}

export interface Reference<T extends Resource> {
    reference: string
}

export interface Dosage {
    text?: string
}

export interface MedicationRequestDispenseRequest {
    quantity?: SimpleQuantity
    performer?: Reference<Organization>
    validityPeriod?: Period
}

export interface SimpleQuantity {
    value?: string
    unit?: string
    system?: string
    code?: string
}

export interface Patient extends Resource {
    identifier?: Array<Identifier>
    name?: Array<HumanName>
    telecom?: Array<ContactPoint>
    gender?: string
    birthDate?: string
    address?: Array<Address>
    generalPractitioner?: Array<Reference<PractitionerRole>>
}

export interface HumanName {
    use?: string
    family?: string
    given?: Array<string>
    prefix?: Array<string>
    suffix?: Array<string>
}

export interface ContactPoint {
    system?: string
    value?: string
    use?: string
    rank?: number //TODO use this as a tie-breaker
}

export interface Address {
    use?: string
    type?: string
    text?: string
    line?: Array<string>
    city?: string
    district?: string
    state?: string
    postalCode?: string
}

export interface PractitionerRole extends Resource {
    practitioner?: Reference<Practitioner>
    organization?: Reference<Organization>
}

export interface Practitioner extends Resource {
    identifier?: Array<Identifier>
    name?: Array<HumanName>
    telecom?: Array<ContactPoint>
    address?: Array<Address>
}

export interface Organization extends Resource {
    identifier?: Array<Identifier>
    type?: Array<CodeableConcept>
    name?: string
    telecom?: Array<ContactPoint>
    address?: Array<Address>
    partOf?: Reference<Organization>
}

export interface OperationOutcomeIssue {
    severity: string
    code: string
    details: CodeableConcept
}

export interface OperationOutcome {
    resourceType: "OperationOutcome"
    issue: Array<OperationOutcomeIssue>
}

export interface Parameters {
    resourceType: "Parameters"
    parameter: Array<Parameter>
}

export interface Parameter {
    name: string
    valueString: string
}

export interface Extension {
    url: string
}

export interface IdentifierExtension extends Extension {
    valueIdentifier: Identifier
}

export interface CodingExtension extends Extension {
    valueCoding: Coding
}

export interface ReferenceExtension<T extends Resource> extends Extension {
    valueReference: Reference<T>
}

interface Signature {
    who: Reference<PractitionerRole>
    data: string
}

export interface Provenance extends Resource {
    signature: Array<Signature>
}

export interface Period {
    start: string
    end: string
}
