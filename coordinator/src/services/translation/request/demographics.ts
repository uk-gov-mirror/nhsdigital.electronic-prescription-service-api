import {InvalidValueError} from "../../../models/errors/processing-errors"
import {isTruthy} from "../common"
import * as hl7V3 from "../../../models/hl7-v3"
import * as fhir from "../../../models/fhir"

export function convertName(fhirHumanName: fhir.HumanName, fhirPath: string): hl7V3.Name {
  const name = new hl7V3.Name()
  if (fhirHumanName.use) {
    name._attributes = {
      use: convertNameUse(fhirHumanName.use, fhirPath)
    }
  }
  if (fhirHumanName.prefix) {
    name.prefix = fhirHumanName.prefix.map(name => new hl7V3.Text(name))
  }
  if (fhirHumanName.given) {
    name.given = fhirHumanName.given.map(name => new hl7V3.Text(name))
  }
  if (fhirHumanName.family) {
    name.family = new hl7V3.Text(fhirHumanName.family)
  }
  if (fhirHumanName.suffix) {
    name.suffix = fhirHumanName.suffix.map(name => new hl7V3.Text(name))
  }
  return name
}

function convertNameUse(fhirNameUse: string, fhirPath: string) {
  switch (fhirNameUse) {
    case "usual":
    case "official":
      return hl7V3.NameUse.USUAL
    case "temp":
    case "anonymous":
      return hl7V3.NameUse.ALIAS
    case "nickname":
      return hl7V3.NameUse.PREFERRED
    case "old":
      return hl7V3.NameUse.PREVIOUS
    case "maiden":
      return hl7V3.NameUse.PREVIOUS_MAIDEN
    default:
      throw new InvalidValueError(`Unhandled name use '${fhirNameUse}'.`, fhirPath + ".use")
  }
}

export function convertTelecom(fhirTelecom: fhir.ContactPoint, fhirPath: string): hl7V3.Telecom {
  const hl7V3TelecomUse = convertTelecomUse(fhirTelecom.use, fhirPath)
  //TODO - do we need to add "tel:", "mailto:" to the value?
  return new hl7V3.Telecom(hl7V3TelecomUse, fhirTelecom.value)
}

function convertTelecomUse(fhirTelecomUse: string, fhirPath: string) {
  switch (fhirTelecomUse) {
    case "home":
      return hl7V3.TelecomUse.PERMANENT_HOME
    case "work":
      return hl7V3.TelecomUse.WORKPLACE
    case "temp":
      return hl7V3.TelecomUse.TEMPORARY
    case "mobile":
      return hl7V3.TelecomUse.MOBILE
    default:
      throw new InvalidValueError(`Unhandled telecom use '${fhirTelecomUse}'.`, fhirPath + ".use")
  }
}

export function convertAddress(fhirAddress: fhir.Address, fhirPath: string): hl7V3.Address {
  const allAddressLines = [
    fhirAddress.line,
    fhirAddress.city,
    fhirAddress.district,
    fhirAddress.state
  ].flat().filter(isTruthy)
  const hl7V3Address = new hl7V3.Address(convertAddressUse(fhirAddress.use, fhirPath))
  hl7V3Address.streetAddressLine = allAddressLines.map(line => new hl7V3.Text(line))
  if (fhirAddress.postalCode !== undefined){
    hl7V3Address.postalCode = new hl7V3.Text(fhirAddress.postalCode)
  }
  return hl7V3Address
}

function convertAddressUse(fhirAddressUse: string, fhirPath: string) {
  switch (fhirAddressUse) {
    case "home":
      return hl7V3.AddressUse.HOME
    case "work":
      return hl7V3.AddressUse.WORK
    case "temp":
      return hl7V3.AddressUse.TEMPORARY
    case "billing":
      return hl7V3.AddressUse.POSTAL
    case undefined:
      return undefined
    default:
      throw new InvalidValueError(`Unhandled address use '${fhirAddressUse}'.`, fhirPath + ".use")
  }
}

export function convertGender(fhirGender: string, fhirPath: string): hl7V3.SexCode {
  switch (fhirGender) {
    case "male":
      return hl7V3.SexCode.MALE
    case "female":
      return hl7V3.SexCode.FEMALE
    case "other":
      return hl7V3.SexCode.INDETERMINATE
    case "unknown":
      return hl7V3.SexCode.UNKNOWN
    default:
      throw new InvalidValueError(`Unhandled gender '${fhirGender}'.`, fhirPath)
  }
}
