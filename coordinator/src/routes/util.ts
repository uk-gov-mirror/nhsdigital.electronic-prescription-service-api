import {fhir, spine, validationErrors as errors} from "@models"
import Hapi from "@hapi/hapi"
import {translateToFhir} from "../services/translation/response"
import * as LosslessJson from "lossless-json"
import axios from "axios"
import stream from "stream"
import * as crypto from "crypto-js"
import {userHasValidAuth} from "../services/validation/auth-level"
import {identifyMessageType} from "../services/translation/common"

type HapiPayload = string | object | Buffer | stream //eslint-disable-line @typescript-eslint/ban-types

export const CONTENT_TYPE_XML = "application/xml"
export const CONTENT_TYPE_PLAIN_TEXT = "text/plain"
export const CONTENT_TYPE_FHIR = "application/fhir+json; fhirVersion=4.0"
export const CONTENT_TYPE_JSON = "application/json"
export const VALIDATOR_HOST = "http://localhost:9001"
export const BASE_PATH = "/FHIR/R4"

export function createHash(thingsToHash: string): string {
  return crypto.SHA256(thingsToHash).toString()
}

export function handleResponse<T>(
  request: Hapi.Request,
  spineResponse: spine.SpineDirectResponse<T> | spine.SpinePollableResponse,
  responseToolkit: Hapi.ResponseToolkit
): Hapi.ResponseObject {
  if (spine.isPollable(spineResponse)) {
    return responseToolkit.response()
      .code(spineResponse.statusCode)
      .header("Content-Location", spineResponse.pollingUrl)
  } else if (isOperationOutcome(spineResponse.body) || isBundle(spineResponse.body)) {
    return responseToolkit.response(spineResponse.body)
      .code(spineResponse.statusCode)
      .type(CONTENT_TYPE_FHIR)
  } else {
    const translatedSpineResponse = translateToFhir(spineResponse, request.logger)
    return responseToolkit.response(translatedSpineResponse.fhirResponse)
      .code(translatedSpineResponse.statusCode)
      .type(CONTENT_TYPE_FHIR)
  }
}

export function isOperationOutcome(body: unknown): body is fhir.OperationOutcome {
  return isFhirResourceOfType(body, "OperationOutcome")
}

export function isBundle(body: unknown): body is fhir.Bundle {
  return isFhirResourceOfType(body, "Bundle")
}

export function isParameters(body: unknown): body is fhir.Parameters {
  return isFhirResourceOfType(body, "Parameters")
}

export function isTask(body: unknown): body is fhir.Task {
  return isFhirResourceOfType(body, "Task")
}

function isFhirResourceOfType(body: unknown, resourceType: string) {
  return typeof body === "object"
    && "resourceType" in body
    && (body as fhir.Resource).resourceType === resourceType
}

const getCircularReplacer = () => {
  const seen = new WeakSet()
  return (key: string, value: unknown) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return
      }
      seen.add(value)
    }
    return value
  }
}

export async function callFhirValidator(
  payload: HapiPayload,
  requestHeaders: Hapi.Util.Dictionary<string>
): Promise<fhir.OperationOutcome> {
  const validatorResponse = await axios.post(
    `${VALIDATOR_HOST}/$validate`,
    payload.toString(),
    {
      headers: {
        "Content-Type": requestHeaders["content-type"]
      }
    }
  )

  const validatorResponseData = validatorResponse.data
  if (!validatorResponseData) {
    throw new TypeError("No response from validator")
  }

  if (!isOperationOutcome(validatorResponseData)) {
    throw new TypeError(`Unexpected response from validator:\n${
      JSON.stringify(validatorResponseData, getCircularReplacer())
    }`)
  }
  return validatorResponseData
}

export async function getFhirValidatorErrors(
  request: Hapi.Request
): Promise<fhir.OperationOutcome> {
  if (request.headers["x-skip-validation"]) {
    request.logger.info("Skipping call to FHIR validator")
  } else {
    request.logger.info("Making call to FHIR validator")
    const validatorResponseData = await callFhirValidator(request.payload, request.headers)
    request.logger.info("Received response from FHIR validator")
    const error = validatorResponseData.issue.find(issue => issue.severity === "error" || issue.severity === "fatal")
    if (error) {
      return validatorResponseData
    }
  }
  return null
}

type Handler = (request: Hapi.Request, responseToolkit: Hapi.ResponseToolkit) => Promise<Hapi.ResponseObject>

export function externalValidator(handler: Handler) {
  return async (request: Hapi.Request, responseToolkit: Hapi.ResponseToolkit): Promise<Hapi.ResponseObject> => {
    const fhirValidatorResponse = await getFhirValidatorErrors(request)
    if (fhirValidatorResponse) {
      return responseToolkit.response(fhirValidatorResponse).code(400).type(CONTENT_TYPE_FHIR)
    }

    return handler(request, responseToolkit)
  }
}

export function userAuthValidator(handler: Handler) {
  return async (request: Hapi.Request, responseToolkit: Hapi.ResponseToolkit): Promise<Hapi.ResponseObject> => {
    const bundle = getPayload(request) as fhir.Bundle
    if (identifyMessageType(bundle) !== fhir.EventCodingCode.DISPENSE) {
      if (!userHasValidAuth(request, "user")) {
        return responseToolkit.response(errors.unauthorisedActionIssue).code(403).type(CONTENT_TYPE_FHIR)
      }
    }

    return handler(request, responseToolkit)
  }
}

export function getPayload(request: Hapi.Request): unknown {
  request.logger.info("Parsing request payload")
  if (Buffer.isBuffer(request.payload)) {
    return LosslessJson.parse(request.payload.toString())
  } else if (typeof request.payload === "string") {
    return LosslessJson.parse(request.payload)
  } else {
    return {}
  }
}
