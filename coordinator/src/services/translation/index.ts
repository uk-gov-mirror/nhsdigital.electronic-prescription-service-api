import * as XmlJs from "xml-js"
import * as codes from "../../models/hl7-v3/hl7-v3-datatypes-codes"
import * as core from "../../models/hl7-v3/hl7-v3-datatypes-core"
import * as prescriptions from "../../models/hl7-v3/hl7-v3-prescriptions"
import * as fhir from "../../models/fhir/fhir-resources"
import * as cancellations from "../../models/hl7-v3/hl7-v3-cancellation"
import path from "path"
import * as crypto from "crypto-js"
import Mustache from "mustache"
import fs from "fs"
import {createSendMessagePayload} from "./messaging/send-message-payload"
import {writeXmlStringCanonicalized} from "../serialisation/xml"
import {convertParentPrescription} from "./prescription/parent-prescription"
import {convertCancellation} from "./prescription/cancellation"
import {
  convertFragmentsToDisplayableFormat,
  convertFragmentsToHashableFormat,
  extractFragments
} from "./prescription/signature"
import {getIdentifierValueForSystem} from "./common"
import {Display} from "../../models/signature"
import * as requestBuilder from "../formatters/ebxml-request-builder"
import {SpineRequest} from "../../models/spine"
import {identifyMessageType, MessageType} from "../../routes/util"

export function convertFhirMessageToSpineRequest(fhirMessage: fhir.Bundle): SpineRequest {
  const messageType = identifyMessageType(fhirMessage)
  return messageType === MessageType.PRESCRIPTION
    ? requestBuilder.toSpineRequest(createParentPrescriptionSendMessagePayload(fhirMessage))
    : requestBuilder.toSpineRequest(createCancellationSendMessagePayload(fhirMessage))
}

export function createParentPrescriptionSendMessagePayload(
  fhirBundle: fhir.Bundle
): core.SendMessagePayload<prescriptions.ParentPrescriptionRoot> {
  const messageId = getIdentifierValueForSystem(
    [fhirBundle.identifier],
    "https://tools.ietf.org/html/rfc4122",
    "Bundle.identifier"
  )
  const parentPrescription = convertParentPrescription(fhirBundle)
  const parentPrescriptionRoot = new prescriptions.ParentPrescriptionRoot(parentPrescription)
  const interactionId = codes.Hl7InteractionIdentifier.PARENT_PRESCRIPTION_URGENT
  return createSendMessagePayload(messageId, interactionId, fhirBundle, parentPrescriptionRoot)
}

export function createCancellationSendMessagePayload(
  fhirBundle: fhir.Bundle
): core.SendMessagePayload<cancellations.CancellationPrescriptionRoot> {
  const messageId = getIdentifierValueForSystem(
    [fhirBundle.identifier],
    "https://tools.ietf.org/html/rfc4122",
    "Bundle.identifier"
  )
  const cancellationRequest = convertCancellation(fhirBundle)
  const cancellationRequestRoot = new cancellations.CancellationPrescriptionRoot(cancellationRequest)
  const interactionId = codes.Hl7InteractionIdentifier.CANCEL_REQUEST
  return createSendMessagePayload(messageId, interactionId, fhirBundle, cancellationRequestRoot)
}

export function convertFhirMessageToSignedInfoMessage(fhirMessage: fhir.Bundle): string {
  //TODO - check message header and reject if this is not an order
  const parentPrescription = convertParentPrescription(fhirMessage)
  const fragments = extractFragments(parentPrescription)

  const fragmentsToBeHashed = convertFragmentsToHashableFormat(fragments)
  const base64Fragments = Buffer.from(fragmentsToBeHashed).toString("base64")
  const base64Digest = createParametersDigest(fragmentsToBeHashed)

  const fragmentsToDisplay = convertFragmentsToDisplayableFormat(fragments)
  const base64Display = createParametersDisplay(fragmentsToDisplay)

  const parameters = createParameters(base64Fragments, base64Digest, base64Display)
  return JSON.stringify(parameters, null, 2)
}

function createParametersDigest(fragmentsToBeHashed: string): string {
  const digestValue = crypto.SHA1(fragmentsToBeHashed).toString(crypto.enc.Base64)

  const signedInfo = {
    SignedInfo: {
      _attributes: {
        xmlns: "http://www.w3.org/2000/09/xmldsig#"
      },
      CanonicalizationMethod: new AlgorithmIdentifier("http://www.w3.org/2001/10/xml-exc-c14n#"),
      SignatureMethod: new AlgorithmIdentifier("http://www.w3.org/2000/09/xmldsig#rsa-sha1"),
      Reference: {
        Transforms: {
          Transform: new AlgorithmIdentifier("http://www.w3.org/2001/10/xml-exc-c14n#")
        },
        DigestMethod: new AlgorithmIdentifier("http://www.w3.org/2000/09/xmldsig#sha1"),
        DigestValue: digestValue
      }
    }
  } as XmlJs.ElementCompact

  return Buffer.from(writeXmlStringCanonicalized(signedInfo)).toString("base64")
}

function createParametersDisplay(fragmentsToDisplay: Display): string {
  const displayTemplate = fs.readFileSync(path.join(__dirname, "../../resources/message_display.mustache"), "utf-8")
    .replace(/\n/g, "\r\n")
  return Buffer.from(Mustache.render(displayTemplate, fragmentsToDisplay)).toString("base64")
}

function createParameters(base64Fragments: string, base64Digest: string, base64Display: string): fhir.Parameters {
  const parameters: Array<fhir.Parameter> = []
  parameters.push({name: "fragments", valueString: base64Fragments})
  parameters.push({name: "digest", valueString: base64Digest})
  parameters.push({name: "display", valueString: base64Display})
  parameters.push({name: "algorithm", valueString: "RS1"})
  return new fhir.Parameters(parameters)
}

class AlgorithmIdentifier implements XmlJs.ElementCompact {
  _attributes: {
    Algorithm: string
  }

  constructor(algorithm: string) {
    this._attributes = {
      Algorithm: algorithm
    }
  }
}
