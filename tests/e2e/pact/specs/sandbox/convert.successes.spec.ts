import {InteractionObject, Matchers} from "@pact-foundation/pact"
import * as jestpact from "jest-pact"
import supertest from "supertest"
import * as TestResources from "../../resources/test-resources"
import * as LosslessJson from "lossless-json"
import * as uuid from "uuid"
import {basePath, pactOptions} from "../../resources/common"
import {fhir} from "@models"

jestpact.pactWith(
  pactOptions("sandbox", "convert"),
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  async (provider: any) => {
    const client = () => {
      const url = `${provider.mockService.baseUrl}`
      return supertest(url)
    }

    describe("convert sandbox e2e tests", () => {
      const apiPath = `${basePath}/$convert`
      test.each(TestResources.convertCaseGroups)(
        "should be able to convert %s message to HL7V3",
        async (desc: string, request: fhir.Bundle, response: string, responseMatcher: string) => {
          const regex = new RegExp(responseMatcher)
          const isMatch = regex.test(response)
          expect(isMatch).toBe(true)

          const requestStr = LosslessJson.stringify(request)
          const requestJson = JSON.parse(requestStr)

          const requestId = uuid.v4()
          const correlationId = uuid.v4()

          const interaction: InteractionObject = {
            state: "is not authenticated",
            uponReceiving: `a request to convert ${desc} message`,
            withRequest: {
              headers: {
                "Content-Type": "application/fhir+json; fhirVersion=4.0",
                "X-Request-ID": requestId,
                "X-Correlation-ID": correlationId
              },
              method: "POST",
              path: apiPath,
              body: requestJson
            },
            willRespondWith: {
              headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "X-Request-ID": requestId,
                "X-Correlation-ID": correlationId
              },
              body: Matchers.regex({matcher: responseMatcher, generate: response}),
              status: 200
            }
          }
          await provider.addInteraction(interaction)
          await client()
            .post(apiPath)
            .set("Content-Type", "application/fhir+json; fhirVersion=4.0")
            .set("X-Request-ID", requestId)
            .set("X-Correlation-ID", correlationId)
            .send(requestStr)
            .expect(200)
        }
      )
    })
  }
)
