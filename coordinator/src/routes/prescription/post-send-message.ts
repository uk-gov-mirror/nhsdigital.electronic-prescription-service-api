import * as translator from "../../services/translation"
import {Bundle} from "../../models/fhir/fhir-resources"
import {requestHandler} from "../../services/handlers"
import Hapi from "@hapi/hapi"
import {handleResponse, validatingHandler} from "../util"

export default [
  /*
      Send a signed message on to SPINE.
    */
  {
    method: "POST",
    path: "/$process-message",
    handler: validatingHandler(
      false,
      async (requestPayload: Bundle, responseToolkit: Hapi.ResponseToolkit) => {
        const translatedMessage = translator.convertFhirMessageToHl7V3ParentPrescriptionMessage(requestPayload)
        const spineResponse = await requestHandler.send(translatedMessage)
        return handleResponse(spineResponse, responseToolkit)
      }
    )
  }
]
