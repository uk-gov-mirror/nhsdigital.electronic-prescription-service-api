import axios from "axios"
import pino from "pino"
import {fhir} from "../../../../models/library"
import {OdsClient} from "./ods-client"
import {convertToOrganization, OdsOrganization} from "./ods-organization"

//TODO - pass in as an env var
const ODS_API_URL = "https://directory.spineservices.nhs.uk/STU3"

export class LiveOdsClient implements OdsClient {
  async lookupOrganization(odsCode: string, logger: pino.Logger): Promise<fhir.Organization> {
    logger.info(`Performing ODS lookup for code ${odsCode}`)
    const url = `${ODS_API_URL}/Organization/${odsCode}`
    try {
      const result = await axios.get<OdsOrganization>(url)
      if (result.status != 200) {
        logger.error(`Failed ODS lookup for path ${url}. StatusCode: ${result.status}`)
        return null
      }
      return convertToOrganization(result.data)
    } catch (error) {
      logger.error(`Failed ODS lookup for path ${url}. Error: ${error}`)
      return null
    }
  }
}
