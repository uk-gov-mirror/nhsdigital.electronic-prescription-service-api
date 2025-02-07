import {InteractionObject} from "@pact-foundation/pact"
import * as jestpact from "jest-pact"
import supertest from "supertest"
import * as LosslessJson from "lossless-json"
import * as uuid from "uuid"
import * as TestResources from "../../resources/test-resources"
import {basePath, pactOptions} from "../../resources/common"
import {fetcher, fhir} from "@models"

jestpact.pactWith(
  pactOptions("sandbox", "process", "send"),
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  async (provider: any) => {
    const client = () => {
      const url = `${provider.mockService.baseUrl}`
      return supertest(url)
    }

    describe("process-message send sandbox e2e tests", () => {
      test.each(TestResources.processOrderCaseGroups)(
        "should be able to send %s",
        async (desc: string, message: fhir.Bundle) => {
          const apiPath = `${basePath}/$process-message`
          const messageStr = LosslessJson.stringify(message)
          const requestId = uuid.v4()
          const correlationId = uuid.v4()
          const interaction: InteractionObject = {
            state: "is not authenticated",
            uponReceiving: `a request to process ${desc} message to Spine`,
            withRequest: {
              headers: {
                "Content-Type": "application/fhir+json; fhirVersion=4.0",
                "X-Request-ID": requestId,
                "X-Correlation-ID": correlationId
              },
              method: "POST",
              path: apiPath,
              body: JSON.parse(messageStr)
            },
            willRespondWith: {
              headers: {
                "Content-Type": "application/json",
                "X-Request-ID": requestId,
                "X-Correlation-ID": correlationId
              },
              status: 200
            }
          }
          await provider.addInteraction(interaction)
          await client()
            .post(apiPath)
            .set("Content-Type", "application/fhir+json; fhirVersion=4.0")
            .set("X-Request-ID", requestId)
            .set("X-Correlation-ID", correlationId)
            .send(messageStr)
            .expect(200)
        }
      )
    })
  }
)

jestpact.pactWith(
  pactOptions("sandbox", "process", "cancel"),
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  async (provider: any) => {
    const client = () => {
      const url = `${provider.mockService.baseUrl}`
      return supertest(url)
    }

    describe("process-message cancel sandbox e2e tests", () => {
      test.each(TestResources.processOrderUpdateCaseGroups)(
        "should be able to cancel %s",
        async (desc: string, message: fhir.Bundle) => {
          const apiPath = `${basePath}/$process-message`
          const messageStr = LosslessJson.stringify(message)
          const requestId = uuid.v4()
          const correlationId = uuid.v4()
          const interaction: InteractionObject = {
            state: "is not authenticated",
            uponReceiving: `a request to send ${desc} message to Spine`,
            withRequest: {
              headers: {
                "Content-Type": "application/fhir+json; fhirVersion=4.0",
                "X-Request-ID": requestId,
                "X-Correlation-ID": correlationId
              },
              method: "POST",
              path: apiPath,
              body: JSON.parse(messageStr)
            },
            willRespondWith: {
              headers: {
                "Content-Type": "application/json",
                "X-Request-ID": requestId,
                "X-Correlation-ID": correlationId
              },
              //TODO - Verify response body for cancellations
              status: 200
            }
          }
          await provider.addInteraction(interaction)
          await client()
            .post(apiPath)
            .set("Content-Type", "application/fhir+json; fhirVersion=4.0")
            .set("X-Request-ID", requestId)
            .set("X-Correlation-ID", correlationId)
            .send(messageStr)
            .expect(200)
        }
      )
    })
  }
)

jestpact.pactWith(
  pactOptions("sandbox", "process", "dispense"),
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  async (provider: any) => {
    const client = () => {
      const url = `${provider.mockService.baseUrl}`
      return supertest(url)
    }

    describe("process-message dispense sandbox e2e tests", () => {
        test.each(TestResources.processDispenseNotificationCaseGroups)(
          "should be able to dispense %s",
          async (desc: string, message: fhir.Bundle) => {
            const apiPath = `${basePath}/$process-message`
            const bundleStr = LosslessJson.stringify(message)
            const bundle = JSON.parse(bundleStr) as fhir.Bundle

            const requestId = uuid.v4()
            const correlationId = uuid.v4()

            const interaction: InteractionObject = {
              state: "is authenticated",
              uponReceiving: `a request to process ${desc} message to Spine`,
              withRequest: {
                headers: {
                  "Content-Type": "application/fhir+json; fhirVersion=4.0",
                  "X-Request-ID": requestId,
                  "X-Correlation-ID": correlationId
                },
                method: "POST",
                path: apiPath,
                body: bundle
              },
              willRespondWith: {
                headers: {
                  "Content-Type": "application/json"
                },
                //TODO - Verify response body for dispensation
                status: 200
              }
            }
            await provider.addInteraction(interaction)
            await client()
            .post(apiPath)
            .set("Content-Type", "application/fhir+json; fhirVersion=4.0")
            .set("X-Request-ID", requestId)
            .set("X-Correlation-ID", correlationId)
            .send(bundleStr)
            .expect(200)
          }
        )
    })
})

jestpact.pactWith(
  pactOptions("sandbox", "process", "send"),
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  async (provider: any) => {
    const client = () => {
      const url = `${provider.mockService.baseUrl}`
      return supertest(url)
    }

    describe("process-message accept-header sandbox e2e tests", () => {

      test("Should be able to process a FHIR JSON Accept header", async () => {
        const testCase = fetcher.processExamples[0]

        const apiPath = `${basePath}/$process-message`
        const messageStr = LosslessJson.stringify(testCase.request)
        const requestId = uuid.v4()
        const correlationId = uuid.v4()

        const interaction: InteractionObject = {
          state: "is not authenticated",
          uponReceiving: `a request to process a message with a FHIR JSON Accept header`,
          withRequest: {
            headers: {
              "Content-Type": "application/fhir+json; fhirVersion=4.0",
              "Accept": "application/fhir+json",
              "X-Request-ID": requestId,
              "X-Correlation-ID": correlationId
            },
            method: "POST",
            path: apiPath,
            body: JSON.parse(messageStr)
          },
          willRespondWith: {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "X-Request-ID": requestId,
              "X-Correlation-ID": correlationId
            }
          }
        }
        await provider.addInteraction(interaction)
        await client()
          .post(apiPath)
          .set("Content-Type", "application/fhir+json; fhirVersion=4.0")
          .set("Accept", "application/fhir+json")
          .set("X-Request-ID", requestId)
          .set("X-Correlation-ID", correlationId)
          .send(messageStr)
          .expect(200)
      })
    })
  }
)
