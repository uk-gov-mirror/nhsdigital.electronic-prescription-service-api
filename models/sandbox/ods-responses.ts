import * as fhir from "../fhir"

export const ORGANIZATION_FH542_COMMUNITY_PHARMACY: fhir.Organization = {
  resourceType: "Organization",
  identifier: [{
    system: "https://fhir.nhs.uk/Id/ods-organization-code",
    value: "FH542"
  }],
  type: [{
    coding: [{
      system: "https://fhir.nhs.uk/CodeSystem/organisation-role",
      code: "182"
    }]
  }],
  name: "COHENS CHEMIST",
  telecom: [
    {
      system: "phone",
      value: "01132 864065"
    }
  ],
  address: [{
    line: [
      "9 FAIRBURN DRIVE",
      "GARFORTH"
    ],
    city: "LEEDS",
    district: "WEST YORKSHIRE",
    postalCode: "LS25 2AR",
    country: "ENGLAND"
  }]
}

export const ORGANIZATION_FTX40_HOMECARE: fhir.Organization = {
  resourceType: "Organization",
  identifier: [{
    system: "https://fhir.nhs.uk/Id/ods-organization-code",
    value: "FTX40"
  }],
  type: [{
    coding: [{
      system: "https://fhir.nhs.uk/CodeSystem/organisation-role",
      code: "182"
    }]
  }],
  name: "HEALTHCARE AT HOME",
  telecom: [{
    system: "phone",
    value: "0870 6001540"
  }],
  address: [{
    line: [
      "FIFTH AVENUE",
      "CENTRUM ONE HUNDRED"
    ],
    city: "BURTON-ON-TRENT",
    district: "STAFFORDSHIRE",
    postalCode: "DE14 2WS",
    country: "ENGLAND"
  }]
}

export const ORGANIZATION_T1450_NHS_BSA: fhir.Organization = {
  resourceType: "Organization",
  identifier: [{
    system: "https://fhir.nhs.uk/Id/ods-organization-code",
    value: "T1450"
  }],
  type: [{
    coding: [{
      system: "https://fhir.nhs.uk/CodeSystem/organisation-role",
      code: "189"
    }]
  }],
  name: "NHS BUSINESS SERVICES AUTHORITY",
  telecom: [
    {
      system: "fax",
      value: "01253 774514"
    },
    {
      system: "phone",
      value: "01253 774442"
    }
  ],
  address: [{
    line: [
      "STELLA HOUSE",
      "GOLDCREST WAY",
      "NEWBURN RIVERSIDE PARK"
    ],
    city: "NEWCASTLE UPON TYNE",
    district: "TYNE AND WEAR",
    postalCode: "NE15 8NY",
    country: "ENGLAND"
  }]
}

export const ORGANIZATION_VNE51_HOMECARE: fhir.Organization = {
  resourceType: "Organization",
  identifier: [{
    system: "https://fhir.nhs.uk/Id/ods-organization-code",
    value: "VNE51"
  }],
  type: [{
    coding: [{
      system: "https://fhir.nhs.uk/CodeSystem/organisation-role",
      code: "101"
    }]
  }],
  name: "HEALTH AND CARE AT HOME",
  address: [{
    line: [
      "THE HEALTH & WELLBEING INNOVATION C",
      "TRELISKE"
    ],
    city: "TRURO",
    district: "CORNWALL",
    postalCode: "TR1 3FF",
    country: "ENGLAND"
  }]
}
